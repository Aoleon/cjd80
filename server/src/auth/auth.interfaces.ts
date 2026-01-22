import { ModuleMetadata, Type } from '@nestjs/common';

/**
 * Options de configuration du module Auth
 */
export interface AuthModuleOptions {
  /**
   * Connexion Drizzle (NodePgDatabase ou équivalent)
   */
  db: any;

  /**
   * Schemas Drizzle pour users et refreshTokens
   */
  schemas: {
    users: any;
    refreshTokens: any;
  };

  /**
   * Configuration optionnelle (override des defaults)
   */
  config?: {
    accessTokenTTL?: string; // Default: '15m'
    refreshTokenTTLDays?: number; // Default: 30
    bcryptRounds?: number; // Default: 10
  };
}

/**
 * Options asynchrones pour forRootAsync
 */
export interface AuthModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<AuthModuleOptions> | AuthModuleOptions;
  inject?: any[];
  useClass?: Type<AuthModuleOptionsFactory>;
  useExisting?: Type<AuthModuleOptionsFactory>;
}

/**
 * Factory pour créer les options du module
 */
export interface AuthModuleOptionsFactory {
  createAuthModuleOptions(): Promise<AuthModuleOptions> | AuthModuleOptions;
}
