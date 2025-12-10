# CJD80 - Informations de Déploiement

## Déploiement sur work.robinswood.io

### 📍 URLs d'Accès

- **Application principale**: https://work.robinswood.io/cjd80
- **API**: https://work.robinswood.io/cjd80/api
- **Health Check**: https://work.robinswood.io/cjd80/api/health

### 🔐 Authentification

L'application est protégée par OAuth2 (via oauth2-proxy). L'authentification est requise pour accéder à l'application.

### 🐳 Configuration Docker

#### Conteneur CJD80
- **Nom**: `cjd80-app`
- **Image**: `cjd80:latest`
- **Port interne**: 5000
- **Port exposé**: 5003 (localhost)
- **IP conteneur**: 172.26.0.2
- **Réseau**: `cjd80_rbw-network`

#### Fichiers de Configuration
- **Docker Compose**: `docker-compose.dev.yml`
- **Dockerfile**: `Dockerfile`
- **Variables d'environnement**: `.env`

### 📝 Configuration Nginx

La configuration Nginx a été mise à jour dans:
- **Fichier**: `/opt/ia-webdev/nginx/includes/cjd80.conf`
- **Include dans**: `/etc/nginx/nginx.conf` (work.robinswood.io server block)

Locations configurées:
1. `/cjd80` - Application frontend (avec OAuth2)
2. `/cjd80/api/` - Endpoints API (avec OAuth2)
3. `/cjd80/ws` - WebSocket (avec OAuth2)
4. `/cjd80/@vite/`, `/cjd80/assets/` - Assets statiques

**Rewrite:** Toutes les requêtes `/cjd80/*` sont rewritées en `/*` avant proxy vers le conteneur.

### 🚀 Commandes Utiles

#### Démarrer l'Application
```bash
cd /home/workspace/cjd80
docker compose -f docker-compose.dev.yml up -d
```

#### Arrêter l'Application
```bash
docker compose -f docker-compose.dev.yml down
```

#### Voir les Logs
```bash
docker logs cjd80-app -f
```

#### Reconstruire l'Image
```bash
docker build -t cjd80:latest -f Dockerfile .
docker compose -f docker-compose.dev.yml up -d --force-recreate
```

#### Recharger Nginx
```bash
docker exec rbw-nginx nginx -s reload
```

### 🔧 État Actuel

✅ **Application démarrée et accessible**
- Conteneur: `cjd80-app` (healthy)
- Frontend accessible via https://work.robinswood.io/cjd80
- API accessible via https://work.robinswood.io/cjd80/api
- Authentification OAuth2 active (Google @youcom.io)
- PostgreSQL connectée (cjd-postgres:5436)
- Redis connecté (cjd-redis:6381)
- MinIO connecté (cjd-minio:9000)

⚠️ **Points d'Attention**
- Email SMTP : Erreur d'authentification (non critique)
- Push Notifications : Mode dégradé (colonne DB manquante)
- Auto-Sync GitHub : Erreurs intermittentes (colonne DB manquante)

### 📊 Services Optionnels

Ces services ne sont pas critiques pour le fonctionnement de base:
- **MinIO**: Stockage de fichiers (loan items, assets)
- **SMTP**: Envoi d'emails
- **Authentik**: Authentification interne (remplacé par OAuth2 proxy)
- **PostgreSQL**: Base de données (à configurer si nécessaire)

### 🔄 Mises à Jour de la Configuration

Pour modifier la configuration Nginx:
1. Éditer `/home/workspace/robinswood.io/nginx.conf`
2. Tester: `docker exec rbw-nginx nginx -t`
3. Recharger: `docker exec rbw-nginx nginx -s reload`

### 📦 Structure des Fichiers

```
/home/workspace/cjd80/
├── docker-compose.dev.yml    # Configuration Docker pour dev
├── Dockerfile                 # Image de production
├── .env                       # Variables d'environnement
├── dist/                      # Build de production
├── logs/                      # Logs de l'application
└── DEPLOYMENT_INFO.md         # Ce fichier
```

### 🎯 Prochaines Étapes

Pour une utilisation complète de l'application:

1. **Configurer la base de données**
   - Créer une instance PostgreSQL
   - Mettre à jour `DATABASE_URL` dans `.env`
   - Redémarrer le conteneur

2. **Configurer MinIO (optionnel)**
   - Démarrer un conteneur MinIO
   - Mettre à jour les variables MINIO_* dans `.env`

3. **Tester les fonctionnalités**
   - Vérifier l'accès à l'interface
   - Tester les APIs
   - Valider l'authentification

---

**Date de déploiement**: 2025-12-04
**Déployé par**: Claude Code
**Version**: Production build
