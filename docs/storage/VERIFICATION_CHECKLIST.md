# Checklist de Vérification MinIO

## ✅ Vérifications Pré-Déploiement

### Configuration

- [ ] Variables d'environnement configurées dans `.env`
  ```bash
  MINIO_ENDPOINT=minio
  MINIO_PORT=9000
  MINIO_USE_SSL=false
  MINIO_ACCESS_KEY=minioadmin
  MINIO_SECRET_KEY=minioadmin
  MINIO_BUCKET_LOAN_ITEMS=loan-items
  MINIO_BUCKET_ASSETS=assets
  ```

- [ ] Dépendances installées
  ```bash
  npm install
  # Vérifier que minio est installé
  npm list minio
  ```

### Infrastructure

- [ ] Service MinIO démarré
  ```bash
  docker compose -f docker-compose.local.yml up -d minio
  docker ps | grep minio
  ```

- [ ] MinIO accessible
  - Console : http://localhost:9001
  - API : http://localhost:9000
  - Credentials : minioadmin / minioadmin

- [ ] Buckets créés automatiquement
  - Vérifier dans la console MinIO ou les logs de l'application

## ✅ Tests Fonctionnels

### Health Checks

- [ ] Health check global
  ```bash
  curl http://localhost:5001/api/health
  ```

- [ ] Health check détaillé (nécessite auth)
  ```bash
  curl -H "Cookie: connect.sid=..." http://localhost:5001/api/health/detailed
  # Vérifier que minio est présent dans la réponse
  ```

- [ ] Status complet
  ```bash
  curl http://localhost:5001/api/status/all
  # Vérifier que checks.minio est présent
  ```

### Upload de Fichiers

- [ ] Upload photo de prêt
  1. Se connecter en admin
  2. Aller dans Admin > Matériels de prêt
  3. Créer ou modifier un matériel
  4. Uploader une photo
  5. Vérifier que l'URL retournée est une URL MinIO
  6. Vérifier que l'image est accessible

- [ ] Upload logo
  1. Se connecter en admin
  2. Aller dans Admin > Branding
  3. Uploader un logo
  4. Vérifier que l'URL retournée est une URL MinIO
  5. Vérifier que le logo s'affiche correctement

### Suppression de Fichiers

- [ ] Suppression photo
  1. Modifier un matériel avec photo
  2. Uploader une nouvelle photo
  3. Vérifier que l'ancienne photo est supprimée de MinIO

- [ ] Suppression logo
  1. Uploader un nouveau logo
  2. Vérifier que l'ancien logo est supprimé de MinIO

### Validation

- [ ] Fichier trop volumineux (>5MB)
  - Doit être rejeté avec message d'erreur

- [ ] Format non autorisé
  - Tester avec .pdf, .txt, .gif
  - Doit être rejeté avec message d'erreur

- [ ] Extension non autorisée
  - Tester avec .exe, .sh
  - Doit être rejeté avec message d'erreur

## ✅ Migration (si fichiers existants)

- [ ] Migration sans suppression
  ```bash
  npm run migrate:minio
  ```
  - Vérifier les résultats dans la console
  - Vérifier que les fichiers sont dans MinIO
  - Vérifier que les fichiers locaux sont toujours présents

- [ ] Vérification post-migration
  - Vérifier que les anciennes URLs fonctionnent encore
  - Vérifier que les nouvelles URLs MinIO fonctionnent

- [ ] Migration avec suppression (optionnel)
  ```bash
  npm run migrate:minio:delete
  ```
  - Vérifier que les fichiers locaux sont supprimés
  - Vérifier que les fichiers MinIO sont toujours présents

## ✅ Compatibilité

- [ ] Anciennes URLs fonctionnent
  - `/uploads/loan-items/{filename}` (si fichiers non migrés)
  - `/assets/{filename}` (si fichiers non migrés)

- [ ] Nouvelles URLs fonctionnent
  - `http://localhost:9000/loan-items/{filename}`
  - `http://localhost:9000/assets/{filename}`

## ✅ Logs et Monitoring

- [ ] Logs d'initialisation
  ```bash
  docker logs cjd-app-local | grep -i minio
  # Doit montrer "MinIO service initialized"
  ```

- [ ] Logs d'upload
  - Vérifier dans les logs de l'application lors d'un upload
  - Doit montrer "Photo uploaded to MinIO" ou "Logo uploaded to MinIO"

- [ ] Logs d'erreur (si applicable)
  - Vérifier que les erreurs sont bien loggées
  - Vérifier que les messages d'erreur sont clairs

## ✅ Performance

- [ ] Temps de réponse upload
  - Upload d'une photo < 1MB : < 500ms
  - Upload d'une photo 5MB : < 2s

- [ ] Temps de réponse health check
  - Health check MinIO : < 200ms

- [ ] Accès aux fichiers
  - Chargement d'une image depuis MinIO : < 100ms

## ✅ Sécurité

- [ ] Validation MIME type
  - Seuls les types image/jpeg, image/png, image/webp acceptés

- [ ] Validation extension
  - Seules les extensions .jpg, .jpeg, .png, .webp acceptées

- [ ] Limite de taille
  - Fichiers > 5MB rejetés

- [ ] Noms de fichiers sécurisés
  - Noms générés automatiquement (timestamp + nanoid)
  - Pas d'injection de chemin possible

## 🐛 Dépannage

### Problèmes Courants

- [ ] MinIO non accessible
  - Vérifier : `docker ps | grep minio`
  - Vérifier : Variables d'environnement
  - Vérifier : Réseau Docker

- [ ] Buckets non créés
  - Vérifier : Logs de l'application
  - Vérifier : Permissions MinIO
  - Vérifier : Console MinIO

- [ ] Erreurs d'upload
  - Vérifier : Taille du fichier
  - Vérifier : Format du fichier
  - Vérifier : Logs MinIO

- [ ] URLs non accessibles
  - Vérifier : Port 9000 exposé
  - Vérifier : Politique de bucket (publique)
  - Vérifier : CORS si nécessaire

## 📝 Notes

- Les fichiers sont stockés avec des noms uniques
- Les anciens fichiers peuvent coexister avec les nouveaux
- La migration est réversible (fichiers locaux conservés par défaut)
- MinIO est initialisé de manière non-bloquante

