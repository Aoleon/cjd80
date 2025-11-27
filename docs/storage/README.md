# Documentation MinIO

Cette section contient toute la documentation relative à l'intégration MinIO pour le stockage des fichiers.

## 📚 Documentation Disponible

### Guides

1. **[MINIO_SETUP.md](./MINIO_SETUP.md)** - Guide complet de configuration
   - Variables d'environnement
   - Configuration Docker
   - Migration des fichiers
   - Dépannage

2. **[MINIO_QUICK_START.md](./MINIO_QUICK_START.md)** - Guide de démarrage rapide
   - Installation en 4 étapes
   - Commandes essentielles
   - Tests de base

3. **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - Résumé de la migration
   - Liste complète des modifications
   - Checklist de déploiement
   - Notes de compatibilité

4. **[VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)** - Checklist de vérification
   - Tests fonctionnels
   - Tests de sécurité
   - Dépannage

## 🚀 Démarrage Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer MinIO
docker compose -f docker-compose.local.yml up -d

# 3. Migrer les fichiers existants (optionnel)
npm run migrate:minio
```

## 📋 Architecture

### Composants

- **Service MinIO** (`server/services/minio-service.ts`)
  - Client MinIO
  - Gestion des buckets
  - Upload/Delete/Get URL
  - Health check

- **Upload Utils** (`server/utils/file-upload.ts`)
  - Middlewares Multer
  - Validation des fichiers
  - Upload vers MinIO

- **Docker Compose** (`docker-compose.local.yml`)
  - Service MinIO
  - Configuration réseau
  - Volumes persistants

### Buckets

- **loan-items** : Photos des matériels de prêt
- **assets** : Logos et autres assets

## 🔗 Liens Utiles

- [Documentation MinIO officielle](https://min.io/docs/)
- [Client MinIO JavaScript](https://github.com/minio/minio-js)
- [Docker Hub MinIO](https://hub.docker.com/r/minio/minio)

## 📝 Notes

- Les fichiers sont stockés avec des noms uniques (timestamp + nanoid)
- Les anciens fichiers peuvent coexister avec les nouveaux
- La migration est réversible
- MinIO est initialisé de manière non-bloquante

