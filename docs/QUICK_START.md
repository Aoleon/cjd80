# Guide de Démarrage Rapide - CJD Amiens

**Date:** 2025-01-30  
**Version:** Optimisée

## Démarrage en 3 Étapes

### 1. Démarrer les Services Docker

```bash
docker compose -f docker-compose.services.yml up -d postgres redis authentik-server authentik-worker minio
```

**Ou utiliser le script automatisé:**
```bash
npm run start:dev
```

### 2. Initialiser la Base de Données

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/cjd80" npm run db:push
```

### 3. Démarrer l'Application

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/cjd80" npm run dev
```

**L'application sera disponible sur:** http://localhost:5000

## Scripts Utiles

### Démarrage et Maintenance

```bash
# Démarrage complet automatisé
npm run start:dev

# Nettoyage complet
npm run clean:all

# Reset complet (supprime toutes les données)
npm run reset:env

# Validation de l'application
npm run validate

# Analyse de la migration NestJS
npm run analyze:migration
```

### Base de Données

```bash
# Pousser le schéma
npm run db:push

# Interface graphique
npx drizzle-kit studio
```

### Développement

```bash
# Démarrage développement
npm run dev

# Build production
npm run build

# Démarrage production
npm start
```

## Vérification Rapide

### 1. Vérifier les Services Docker

```bash
docker compose -f docker-compose.services.yml ps
```

Tous les services doivent être "healthy" ou "running".

### 2. Vérifier la Connexion DB

```bash
curl http://localhost:5000/api/health/db
```

### 3. Vérifier l'Application

```bash
curl http://localhost:5000/api/health
```

## Configuration

### Variables d'Environnement Essentielles

```env
# Base de données (pour connexion depuis l'hôte)
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cjd80

# Session
SESSION_SECRET=your-secret-key-here

# Authentik (à configurer après démarrage)
AUTHENTIK_BASE_URL=http://localhost:9002
AUTHENTIK_CLIENT_ID=your-client-id
AUTHENTIK_CLIENT_SECRET=your-client-secret
```

### Ports Utilisés

- **5000** - Application principale
- **5433** - PostgreSQL (externe)
- **6381** - Redis (externe)
- **9000-9001** - MinIO
- **9002** - Authentik

## Dépannage

### Problème: Port 5000 occupé

```bash
# Utiliser un autre port
PORT=5001 npm run dev
```

### Problème: Connexion DB échoue

Vérifier que:
1. PostgreSQL est démarré: `docker compose -f docker-compose.services.yml ps`
2. DATABASE_URL utilise `localhost:5433` (pas `postgres:5432`)
3. Les credentials sont corrects

### Problème: Services Docker ne démarrent pas

```bash
# Vérifier les logs
docker compose -f docker-compose.services.yml logs

# Redémarrer
docker compose -f docker-compose.services.yml restart
```

## Prochaines Étapes

1. **Configurer Authentik** (première fois)
   - Accéder à http://localhost:9002
   - Créer l'application OAuth2/OIDC
   - Récupérer les identifiants

2. **Valider l'Application**
   ```bash
   npm run validate
   ```

3. **Consulter la Documentation**
   - `docs/OPTIMIZATION_REPORT.md` - Rapport d'optimisation
   - `docs/PERFORMANCE_OPTIMIZATION.md` - Guide performance
   - `docs/migration/NESTJS_FINALIZATION_GUIDE.md` - Finalisation migration

## Support

Pour plus d'informations:
- README.md - Documentation complète
- docs/ - Documentation détaillée
- scripts/ - Scripts d'automatisation

