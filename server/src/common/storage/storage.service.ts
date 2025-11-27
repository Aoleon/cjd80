import { Injectable } from '@nestjs/common';
import { DatabaseStorage, IStorage } from '../../../storage';

/**
 * Service NestJS qui wrappe DatabaseStorage
 * Expose l'instance DatabaseStorage directement pour éviter de réécrire toutes les méthodes
 */
@Injectable()
export class StorageService {
  public readonly storage: DatabaseStorage;

  constructor() {
    this.storage = new DatabaseStorage();
  }

  // Exposer sessionStore pour compatibilité
  get sessionStore() {
    return this.storage.sessionStore;
  }

  // Exposer l'instance comme IStorage pour l'injection
  get instance(): IStorage {
    return this.storage as IStorage;
  }
}

