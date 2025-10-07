import rateLimit from 'express-rate-limit';
import { logger } from '../lib/logger';

// Rate limiter for sensitive endpoints (ideas, votes, inscriptions)
export const createRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer plus tard.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { 
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
    return req.isAuthenticated && req.isAuthenticated() && req.user?.role === 'super_admin';
  }
});

// Stricter rate limiter for creation endpoints
export const strictCreateRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 creations per 15 minutes
  message: 'Trop de créations depuis cette adresse IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Strict rate limit exceeded', { 
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
    return req.isAuthenticated && req.isAuthenticated() && req.user?.role === 'super_admin';
  }
});

// Very strict rate limiter for vote endpoints (prevent vote spam)
export const voteRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 votes per minute
  message: 'Trop de votes depuis cette adresse IP, veuillez ralentir.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Vote rate limit exceeded', { 
      ip: req.ip, 
      path: req.path
    });
    res.status(429).json({ 
      message: 'Trop de votes depuis cette adresse IP, veuillez ralentir.'
    });
  },
  skip: (req) => {
    // Skip rate limiting for authenticated admin users
    return req.isAuthenticated && req.isAuthenticated() && req.user?.role === 'super_admin';
  }
});
