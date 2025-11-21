import { Client } from 'minio';
import { promises as fs } from 'fs';
import { join } from 'path';
import { readdir, stat } from 'fs/promises';
import { logger } from '../lib/logger';

export class MinIOService {
  private client: Client | null = null;
  private endpoint: string;
  private port: number;
  private externalPort: number; // Port externe pour les URLs (différent du port interne si mappé)
  private useSSL: boolean;
  private accessKey: string;
  private secretKey: string;
  private bucketLoanItems: string;
  private bucketAssets: string;
  private initialized: boolean = false;

  constructor() {
    this.endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    this.port = parseInt(process.env.MINIO_PORT || '9000', 10);
    // Port externe pour les URLs (par défaut 9002 pour éviter conflit avec nhost-minio)
    this.externalPort = parseInt(process.env.MINIO_EXTERNAL_PORT || '9002', 10);
    this.useSSL = process.env.MINIO_USE_SSL === 'true';
    this.accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    this.secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
    this.bucketLoanItems = process.env.MINIO_BUCKET_LOAN_ITEMS || 'loan-items';
    this.bucketAssets = process.env.MINIO_BUCKET_ASSETS || 'assets';
  }

  /**
   * Initialise le client MinIO
   */
  async initialize(): Promise<void> {
    if (this.initialized && this.client) {
      return;
    }

    try {
      this.client = new Client({
        endPoint: this.endpoint,
        port: this.port,
        useSSL: this.useSSL,
        accessKey: this.accessKey,
        secretKey: this.secretKey,
      });

      // Vérifier la connexion en listant les buckets
      try {
        await this.client.listBuckets();
      } catch (listError) {
        logger.warn('MinIO connection test failed, will retry on first operation', { error: listError });
        // Ne pas échouer immédiatement, la connexion peut être établie plus tard
      }

      // Créer les buckets si nécessaire
      await this.ensureBuckets();
      this.initialized = true;
      logger.info('MinIO service initialized', {
        endpoint: this.endpoint,
        port: this.port,
        buckets: [this.bucketLoanItems, this.bucketAssets],
      });
    } catch (error) {
      logger.error('Failed to initialize MinIO service', { error });
      // Ne pas bloquer le démarrage si MinIO n'est pas disponible
      // L'initialisation sera réessayée lors de la première opération
      this.initialized = false;
      throw error;
    }
  }

  /**
   * Crée les buckets s'ils n'existent pas
   */
  async ensureBuckets(): Promise<void> {
    if (!this.client) {
      throw new Error('MinIO client not initialized');
    }

    try {
      const buckets = [this.bucketLoanItems, this.bucketAssets];

      for (const bucket of buckets) {
        const exists = await this.client.bucketExists(bucket);
        if (!exists) {
          await this.client.makeBucket(bucket, 'us-east-1');
          // Configurer la politique publique pour permettre l'accès direct
          await this.client.setBucketPolicy(
            bucket,
            JSON.stringify({
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Principal: { AWS: ['*'] },
                  Action: ['s3:GetObject'],
                  Resource: [`arn:aws:s3:::${bucket}/*`],
                },
              ],
            })
          );
          logger.info('MinIO bucket created', { bucket });
        }
      }
    } catch (error) {
      logger.error('Failed to ensure MinIO buckets', { error });
      throw error;
    }
  }

  /**
   * Upload un fichier vers MinIO
   */
  async uploadFile(
    bucket: string,
    filename: string,
    buffer: Buffer,
    mimetype: string
  ): Promise<void> {
    if (!this.client || !this.initialized) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('MinIO client not initialized');
    }

    try {
      // S'assurer que le bucket existe
      const bucketExists = await this.client.bucketExists(bucket);
      if (!bucketExists) {
        await this.ensureBuckets();
      }

      await this.client.putObject(bucket, filename, buffer, buffer.length, {
        'Content-Type': mimetype,
      });
      logger.debug('File uploaded to MinIO', { bucket, filename, size: buffer.length });
    } catch (error) {
      logger.error('Failed to upload file to MinIO', { bucket, filename, error });
      throw error;
    }
  }

  /**
   * Supprime un fichier de MinIO
   */
  async deleteFile(bucket: string, filename: string): Promise<void> {
    if (!this.client) {
      await this.initialize();
    }

    if (!this.client) {
      throw new Error('MinIO client not initialized');
    }

    try {
      await this.client.removeObject(bucket, filename);
      logger.debug('File deleted from MinIO', { bucket, filename });
    } catch (error: any) {
      // Ignorer l'erreur si le fichier n'existe pas
      if (error.code !== 'NoSuchKey') {
        logger.error('Failed to delete file from MinIO', { bucket, filename, error });
        throw error;
      }
    }
  }

  /**
   * Retourne l'URL directe d'un fichier MinIO
   */
  getFileUrl(bucket: string, filename: string): string {
    const protocol = this.useSSL ? 'https' : 'http';
    const host = this.endpoint === 'minio' ? 'localhost' : this.endpoint;
    // Utiliser le port externe pour les URLs (accessible depuis l'extérieur du conteneur)
    const port = this.endpoint === 'minio' ? this.externalPort : this.port;
    return `${protocol}://${host}:${port}/${bucket}/${filename}`;
  }

  /**
   * Retourne l'URL pour les photos de prêts
   */
  getPhotoUrl(filename: string): string {
    return this.getFileUrl(this.bucketLoanItems, filename);
  }

  /**
   * Retourne l'URL pour les assets (logos)
   */
  getAssetUrl(filename: string): string {
    return this.getFileUrl(this.bucketAssets, filename);
  }

  /**
   * Getter pour le bucket loan-items
   */
  get loanItemsBucket(): string {
    return this.bucketLoanItems;
  }

  /**
   * Getter pour le bucket assets
   */
  get assetsBucket(): string {
    return this.bucketAssets;
  }

  /**
   * Vérifie la santé du service MinIO
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; connected: boolean; buckets: string[]; error?: string }> {
    try {
      if (!this.client) {
        await this.initialize();
      }

      if (!this.client) {
        return {
          status: 'unhealthy',
          connected: false,
          buckets: [],
          error: 'Client not initialized'
        };
      }

      // Vérifier la connexion en listant les buckets
      const buckets = await this.client.listBuckets();
      const bucketNames = buckets.map((b: { name: string }) => b.name);
      
      // Vérifier que les buckets requis existent
      const requiredBuckets = [this.bucketLoanItems, this.bucketAssets];
      const missingBuckets = requiredBuckets.filter((b: string) => !bucketNames.includes(b));
      
      if (missingBuckets.length > 0) {
        // Créer les buckets manquants
        await this.ensureBuckets();
      }

      return {
        status: 'healthy',
        connected: true,
        buckets: bucketNames
      };
    } catch (error: any) {
      logger.error('MinIO health check failed', { error });
      return {
        status: 'unhealthy',
        connected: false,
        buckets: [],
        error: error.message || 'Unknown error'
      };
    }
  }

  /**
   * Migre les fichiers locaux vers MinIO
   */
  async migrateLocalFiles(deleteAfterMigration: boolean = false): Promise<{
    loanItems: { success: number; errors: number };
    assets: { success: number; errors: number };
  }> {
    if (!this.client) {
      await this.initialize();
    }

    const results = {
      loanItems: { success: 0, errors: 0 },
      assets: { success: 0, errors: 0 },
    };

    try {
      // Migrer les photos de prêts
      const loanItemsDir = join(process.cwd(), 'public', 'uploads', 'loan-items');
      try {
        const files = await readdir(loanItemsDir);
        for (const file of files) {
          try {
            const filePath = join(loanItemsDir, file);
            const stats = await stat(filePath);
            if (stats.isFile()) {
              const buffer = await fs.readFile(filePath);
              // Déterminer le mimetype depuis l'extension
              const ext = file.split('.').pop()?.toLowerCase();
              const mimetype = this.getMimeType(ext || '');
              await this.uploadFile(this.bucketLoanItems, file, buffer, mimetype);
              results.loanItems.success++;

              if (deleteAfterMigration) {
                await fs.unlink(filePath);
              }
            }
          } catch (error) {
            logger.error('Failed to migrate loan item file', { file, error });
            results.loanItems.errors++;
          }
        }
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          logger.warn('Loan items directory not found or not accessible', { path: loanItemsDir, error });
        }
      }

      // Migrer les assets (logos)
      const assetsDir = join(process.cwd(), 'attached_assets');
      try {
        const files = await readdir(assetsDir);
        for (const file of files) {
          try {
            const filePath = join(assetsDir, file);
            const stats = await stat(filePath);
            if (stats.isFile()) {
              const buffer = await fs.readFile(filePath);
              const ext = file.split('.').pop()?.toLowerCase();
              const mimetype = this.getMimeType(ext || '');
              await this.uploadFile(this.bucketAssets, file, buffer, mimetype);
              results.assets.success++;

              if (deleteAfterMigration) {
                await fs.unlink(filePath);
              }
            }
          } catch (error) {
            logger.error('Failed to migrate asset file', { file, error });
            results.assets.errors++;
          }
        }
      } catch (error: any) {
        if (error.code !== 'ENOENT') {
          logger.warn('Assets directory not found or not accessible', { path: assetsDir, error });
        }
      }

      logger.info('MinIO migration completed', results);
      return results;
    } catch (error) {
      logger.error('Failed to migrate files to MinIO', { error });
      throw error;
    }
  }

  /**
   * Détermine le mimetype depuis l'extension
   */
  private getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
  }
}

// Instance singleton
let minioServiceInstance: MinIOService | null = null;

/**
 * Obtient l'instance singleton du service MinIO
 */
export function getMinIOService(): MinIOService {
  if (!minioServiceInstance) {
    minioServiceInstance = new MinIOService();
  }
  return minioServiceInstance;
}

