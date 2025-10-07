import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// List of sensitive fields to redact from logs
const sensitiveFields = ['password', 'token', 'auth', 'p256dh', 'secret', 'apiKey', 'sessionId'];

// Custom format to sanitize sensitive data
const sanitizeMetadata = winston.format((info: any) => {
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
const errorFormat = winston.format((info: any) => {
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

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(
    sanitizeMetadata(),
    errorFormat(),
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        logFormat
      )
    })
  ]
});

if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ filename: 'error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'combined.log' }));
}
