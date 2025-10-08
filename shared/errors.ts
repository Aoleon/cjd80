export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(404, message, code || 'NOT_FOUND');
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(401, message, code || 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden', code?: string) {
    super(403, message, code || 'FORBIDDEN');
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request', code?: string) {
    super(400, message, code || 'BAD_REQUEST');
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', code?: string) {
    super(500, message, code || 'INTERNAL_SERVER_ERROR');
  }
}
