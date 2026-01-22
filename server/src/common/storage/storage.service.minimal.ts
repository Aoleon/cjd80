import { Injectable } from '@nestjs/common';
import session from 'express-session';
import { logger } from '../../../lib/logger';

/**
 * Service NestJS MINIMAL pour tester - juste un MemoryStore sans DatabaseStorage
 */
@Injectable()
export class StorageServiceMinimal {
  public readonly sessionStore: session.Store;

  constructor() {
    logger.info('[StorageServiceMinimal] Initializing with MemoryStore');
    // @ts-ignore
    this.sessionStore = new session.MemoryStore();
    logger.info('[StorageServiceMinimal] ✅ Initialized successfully');
  }
}
