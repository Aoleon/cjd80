import { Module, Global } from '@nestjs/common';
import { databaseProviders, DATABASE } from './database.providers';

// Export DATABASE for use in other modules
export { DATABASE };

@Global()
@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}

