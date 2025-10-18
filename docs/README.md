# 📚 Documentation CJD Amiens

Bienvenue dans la documentation du projet **CJD Amiens** - Plateforme web interne "Boîte à Kiffs".

## 📖 Guide de Navigation

### 🚀 Déploiement & Infrastructure

- **[Guide de Déploiement](./deployment/DEPLOYMENT.md)** - Instructions complètes pour déployer l'application en production
- **[Secrets GitHub](./deployment/GITHUB-SECRETS.md)** - Configuration des secrets pour le déploiement automatique
- **[Docker Compose Production](./deployment/docker-compose.prod.yml)** - Configuration Docker pour la production

### ✨ Fonctionnalités & Personnalisation

- **[Personnalisation du Branding](./features/CUSTOMIZATION.md)** - Guide pour personnaliser les couleurs, logos et l'identité visuelle
- **[Invalidation du Cache](./features/CACHE-INVALIDATION.md)** - Stratégies de gestion du cache et invalidation

### 🧪 Tests & Qualité

- **[Rapport de Tests - Mémorisation Utilisateur](./testing/rapport-tests-memorisation-utilisateur.md)** - Rapport détaillé des tests de mémorisation utilisateur

## 📁 Structure du Projet

```
cjd80/
├── client/              # Frontend React + TypeScript
├── server/              # Backend Express + API REST
├── shared/              # Code partagé (schémas, types)
├── docs/                # 📚 Documentation (vous êtes ici)
│   ├── deployment/      # Guides de déploiement
│   ├── features/        # Documentation des fonctionnalités
│   └── testing/         # Rapports et guides de test
├── tests/               # 🧪 Tests (Vitest, Playwright)
│   ├── e2e/            # Tests end-to-end
│   └── reports/        # Rapports générés
├── scripts/             # 🛠️ Scripts utilitaires
└── assets/              # 🖼️ Ressources statiques
    ├── screenshots/    # Screenshots de démo
    └── archive/        # Données historiques
```

## 🔗 Liens Rapides

- [README Principal](../README.md) - Vue d'ensemble du projet
- [Guide de Contribution](../CONTRIBUTING.md) - Comment contribuer au projet *(à créer)*
- [Changelog](../CHANGELOG.md) - Historique des versions *(à créer)*

## 🆘 Support

Pour toute question ou problème :
1. Consultez d'abord la documentation pertinente ci-dessus
2. Vérifiez les [Issues GitHub](https://github.com/Aoleon/cjd80/issues)
3. Contactez l'équipe de développement

---

*Dernière mise à jour : Octobre 2025*
