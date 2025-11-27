import passport from "passport";
// @ts-ignore - passport-oauth2 types may not be available until npm install
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { Admin } from "../shared/schema";
import { logger } from "./lib/logger";
import { UserSyncService } from "./services/user-sync-service";

declare global {
  namespace Express {
    interface User extends Admin {}
  }
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

  // Configuration OAuth2 pour Authentik
  const authentikBaseUrl = process.env.AUTHENTIK_BASE_URL || "http://localhost:9002";
  const clientID = process.env.AUTHENTIK_CLIENT_ID || "";
  const clientSecret = process.env.AUTHENTIK_CLIENT_SECRET || "";
  const issuer = process.env.AUTHENTIK_ISSUER || `${authentikBaseUrl}/application/o/cjd80/`;
  const redirectURI = process.env.AUTHENTIK_REDIRECT_URI || "http://localhost:5000/api/auth/authentik/callback";

  if (!clientID || !clientSecret) {
    logger.warn("[Auth] AUTHENTIK_CLIENT_ID ou AUTHENTIK_CLIENT_SECRET non configuré. L'authentification OAuth2 ne fonctionnera pas.");
  }

  // Configuration de la stratégie OAuth2
  passport.use(
    "authentik",
    new OAuth2Strategy(
      {
        authorizationURL: `${authentikBaseUrl}/application/o/authorize/`,
        tokenURL: `${authentikBaseUrl}/application/o/token/`,
        clientID,
        clientSecret,
        callbackURL: redirectURI,
        scope: ["openid", "profile", "email"],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          logger.info("[Auth] Callback OAuth2 reçu", { hasAccessToken: !!accessToken });

          // Récupérer les informations utilisateur depuis l'API Authentik avec l'accessToken
          // passport-oauth2 ne fournit pas automatiquement le profil, il faut le récupérer via l'API
          let userProfile: any = {};
          
          try {
            // Récupérer les informations utilisateur
            const userInfoResponse = await fetch(`${authentikBaseUrl}/api/v3/core/users/me/`, {
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            });

            if (userInfoResponse.ok) {
              userProfile = await userInfoResponse.json();
              logger.info("[Auth] Profil utilisateur récupéré depuis Authentik", { email: userProfile.email });
              
              // Récupérer les groupes de l'utilisateur
              if (userProfile.pk) {
                try {
                  const groupsResponse = await fetch(`${authentikBaseUrl}/api/v3/core/users/${userProfile.pk}/groups/`, {
                    headers: {
                      "Authorization": `Bearer ${accessToken}`,
                      "Content-Type": "application/json",
                    },
                  });

                  if (groupsResponse.ok) {
                    const groupsData = await groupsResponse.json();
                    userProfile.groups = groupsData.results?.map((g: any) => g.name) || [];
                    logger.info("[Auth] Groupes utilisateur récupérés", { groups: userProfile.groups });
                  }
                } catch (groupsError) {
                  logger.warn("[Auth] Impossible de récupérer les groupes", { error: groupsError });
                }
              }
            } else {
              logger.warn("[Auth] Impossible de récupérer le profil utilisateur depuis Authentik", {
                status: userInfoResponse.status,
              });
              // Fallback: utiliser les informations du profil OAuth2 si disponibles
              userProfile = profile || {};
            }
          } catch (error) {
            logger.error("[Auth] Erreur lors de la récupération du profil depuis Authentik", { error });
            // Fallback: utiliser les informations du profil OAuth2 si disponibles
            userProfile = profile || {};
          }

          // Le profil OAuth2 contient les informations utilisateur
          // Authentik envoie les informations dans le profil
          const userSyncService = new UserSyncService(storage);
          const syncResult = await userSyncService.getOrCreateUserFromOAuth2(userProfile);

          if (!syncResult.success || !syncResult.user) {
            logger.error("[Auth] Erreur lors de la synchronisation de l'utilisateur", {
              error: syncResult.error,
              profile: profile?.email || profile?.preferred_username,
            });
            return done(syncResult.error || new Error("Erreur lors de la synchronisation de l'utilisateur"), null);
          }

          const user = syncResult.user;

          // Vérifier si le compte est en attente de validation
          if (user.status === "pending") {
            logger.warn("[Auth] Tentative de connexion avec un compte en attente", { email: user.email });
            return done(null, false, { message: "Votre compte est en attente de validation par un administrateur" });
          }

          // Vérifier si le compte est inactif
          if (user.status === "inactive") {
            logger.warn("[Auth] Tentative de connexion avec un compte inactif", { email: user.email });
            return done(null, false, { message: "Votre compte a été désactivé" });
          }

          logger.info("[Auth] Utilisateur authentifié avec succès", { email: user.email, role: user.role });
          return done(null, user);
        } catch (error) {
          logger.error("[Auth] Erreur dans la stratégie OAuth2", { error });
          return done(error, null);
        }
      }
    )
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
      logger.error("[Auth] Erreur lors de la désérialisation", { error });
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

  // Route pour initier le flow OAuth2
  app.get("/api/auth/authentik", (req, res, next) => {
    passport.authenticate("authentik", {
      scope: ["openid", "profile", "email"],
    })(req, res, next);
  });

  // Route callback OAuth2
  app.get("/api/auth/authentik/callback", (req, res, next) => {
    passport.authenticate("authentik", (err: any, user: any, info: any) => {
      if (err) {
        logger.error("[Auth] Erreur lors du callback OAuth2", { error: err });
        return res.redirect("/auth?error=authentication_failed");
      }

      if (!user) {
        logger.warn("[Auth] Authentification échouée", { info });
        const errorMessage = info?.message || "Authentification échouée";
        return res.redirect(`/auth?error=${encodeURIComponent(errorMessage)}`);
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          logger.error("[Auth] Erreur lors de l'établissement de session", { error: loginErr });
          return res.redirect("/auth?error=session_failed");
        }

      // Rediriger vers la page d'administration ou la page d'accueil
      const redirectTo = (req.session as any)?.returnTo || "/admin";
      delete (req.session as any)?.returnTo;
      return res.redirect(redirectTo);
      });
    })(req, res, next);
  });

  // Route login - redirige vers Authentik
  app.post("/api/login", (req, res) => {
    // Sauvegarder l'URL de retour si fournie
    if (req.body.returnTo) {
      (req.session as any).returnTo = req.body.returnTo;
    }
    // Rediriger vers le flow OAuth2
    res.redirect("/api/auth/authentik");
  });

  // Route logout - détruit la session
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session?.destroy((destroyErr) => {
        if (destroyErr) {
          logger.error("[Auth] Erreur lors de la destruction de session", { error: destroyErr });
          return next(destroyErr);
        }
        res.clearCookie("connect.sid");
        res.sendStatus(200);
      });
    });
  });

  // Route pour obtenir l'utilisateur actuel
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
