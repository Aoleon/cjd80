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

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
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
    cookie: {
      secure: process.env.NODE_ENV === "production",
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

  passport.serializeUser((user, done) => done(null, user.email));
  passport.deserializeUser(async (email: string, done) => {
    try {
      const userResult = await storage.getUser(email);
      if (userResult.success) {
        done(null, userResult.data);
      } else {
        done(null, null);
      }
    } catch (error) {
      console.error('[Auth] Erreur lors de la désérialisation:', error);
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUserResult = await storage.getUserByEmail(req.body.email);
      if (existingUserResult.success && existingUserResult.data) {
        return res.status(400).send("Email already exists");
      }

      const userResult = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      if (!userResult.success) {
        return res.status(400).json({ message: userResult.error.message });
      }

      req.login(userResult.data, (err) => {
        if (err) return next(err);
        res.status(201).json(userResult.data);
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
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('[Auth] Erreur lors de l\'établissement de session:', loginErr);
          return res.status(500).json({ message: "Erreur lors de l'établissement de la session" });
        }
        
        res.status(200).json(user);
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
    res.json(req.user);
  });
}
