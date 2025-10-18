# 🔄 Système de Purge Automatique du Cache

Ce système garantit que tous les utilisateurs reçoivent automatiquement la dernière version de l'application après chaque mise à jour.

## 🚀 Installation Automatique (Recommandé)

Pour configurer la purge automatique du cache à chaque commit Git :

```bash
bash setup-git-hook.sh
```

✅ **C'est tout !** Le cache sera automatiquement invalidé après chaque commit.

## 📋 Utilisation Manuelle

Si vous préférez invalider le cache manuellement :

```bash
bash invalidate-cache.sh
```

## 🔧 Comment ça fonctionne ?

### 1. **Détection automatique des mises à jour**
- Le fichier `deploy-info.json` contient un timestamp de déploiement
- Les clients vérifient ce fichier toutes les 5 minutes
- Si une nouvelle version est détectée → rechargement automatique

### 2. **Versionnement du Service Worker**
- Le Service Worker a une version (ex: `1.1.0`)
- À chaque invalidation, la version est incrémentée automatiquement
- Les anciens caches sont supprimés automatiquement

### 3. **Purge complète**
Le script `invalidate-cache.sh` :
- ✅ Met à jour le timestamp dans `deploy-info.json`
- ✅ Incrémente la version du Service Worker
- ✅ Force le rechargement chez tous les utilisateurs connectés

## 📦 Intégration avec le Déploiement

Le script `deploy.sh` appelle automatiquement `invalidate-cache.sh` avant chaque build :

```bash
npm run build  # Lance deploy.sh qui invalide le cache automatiquement
```

## 🎯 Cas d'usage

### Après chaque commit (Automatique)
```bash
git add .
git commit -m "Nouvelle fonctionnalité"
# → Le cache est automatiquement invalidé
```

### Avant un déploiement (Automatique)
```bash
npm run build
# → deploy.sh invalide automatiquement le cache
```

### Invalidation manuelle d'urgence
```bash
bash invalidate-cache.sh
# → Invalide immédiatement le cache
```

## ⏱️ Délai de propagation

Les utilisateurs connectés recevront la nouvelle version :
- **Immédiatement** : lors du prochain rechargement de page
- **Automatiquement** : dans les 5 minutes (cycle de vérification)

## 🛠️ Désinstallation du hook Git

Si vous souhaitez désactiver la purge automatique :

```bash
rm .git/hooks/post-commit
```

---

💡 **Astuce** : Le système fonctionne en production comme en développement, garantissant que vos utilisateurs ont toujours la dernière version !
