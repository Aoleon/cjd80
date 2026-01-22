import { Injectable } from '@nestjs/common';
import { DatabaseStorage, IStorage } from '../../../storage';
import { logger } from '../../../lib/logger';

/**
 * Service NestJS qui wrappe DatabaseStorage
 * Expose l'instance DatabaseStorage directement pour éviter de réécrire toutes les méthodes
 *
 * IMPORTANT: Ce service peut fonctionner en mode dégradé si la DB n'est pas disponible
 */
@Injectable()
export class StorageService {
  public readonly storage: DatabaseStorage | null;

  constructor() {
    try {
      this.storage = new DatabaseStorage();
      logger.info('StorageService initialized successfully', {
        hasStorage: !!this.storage,
        storageType: this.storage ? this.storage.constructor.name : 'null'
      });
    } catch (error) {
      logger.warn('Failed to initialize DatabaseStorage - service will operate in degraded mode', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      this.storage = null;
    }
  }

  // Exposer sessionStore pour compatibilité
  get sessionStore() {
    if (!this.storage) {
      throw new Error('DatabaseStorage not available - application running in degraded mode');
    }
    return this.storage.sessionStore;
  }

  // Exposer l'instance comme IStorage pour l'injection
  get instance(): IStorage {
    if (!this.storage) {
      throw new Error('DatabaseStorage not available - application running in degraded mode');
    }
    return this.storage as IStorage;
  }
}

