import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import { startPoolMonitoring } from "./utils/db-health";
import { startAutoSync } from "./utils/auto-sync";
import { startTrackingAlertsGeneration } from "./utils/tracking-scheduler";
import { nanoid } from "nanoid";
import { logger } from "./lib/logger";
import { ApiError } from "../shared/errors";

// Support pour ESM (recréer __dirname et __filename)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Servir les fichiers uploadés (photos) - accessible en dev et prod
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
  maxAge: '1y', // Cache long pour les images
  etag: true,
  lastModified: true
}));

// Servir les assets (logos uploadés) depuis attached_assets
app.use('/assets', express.static(path.join(__dirname, '../attached_assets'), {
  maxAge: '1y', // Cache long pour les images
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // S'assurer que les logos sont servis avec le bon type MIME
    if (filePath.match(/\.(jpg|jpeg)$/i)) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.match(/\.png$/i)) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.match(/\.webp$/i)) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

process.on('uncaughtException', (error: Error) => {
  logger.error('CRITICAL: Uncaught Exception', {
    type: 'uncaughtException',
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('CRITICAL: Unhandled Promise Rejection', {
    type: 'unhandledRejection',
    reason: reason?.message || reason,
    stack: reason?.stack,
    timestamp: new Date().toISOString()
  });
});

// Security measure: Sanitize sensitive data from logs to prevent exposure of passwords, tokens, and secrets
function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['password', 'token', 'sessionid', 'apikey', 'secret', 'passwordhash', 'sessiontoken', 'accesstoken', 'refreshtoken', 'bearertoken'];
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }
  
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    // Normalize key by removing non-alphanumeric characters and converting to lowercase
    const normalizedKey = key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // Check if normalized key contains any sensitive field
    if (sensitiveFields.some(field => normalizedKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }
  
  return sanitized;
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(sanitizeLogData(capturedJsonResponse))}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const errorId = nanoid();
    const status = err.status || err.statusCode || 500;
    
    const sanitizedBody = sanitizeLogData(req.body);
    const sanitizedQuery = sanitizeLogData(req.query);
    
    logger.error('Uncaught error in request handler', {
      errorId,
      message: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path,
      query: sanitizedQuery,
      body: sanitizedBody,
      user: (req as any).user?.email || 'anonymous',
      timestamp: new Date().toISOString(),
      statusCode: status,
      errorName: err.name
    });
    
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.status(status).json({
      success: false,
      message: status === 500 && isProduction ? 'Internal server error' : err.message,
      errorId,
      ...(err instanceof ApiError && { code: err.code })
    });
  });

  // importantly only setup vite in development and test, and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    await setupVite(app, server);
  } else {
    // Headers de cache pour forcer le rechargement après déploiement
    app.use((req, res, next) => {
      // Empêcher l'indexation par les moteurs de recherche
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
      
      // Pas de cache pour HTML - toujours récupérer la dernière version
      if (req.path === '/' || req.path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } 
      // Cache long pour les assets avec hash (JS, CSS, images)
      else if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
      // Pas de cache pour les autres fichiers
      else {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      }
      next();
    });

    // Servir les fichiers de build (client)
    app.use(express.static(path.join(__dirname, '../dist/public'), {
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        // Headers additionnels pour forcer le rechargement du service worker
        if (path.endsWith('sw.js') || path.endsWith('service-worker.js')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      }
    }));

    // Fallback pour les routes front (tout sauf /api)
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).end();
      }
      // Headers no-cache pour l'index.html
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      // Empêcher l'indexation
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
      return res.sendFile(path.join(__dirname, '../dist/public/index.html'));
    });
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
    log(`DB pool monitoring activé`);
    
    // Démarrer le monitoring du pool de connexions
    // En dev: toutes les 5 minutes, en prod: toutes les 10 minutes
    const monitoringInterval = process.env.NODE_ENV === 'development' ? 300000 : 600000;
    startPoolMonitoring(monitoringInterval);
    
    // Démarrer la synchronisation automatique GitHub
    startAutoSync();
    
    // Démarrer la génération automatique des alertes de tracking
    // Par défaut: toutes les 24h (1440 minutes)
    // Peut être configuré via TRACKING_ALERTS_INTERVAL_MINUTES
    const trackingInterval = parseInt(process.env.TRACKING_ALERTS_INTERVAL_MINUTES || '1440', 10);
    startTrackingAlertsGeneration(trackingInterval);
  });
})();
