# Project Brief - CJD Amiens - Boîte à Kiffs

**Version:** 1.0.0  
**Date de création:** 2025-01-29  
**Dernière mise à jour:** 2025-01-29  
**Statut:** Production

---

## 🎯 Objectif Principal

**CJD Amiens - Boîte à Kiffs** est une application web interne moderne pour le **Centre des Jeunes Dirigeants (CJD) d'Amiens** permettant la gestion collaborative d'idées innovantes, l'organisation d'événements avec intégration HelloAsso, et une interface d'administration complète.

## 📋 Périmètre du Projet

### Domaine Métier
- **Organisation:** Centre des Jeunes Dirigeants (CJD) d'Amiens
- **Contexte:** Association de jeunes dirigeants d'entreprise
- **Problématique:** Gestion collaborative d'idées, organisation d'événements, suivi des membres et mécènes

### Fonctionnalités Clés

#### Gestion Collaborative d'Idées
- ✅ **Proposition d'idées** : Création et soumission d'idées innovantes
- ✅ **Système de vote** : Vote et suivi des idées avec workflow flexible
- ✅ **Suivi des idées** : Statuts, commentaires, attribution de responsables

#### Gestion d'Événements
- ✅ **Création d'événements** : Organisation complète d'événements
- ✅ **Intégration HelloAsso** : Synchronisation automatique des inscriptions
- ✅ **Gestion des inscriptions** : Suivi des participants et paiements

#### CRM Intégré
- ✅ **Gestion des membres** : Profils, rôles, permissions
- ✅ **Gestion des mécènes** : Suivi des partenaires et sponsors
- ✅ **Scoring d'engagement** : Calcul automatique de l'engagement des membres

#### Interface d'Administration
- ✅ **Dashboard** : Statistiques et indicateurs clés
- ✅ **Gestion complète** : Administration des idées, événements, membres
- ✅ **Branding personnalisable** : Configuration des couleurs, logos, textes

#### Progressive Web App (PWA)
- ✅ **Installation native** : Installation sur mobile et desktop
- ✅ **Mode hors ligne** : Utilisation sans connexion
- ✅ **Notifications push** : Notifications riches avec actions inline
- ✅ **Fonctionnalités natives** : Partage natif, badge de notifications, vibrations

## 🎯 Objectifs Business

### Problèmes Résolus
1. **Gestion collaborative** : Centralisation des idées et suivi collaboratif
2. **Organisation d'événements** : Automatisation de la gestion via HelloAsso
3. **Suivi des membres** : CRM intégré pour gérer membres et mécènes
4. **Engagement** : Scoring automatique pour mesurer l'engagement
5. **Accessibilité** : PWA pour accès mobile et hors ligne

### Résultats Attendus
- 📈 Amélioration de la collaboration sur les idées
- 📊 Automatisation de la gestion d'événements
- 🎯 Meilleur suivi de l'engagement des membres
- 💰 Optimisation de la gestion des mécènes
- ⚡ Expérience utilisateur améliorée avec PWA

## 🏗️ Architecture Technique

### Stack Principal
- **Frontend:** React 18, TypeScript, Vite, Wouter, TanStack Query, Radix UI, Tailwind CSS
- **Backend:** Express.js, TypeScript, Node.js
- **Base de données:** PostgreSQL avec Drizzle ORM
- **PWA:** Service Worker, notifications push, installation native
- **Tests:** Vitest (unitaires) + Playwright (E2E)

### Principes Architecturaux
- **Type Safety:** Types TypeScript partagés (`shared/schema.ts`)
- **Sécurité:** Authentification Passport.js, validation Zod, protection CSRF
- **Performance:** PWA avec cache intelligent, service workers
- **Robustesse:** Gestion d'erreurs centralisée, logging structuré
- **Branding:** Configuration centralisée pour personnalisation facile

### Système de Branding

**Configuration centralisée** dans `client/src/config/branding-core.ts` :
- ✅ **Textes** : Tous les textes de l'application
- ✅ **Couleurs** : Système de couleurs sémantiques (success, warning, error, info)
- ✅ **Logos** : Configuration des logos et images
- ✅ **Multi-tenant ready** : Adaptation facile pour d'autres organisations

**Système de couleurs sémantiques** :
- 4 familles de couleurs : success (vert), warning (orange), error (rouge), info (bleu)
- Variantes light/dark pour chaque couleur
- 17 couleurs configurables via interface admin
- 168+ instances migrées vers classes sémantiques

## 📊 Métriques de Succès

### Techniques
- ✅ Couverture de tests: Objectif 80%+ frontend et backend
- ✅ Performance: Temps de chargement < 2s
- ✅ Disponibilité: PWA fonctionnelle hors ligne
- ✅ Accessibilité: Support mode sombre, responsive mobile-first

### Métier
- 📈 Nombre d'idées proposées et votées
- 📊 Taux de participation aux événements
- 🎯 Score d'engagement moyen des membres
- ⚡ Taux d'utilisation de la PWA

## 🔒 Contraintes et Exigences

### Sécurité
- Authentification sécurisée (Passport.js)
- Validation Zod côté client/serveur
- Hachage Scrypt pour mots de passe
- Protection CSRF intégrée
- RBAC par rôle utilisateur

### Performance
- PWA avec service workers
- Cache intelligent pour assets statiques
- Optimisation des images
- Lazy loading des composants

### Conformité
- Respect RGPD pour données personnelles
- Gestion des consentements
- Traçabilité complète des actions

## 📝 Notes Importantes

### État Actuel
- ✅ Application en production
- ✅ PWA fonctionnelle avec notifications push
- ✅ Intégration HelloAsso opérationnelle
- ✅ Système de branding personnalisable
- ✅ Infrastructure de tests complète

### Évolutions Futures
- Amélioration continue de l'expérience utilisateur
- Extension des fonctionnalités CRM
- Amélioration des notifications push
- Optimisations performance supplémentaires

---

**Source de vérité:** Ce document définit le périmètre et les objectifs du projet. Toute modification doit être validée et documentée ici.
