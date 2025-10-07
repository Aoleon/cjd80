import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";
import { startPoolMonitoring } from "./utils/db-health";
import { startAutoSync } from "./utils/auto-sync";

// Support pour ESM (recréer __dirname et __filename)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Headers de cache pour forcer le rechargement après déploiement
    app.use((req, res, next) => {
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
      return res.sendFile(path.join(__dirname, '../dist/public/index.html'));
    });
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    log(`DB pool monitoring activé`);
    
    // Démarrer le monitoring du pool de connexions
    // En dev: toutes les 5 minutes, en prod: toutes les 10 minutes
    const monitoringInterval = process.env.NODE_ENV === 'development' ? 300000 : 600000;
    startPoolMonitoring(monitoringInterval);
    
    // Démarrer la synchronisation automatique GitHub
    startAutoSync();
  });
})();
