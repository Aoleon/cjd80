import express from 'express';
import { createRouter } from '@server/routes';
import type { IStorage } from '@server/storage';

export function createTestApp(mockStorage: IStorage, mockUser?: any) {
  const app = express();
  app.use(express.json());
  
  // Mock authentication middleware
  app.use((req: any, res, next) => {
    req.user = mockUser;
    req.isAuthenticated = () => !!mockUser;
    next();
  });
  
  // Mount the REAL router with mocked storage
  const router = createRouter(mockStorage);
  app.use(router);
  
  return app;
}
