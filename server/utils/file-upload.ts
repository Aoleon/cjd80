import multer from 'multer';
import { nanoid } from 'nanoid';
import { logger } from '../lib/logger';
import { getMinIOService } from '../services/minio-service';

// Configuration du stockage en mémoire (pour uploader vers MinIO)
const storage = multer.memoryStorage();

// Extensions autorisées
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Filtre pour accepter uniquement les images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Vérifier le MIME type
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error('Format de fichier non autorisé. Formats acceptés: JPG, PNG, WebP'));
  }
  
  // Vérifier l'extension du fichier
  const ext = file.originalname.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('Extension de fichier non autorisée. Extensions acceptées: .jpg, .jpeg, .png, .webp'));
  }
  
  cb(null, true);
};

// Configuration multer
export const uploadLoanItemPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  }
});

// Middleware pour uploader une seule photo vers MinIO
export const singlePhotoUpload = uploadLoanItemPhoto.single('photo');

// Middleware personnalisé pour uploader la photo vers MinIO après multer
export async function uploadPhotoToMinIO(req: any, res: any, next: any): Promise<void> {
  if (!req.file) {
    return next();
  }

  try {
    const minioService = getMinIOService();
    await minioService.initialize();

    // Générer un nom unique : timestamp-nanoid.extension
    // Valider et normaliser l'extension
    const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return next(new Error('Extension de fichier non autorisée'));
    }
    const uniqueName = `${Date.now()}-${nanoid(10)}.${ext}`;

    // Uploader vers MinIO
    await minioService.uploadFile(
      minioService.loanItemsBucket,
      uniqueName,
      req.file.buffer,
      req.file.mimetype
    );

    // Remplacer le fichier multer par les informations MinIO
    req.file.filename = uniqueName;
    req.file.path = minioService.getPhotoUrl(uniqueName);
    req.file.destination = 'minio';

    logger.debug('Photo uploaded to MinIO', { filename: uniqueName });
    next();
  } catch (error) {
    logger.error('Failed to upload photo to MinIO', { error });
    next(error);
  }
}

// Fonction utilitaire pour obtenir l'URL publique d'une photo
export function getPhotoUrl(filename: string): string {
  const minioService = getMinIOService();
  return minioService.getPhotoUrl(filename);
}

// Fonction pour supprimer une photo
export async function deletePhoto(filename: string): Promise<void> {
  try {
    const minioService = getMinIOService();
    await minioService.initialize();
    await minioService.deleteFile(minioService.loanItemsBucket, filename);
    logger.info('Photo deleted from MinIO', { filename });
  } catch (error: any) {
    logger.error('Error deleting photo from MinIO', { filename, error });
    throw error;
  }
}

// Configuration multer pour logo (mémoire également)
const logoStorage = multer.memoryStorage();

// Configuration multer pour logo
export const uploadLogo = multer({
  storage: logoStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  }
});

// Middleware pour uploader un logo
export const singleLogoUpload = uploadLogo.single('logo');

// Middleware personnalisé pour uploader le logo vers MinIO après multer
export async function uploadLogoToMinIO(req: any, res: any, next: any): Promise<void> {
  if (!req.file) {
    return next();
  }

  try {
    const minioService = getMinIOService();
    await minioService.initialize();

    // Générer un nom unique : logo-timestamp-nanoid.extension
    // Valider et normaliser l'extension
    const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return next(new Error('Extension de fichier non autorisée'));
    }
    const uniqueName = `logo-${Date.now()}-${nanoid(10)}.${ext}`;

    // Uploader vers MinIO
    await minioService.uploadFile(
      minioService.assetsBucket,
      uniqueName,
      req.file.buffer,
      req.file.mimetype
    );

    // Remplacer le fichier multer par les informations MinIO
    req.file.filename = uniqueName;
    req.file.path = minioService.getAssetUrl(uniqueName);
    req.file.destination = 'minio';

    logger.debug('Logo uploaded to MinIO', { filename: uniqueName });
    next();
  } catch (error) {
    logger.error('Failed to upload logo to MinIO', { error });
    next(error);
  }
}

// Fonction utilitaire pour obtenir le nom du fichier logo depuis l'URL
export function getLogoFilename(logoUrl: string): string | null {
  // Formats supportés:
  // - MinIO: http://localhost:9000/assets/logo-1234567890-abc123.jpg
  // - Ancien format: /assets/logo-1234567890-abc123.jpg
  // - Ancien format: @assets/logo-1234567890-abc123.jpg
  // - Ancien format: /uploads/logos/logo-1234567890-abc123.jpg
  
  // Extraire le nom de fichier depuis l'URL (dernière partie après le dernier /)
  const parts = logoUrl.split('/');
  const filename = parts[parts.length - 1];
  
  // Vérifier que c'est bien un logo (commence par "logo-")
  if (filename && filename.startsWith('logo-')) {
    return filename;
  }
  
  // Fallback: chercher avec regex pour compatibilité
  const match = logoUrl.match(/(?:logo-[\d]+-[a-zA-Z0-9]+\.\w+)$/);
  return match ? match[0] : null;
}

// Fonction pour supprimer un logo
export async function deleteLogo(filename: string): Promise<void> {
  try {
    const minioService = getMinIOService();
    await minioService.initialize();
    await minioService.deleteFile(minioService.assetsBucket, filename);
    logger.info('Logo deleted from MinIO', { filename });
  } catch (error: any) {
    logger.error('Error deleting logo from MinIO', { filename, error });
    throw error;
  }
}

