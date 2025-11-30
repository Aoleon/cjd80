import type { Admin } from '../../../shared/schema';

declare global {
  namespace Express {
    interface User extends Admin {}
  }
}

export {};

