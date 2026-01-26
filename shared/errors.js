"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.BadRequestError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(status, message, code) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'ApiError';
        const captureStackTrace = Error.captureStackTrace;
        if (typeof captureStackTrace === 'function') {
            captureStackTrace(this, this.constructor);
        }
    }
}
exports.ApiError = ApiError;
class NotFoundError extends ApiError {
    constructor(message = 'Resource not found', code) {
        super(404, message, code || 'NOT_FOUND');
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized', code) {
        super(401, message, code || 'UNAUTHORIZED');
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden', code) {
        super(403, message, code || 'FORBIDDEN');
    }
}
exports.ForbiddenError = ForbiddenError;
class BadRequestError extends ApiError {
    constructor(message = 'Bad request', code) {
        super(400, message, code || 'BAD_REQUEST');
    }
}
exports.BadRequestError = BadRequestError;
class InternalServerError extends ApiError {
    constructor(message = 'Internal server error', code) {
        super(500, message, code || 'INTERNAL_SERVER_ERROR');
    }
}
exports.InternalServerError = InternalServerError;
