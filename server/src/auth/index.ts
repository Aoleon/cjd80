// Auth module exports - Replace @robinswood/auth-shared package

// Guards
export { JwtAuthGuard } from './jwt-auth.guard';

// Decorators
export { CurrentUser as User } from './decorators/current-user.decorator';
export { CurrentUser } from './decorators/current-user.decorator';
export { Public } from './decorators/public.decorator';

// Interfaces (to be defined if needed)
export interface IAuthUser {
  email: string;
  role?: string;
  id?: string;
  [key: string]: any;
}

export interface IAuthStorageAdapter {
  getUserByEmail(email: string): Promise<IAuthUser | null>;
  updateUser(email: string, data: Partial<IAuthUser>): Promise<void>;
  createUser(user: IAuthUser): Promise<void>;
}
