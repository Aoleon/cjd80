import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    rolling: true, // Renouveler le cookie à chaque requête
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true, // Protection contre XSS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const userResult = await storage.getUserByEmail(email);
        if (!userResult.success || !userResult.data || !(await comparePasswords(password, userResult.data.password))) {
          return done(null, false);
        } else {
          return done(null, userResult.data);
        }
      } catch (error) {
        console.error('[Auth] Erreur dans LocalStrategy:', error);
        return done(error);
      }
    }),
  );

  // Cache en mémoire pour éviter les requêtes DB répétées
  const userCache = new Map<string, { user: any; timestamp: number }>();
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  passport.serializeUser((user, done) => done(null, user.email));
  
  passport.deserializeUser(async (email: string, done) => {
    try {
      // Vérifier le cache d'abord
      const cached = userCache.get(email);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        return done(null, cached.user);
      }

      // Si pas en cache ou expiré, requête DB
      const userResult = await storage.getUser(email);
      if (userResult.success && userResult.data) {
        // Mettre en cache
        userCache.set(email, { user: userResult.data, timestamp: now });
        done(null, userResult.data);
      } else {
        // Supprimer du cache si l'utilisateur n'existe plus
        userCache.delete(email);
        done(null, null);
      }
    } catch (error) {
      console.error('[Auth] Erreur lors de la désérialisation:', error);
      userCache.delete(email); // Nettoyer le cache en cas d'erreur
      done(error);
    }
  });

  // Nettoyage périodique du cache
  setInterval(() => {
    const now = Date.now();
    userCache.forEach((cached, email) => {
      if ((now - cached.timestamp) >= CACHE_TTL) {
        userCache.delete(email);
      }
    });
  }, CACHE_TTL);

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUserResult = await storage.getUserByEmail(req.body.email);
      if (existingUserResult.success && existingUserResult.data) {
        return res.status(400).send("Email already exists");
      }

      const userResult = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        status: "pending", // Les nouvelles inscriptions sont en attente
      });

      if (!userResult.success) {
        return res.status(400).json({ message: userResult.error.message });
      }

      req.login(userResult.data, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = userResult.data;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error('[Auth] Erreur lors de la connexion:', err);
        return res.status(500).json({ message: "Erreur serveur lors de la connexion" });
      }
      
      if (!user) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }
      
      // Vérifier si le compte est en attente de validation
      if (user.status === "pending") {
        return res.status(403).json({ 
          message: "Votre compte est en attente de validation par un administrateur",
          status: "pending"
        });
      }
      
      // Vérifier si le compte est inactif
      if (user.status === "inactive") {
        return res.status(403).json({ 
          message: "Votre compte a été désactivé",
          status: "inactive"
        });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('[Auth] Erreur lors de l\'établissement de session:', loginErr);
          return res.status(500).json({ message: "Erreur lors de l'établissement de la session" });
        }
        
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
