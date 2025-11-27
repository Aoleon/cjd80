# MinIO - Guide de Démarrage Rapide

## Installation et Configuration

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Ajoutez dans votre fichier `.env` :

```bash
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_LOAN_ITEMS=loan-items
MINIO_BUCKET_ASSETS=assets
```

### 3. Démarrer MinIO avec Docker

```bash
docker compose -f docker-compose.local.yml up -d
```

Vérifiez que MinIO est démarré :

```bash
docker ps | grep minio
```

### 4. Accéder à la console MinIO

Ouvrez votre navigateur : http://localhost:9003

- **Username** : `minioadmin`
- **Password** : `minioadmin`

## Migration des Fichiers Existants

Si vous avez des fichiers existants à migrer :

```bash
# Migration sans suppression
npm run migrate:minio

# Migration avec suppression après vérification
npm run migrate:minio:delete
```

## Vérification

### Health Check

Vérifiez que MinIO est opérationnel :

```bash
# Health check global
curl http://localhost:5001/api/health

# Health check détaillé (nécessite authentification admin)
curl http://localhost:5001/api/health/detailed

# Status complet
curl http://localhost:5001/api/status/all
```

### Test d'Upload

1. Connectez-vous à l'application
2. Allez dans la section Admin > Matériels de prêt
3. Créez ou modifiez un matériel
4. Uploadez une photo
5. Vérifiez que l'image est accessible via l'URL MinIO

## URLs des Fichiers

Les fichiers uploadés sont accessibles via :

- **Photos de prêts** : `http://localhost:9002/loan-items/{filename}`
- **Logos** : `http://localhost:9002/assets/{filename}`

## Dépannage Rapide

### MinIO ne démarre pas

```bash
# Vérifier les logs
docker logs cjd-minio-local

# Redémarrer
docker compose -f docker-compose.local.yml restart minio
```

### Erreur de connexion

1. Vérifiez que MinIO est démarré : `docker ps | grep minio`
2. Vérifiez les variables d'environnement dans `.env`
3. Vérifiez que l'application peut accéder à MinIO (même réseau Docker)

### Buckets non créés

Les buckets sont créés automatiquement au démarrage de l'application. Vérifiez les logs :

```bash
docker logs cjd-app-local | grep -i minio
```

## Prochaines Étapes

- [ ] Migrer les fichiers existants (si nécessaire)
- [ ] Tester l'upload de photos
- [ ] Tester l'upload de logos
- [ ] Vérifier les health checks
- [ ] Configurer les credentials de production (si applicable)

