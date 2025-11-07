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

