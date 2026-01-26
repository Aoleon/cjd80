"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const fs_1 = require("fs");
const path_1 = require("path");
const { combine, timestamp, printf, colorize, errors, json } = winston_1.default.format;
// Utiliser process.cwd() pour que le chemin soit relatif au projet
// En production (Docker), cwd = /app, donc logs = /app/logs
const logsDir = (0, path_1.join)(process.cwd(), 'logs');
if (!(0, fs_1.existsSync)(logsDir)) {
    (0, fs_1.mkdirSync)(logsDir, { recursive: true });
}
// List of sensitive fields to redact from logs
const sensitiveFields = ['password', 'token', 'auth', 'p256dh', 'secret', 'apiKey', 'sessionId'];
// Custom format to sanitize sensitive data
const sanitizeMetadata = winston_1.default.format((info) => {
    if (info.subscription && typeof info.subscription === 'object') {
        info.subscription = { ...info.subscription };
        sensitiveFields.forEach(field => {
            if (info.subscription[field]) {
                info.subscription[field] = '[REDACTED]';
            }
        });
    }
    // Recursively sanitize any object in metadata
    Object.keys(info).forEach(key => {
        if (typeof info[key] === 'object' && info[key] !== null && key !== 'level' && key !== 'message') {
            sensitiveFields.forEach(field => {
                if (info[key][field]) {
                    info[key][field] = '[REDACTED]';
                }
            });
        }
    });
    return info;
});
// Custom format to extract error details
const errorFormat = winston_1.default.format((info) => {
    if (info.error && info.error instanceof Error) {
        info.error = {
            message: info.error.message,
            stack: info.error.stack,
            ...info.error
        };
    }
    return info;
});
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    if (stack) {
        msg += `\n${stack}`;
    }
    return msg;
});
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: combine(sanitizeMetadata(), errorFormat(), errors({ stack: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
    transports: [
        new winston_1.default.transports.Console({
            format: combine(colorize({ all: true }), logFormat)
        }),
        new winston_1.default.transports.File({
            filename: (0, path_1.join)(logsDir, 'combined.log'),
            format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json())
        }),
        new winston_1.default.transports.File({
            filename: (0, path_1.join)(logsDir, 'error.log'),
            level: 'error',
            format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json())
        })
    ]
});
