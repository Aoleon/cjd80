# Configuration MinIO

## Vue d'ensemble

L'application utilise MinIO comme service de stockage objet S3-compatible pour gérer les fichiers uploadés (photos de prêts et logos).

## Variables d'environnement

Ajoutez les variables suivantes à votre fichier `.env` :

```bash
# Configuration MinIO
MINIO_ENDPOINT=minio              # Nom du service Docker ou hostname
MINIO_PORT=9000                   # Port API MinIO
MINIO_USE_SSL=false               # Utiliser HTTPS (true/false)
MINIO_ACCESS_KEY=minioadmin       # Clé d'accès MinIO
MINIO_SECRET_KEY=minioadmin       # Clé secrète MinIO
MINIO_BUCKET_LOAN_ITEMS=loan-items  # Nom du bucket pour les photos de prêts
MINIO_BUCKET_ASSETS=assets        # Nom du bucket pour les logos
```

### Variables d'environnement côté client (optionnel)

Pour le développement local, vous pouvez configurer les URLs MinIO côté client :

```bash
# Dans .env (pour Vite)
VITE_MINIO_ENDPOINT=localhost:9000
VITE_MINIO_USE_SSL=false
```

## Démarrage avec Docker

Le service MinIO est configuré dans `docker-compose.local.yml` :

```bash
docker compose -f docker-compose.local.yml up -d
```

MinIO sera accessible :
- **API** : http://localhost:9002 (port 9002 pour éviter conflit avec nhost-minio)
- **Console** : http://localhost:9003 (port 9003 pour éviter conflit avec nhost-minio)
- **Credentials par défaut** : `minioadmin` / `minioadmin`

**Note** : Les ports externes sont 9002/9003 pour éviter les conflits avec d'autres instances MinIO. Le port interne reste 9000/9001.

## Buckets

Deux buckets sont créés automatiquement au démarrage :

1. **loan-items** : Photos des matériels de prêt
2. **assets** : Logos et autres assets uploadés

Les buckets sont configurés avec une politique publique pour permettre l'accès direct aux fichiers.

## Migration des fichiers existants

Pour migrer les fichiers locaux vers MinIO :

```bash
# Migration sans suppression des fichiers locaux
npm run migrate:minio

# Migration avec suppression des fichiers locaux après migration réussie
npm run migrate:minio:delete
```

Ou directement avec tsx :

```bash
# Migration sans suppression des fichiers locaux
tsx scripts/migrate-to-minio.ts

# Migration avec suppression des fichiers locaux après migration réussie
tsx scripts/migrate-to-minio.ts --delete
```

Le script migre :
- `public/uploads/loan-items/*` → bucket `loan-items`
- `attached_assets/*` → bucket `assets`

**Note** : Les routes statiques `/uploads` et `/assets` restent actives pour la compatibilité avec les fichiers non migrés, mais sont marquées comme dépréciées.

## URLs des fichiers

Les fichiers sont accessibles via des URLs directes MinIO :

- **Photos de prêts** : `http://localhost:9002/loan-items/{filename}`
- **Assets (logos)** : `http://localhost:9002/assets/{filename}`

**Note** : Le port externe est 9002 (configuré via `MINIO_EXTERNAL_PORT`).

## Production

Pour la production, considérez :

1. **Sécurité** : Changez les credentials par défaut
2. **HTTPS** : Activez SSL/TLS (`MINIO_USE_SSL=true`)
3. **URLs pré-signées** : Pour un accès sécurisé temporaire
4. **Proxy** : Utilisez un reverse proxy (Nginx/Traefik) pour exposer MinIO

## Dépannage

### MinIO n'est pas accessible

Vérifiez que le service est démarré :
```bash
docker ps | grep minio
```

### Erreur de connexion

Vérifiez les variables d'environnement et que MinIO est accessible depuis le conteneur de l'application.

### Buckets non créés

Les buckets sont créés automatiquement au démarrage. Vérifiez les logs :
```bash
docker logs cjd-app-local | grep -i minio
```

## Health Check

Le service MinIO est inclus dans les health checks de l'application :

- **Health check détaillé** : `GET /api/health/detailed` (admin seulement)
  - Inclut le statut MinIO (connecté, buckets disponibles)
  
- **Status global** : `GET /api/status/all` (public)
  - Inclut le statut MinIO dans les checks système

Le health check MinIO vérifie :
- La connexion au service MinIO
- L'existence des buckets requis
- La disponibilité des buckets

