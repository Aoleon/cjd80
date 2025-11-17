import multer from 'multer';
import { join } from 'path';
import { promises as fs } from 'fs';
import { nanoid } from 'nanoid';
import { logger } from '../lib/logger';

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = join(process.cwd(), 'public', 'uploads', 'loan-items');
fs.mkdir(uploadsDir, { recursive: true }).catch(err => {
  if (err.code !== 'EEXIST') {
    logger.error('Error creating uploads directory', { error: err });
  }
});

// Configuration du stockage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    } catch (error) {
      cb(error as Error, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    // Générer un nom unique : timestamp-nanoid.extension
    const ext = file.originalname.split('.').pop() || 'jpg';
    const uniqueName = `${Date.now()}-${nanoid(10)}.${ext}`;
    cb(null, uniqueName);
  }
});

// Filtre pour accepter uniquement les images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non autorisé. Formats acceptés: JPG, PNG, WebP'));
  }
};

// Configuration multer
export const uploadLoanItemPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  }
});

// Middleware pour uploader une seule photo
export const singlePhotoUpload = uploadLoanItemPhoto.single('photo');

// Fonction utilitaire pour obtenir l'URL publique d'une photo
export function getPhotoUrl(filename: string): string {
  return `/uploads/loan-items/${filename}`;
}

// Fonction pour supprimer une photo
export async function deletePhoto(filename: string): Promise<void> {
  try {
    const filePath = join(uploadsDir, filename);
    await fs.unlink(filePath);
    logger.info('Photo deleted', { filename });
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      logger.error('Error deleting photo', { filename, error });
      throw error;
    }
    // Fichier déjà supprimé, pas d'erreur
  }
}

// Configuration pour l'upload de logo (dans attached_assets)
const logoUploadsDir = join(process.cwd(), 'attached_assets');
fs.mkdir(logoUploadsDir, { recursive: true }).catch(err => {
  if (err.code !== 'EEXIST') {
    logger.error('Error creating logo uploads directory', { error: err });
  }
});

const logoStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(logoUploadsDir, { recursive: true });
      cb(null, logoUploadsDir);
    } catch (error) {
      cb(error as Error, logoUploadsDir);
    }
  },
  filename: (req, file, cb) => {
    // Générer un nom unique : logo-timestamp-nanoid.extension
    const ext = file.originalname.split('.').pop() || 'jpg';
    const uniqueName = `logo-${Date.now()}-${nanoid(10)}.${ext}`;
    cb(null, uniqueName);
  }
});

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

// Fonction utilitaire pour obtenir le nom du fichier logo depuis l'URL
export function getLogoFilename(logoUrl: string): string | null {
  // Format: /uploads/logos/logo-1234567890-abc123.jpg
  // ou: @assets/logo-1234567890-abc123.jpg
  const match = logoUrl.match(/(?:logo-[\d]+-[a-zA-Z0-9]+\.\w+)$/);
  return match ? match[0] : null;
}

// Fonction pour supprimer un logo
export async function deleteLogo(filename: string): Promise<void> {
  try {
    const filePath = join(logoUploadsDir, filename);
    await fs.unlink(filePath);
    logger.info('Logo deleted', { filename });
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      logger.error('Error deleting logo', { filename, error });
      throw error;
    }
    // Fichier déjà supprimé, pas d'erreur
  }
}

