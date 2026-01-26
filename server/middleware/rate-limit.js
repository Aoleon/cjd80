"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteRateLimiter = exports.strictCreateRateLimiter = exports.createRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("../lib/logger");
// Rate limiter for sensitive endpoints (ideas, votes, inscriptions)
exports.createRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger_1.logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method
        });
        res.status(429).json({
            message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.'
        });
    },
    skip: (req) => {
        // Skip rate limiting for authenticated admin users
        if (req.isAuthenticated && req.isAuthenticated() && req.user?.role === 'super_admin') {
            return true;
        }
        // Skip rate limiting for test environment
        if (process.env.NODE_ENV === 'test') {
            return true;
        }
        return false;
    }
});
// Stricter rate limiter for creation endpoints
exports.strictCreateRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 creations per 15 minutes
    message: 'Trop de créations depuis cette adresse IP, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger_1.logger.warn('Strict rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method
        });
        res.status(429).json({
            message: 'Trop de créations depuis cette adresse IP, veuillez réessayer plus tard.'
        });
    },
    skip: (req) => {
        // Skip rate limiting for authenticated admin users
        if (req.isAuthenticated && req.isAuthenticated() && req.user?.role === 'super_admin') {
            return true;
        }
        // Skip rate limiting for test environment
        if (process.env.NODE_ENV === 'test') {
            return true;
        }
        return false;
    }
});
// Very strict rate limiter for vote endpoints (prevent vote spam)
exports.voteRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 votes per minute
    message: 'Trop de votes depuis cette adresse IP, veuillez ralentir.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger_1.logger.warn('Vote rate limit exceeded', {
            ip: req.ip,
            path: req.path
        });
        res.status(429).json({
            message: 'Trop de votes depuis cette adresse IP, veuillez ralentir.'
        });
    },
    skip: (req) => {
        // Skip rate limiting for authenticated admin users
        if (req.isAuthenticated && req.isAuthenticated() && req.user?.role === 'super_admin') {
            return true;
        }
        // Skip rate limiting for test environment
        if (process.env.NODE_ENV === 'test') {
            return true;
        }
        return false;
    }
});
