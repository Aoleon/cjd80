# 📋 Plan d'Implémentation - Fonctionnalité "Prêt"

## 🎯 Objectif
Ajouter un système de prêt de matériel permettant aux JDs de proposer et visualiser du matériel disponible au prêt.

## 📊 Architecture

### Base de données
**Table: `loan_items`**
```sql
- id (UUID, PK)
- title (text, NOT NULL) - Titre du matériel
- description (text) - Description détaillée
- lenderName (text, NOT NULL) - Nom du JD qui prête (texte libre)
- photoUrl (text) - URL de la photo uploadée
- status (text, NOT NULL) - pending | available | borrowed | unavailable
- proposedBy (text) - Nom de la personne qui propose
- proposedByEmail (text) - Email de la personne qui propose
- createdAt (timestamp)
- updatedAt (timestamp)
- updatedBy (text) - Email de l'admin qui a modifié
```

### Statuts
- `pending` - En attente de validation admin
- `available` - Disponible au prêt
- `borrowed` - Actuellement emprunté
- `unavailable` - Indisponible (cassé, perdu, etc.)

## 🗂️ Structure des fichiers

### Backend
1. **Schema** (`shared/schema.ts`)
   - Table `loanItems`
   - Constantes `LOAN_STATUS`
   - Schémas Zod `insertLoanItemSchema`, `updateLoanItemSchema`, `updateLoanItemStatusSchema`

2. **Storage** (`server/storage.ts`)
   - `getLoanItems(options)` - Liste paginée avec recherche
   - `getLoanItem(id)` - Détails d'un item
   - `createLoanItem(data)` - Créer un item
   - `updateLoanItem(id, data)` - Modifier un item
   - `updateLoanItemStatus(id, status)` - Changer le statut
   - `deleteLoanItem(id)` - Supprimer un item
   - `getAllLoanItems(options)` - Tous les items (admin)

3. **Routes API** (`server/routes.ts`)
   - `GET /api/loan-items` - Liste publique (filtre: status=available)
   - `GET /api/loan-items?search=...` - Recherche par titre/description
   - `POST /api/loan-items` - Proposer un matériel (public, rate limited)
   - `GET /api/admin/loan-items` - Tous les items (admin)
   - `PUT /api/admin/loan-items/:id` - Modifier un item (admin)
   - `PATCH /api/admin/loan-items/:id/status` - Changer statut (admin)
   - `DELETE /api/admin/loan-items/:id` - Supprimer (admin)
   - `POST /api/admin/loan-items/:id/photo` - Upload photo (admin)

4. **Upload de photos** (`server/utils/file-upload.ts`)
   - Middleware multer pour upload
   - Stockage dans `public/uploads/loan-items/`
   - Validation: taille max 5MB, formats: jpg, png, webp
   - Génération nom unique

### Frontend
1. **Page publique** (`client/src/pages/loan-page.tsx`)
   - Affichage en grille type e-commerce
   - Recherche par titre/description
   - Filtres par statut (available uniquement pour public)
   - Formulaire de proposition en bas de page

2. **Composants**
   - `LoanItemCard` - Carte d'affichage d'un item
   - `LoanItemForm` - Formulaire de proposition
   - `LoanItemsGrid` - Grille d'affichage

3. **Admin** (`client/src/components/admin/AdminLoanItemsPanel.tsx`)
   - Liste des items avec filtres
   - Actions: voir, modifier, changer statut, supprimer
   - Upload de photos

4. **Navigation**
   - Ajouter "Prêt" dans le header (`client/src/components/header.tsx`)
   - Ajouter onglet dans admin section (`client/src/components/admin-section.tsx`)

## 🔄 Workflow

### Proposition par utilisateur
1. Utilisateur remplit le formulaire en bas de `/loan`
2. Photo optionnelle (base64 ou upload direct)
3. Item créé avec status `pending`
4. Notification aux admins (email/push)

### Validation admin
1. Admin voit l'item dans l'onglet "Prêt" avec status `pending`
2. Admin peut:
   - Modifier les informations
   - Uploader/remplacer la photo
   - Changer le statut vers `available`
   - Supprimer si inapproprié

### Gestion des statuts
- Admin peut changer le statut à tout moment
- `available` → visible publiquement
- `borrowed` → actuellement emprunté
- `unavailable` → indisponible

## 📝 Checklist d'implémentation

### Phase 1: Backend - Base de données
- [ ] Créer table `loanItems` dans schema
- [ ] Créer constantes `LOAN_STATUS`
- [ ] Créer schémas Zod de validation
- [ ] Implémenter méthodes storage (CRUD)
- [ ] Tester les requêtes SQL

### Phase 2: Backend - API
- [ ] Créer routes API publiques
- [ ] Créer routes API admin
- [ ] Implémenter upload de photos (multer)
- [ ] Ajouter rate limiting sur POST
- [ ] Tester les endpoints

### Phase 3: Frontend - Page publique
- [ ] Créer page `/loan`
- [ ] Créer composant `LoanItemCard`
- [ ] Créer composant `LoanItemsGrid`
- [ ] Implémenter recherche
- [ ] Créer formulaire de proposition
- [ ] Ajouter route dans App.tsx
- [ ] Ajouter lien dans header

### Phase 4: Frontend - Admin
- [ ] Créer `AdminLoanItemsPanel`
- [ ] Créer modals de gestion
- [ ] Implémenter upload photo
- [ ] Ajouter onglet dans admin section
- [ ] Tester toutes les actions admin

### Phase 5: Tests & Polish
- [ ] Tester le workflow complet
- [ ] Vérifier responsive design
- [ ] Optimiser les images
- [ ] Ajouter loading states
- [ ] Gérer les erreurs

## 🎨 Design

### Carte d'item (LoanItemCard)
```
┌─────────────────────────┐
│  [Photo]                │
│                         │
├─────────────────────────┤
│ Titre                   │
│ Prêté par: [Nom JD]     │
│ Description...          │
│ [Badge: Disponible]     │
└─────────────────────────┘
```

### Formulaire de proposition
- Titre (requis)
- Description (optionnel)
- Nom du JD qui prête (requis)
- Photo (optionnel, upload)
- Nom et email du proposant (requis)

## 🔒 Sécurité
- Rate limiting sur POST `/api/loan-items`
- Validation stricte avec Zod
- Sanitisation des inputs
- Validation des fichiers uploadés (taille, type)
- Permissions admin pour modification/suppression

## 📱 Responsive
- Grille adaptative: 1 col mobile, 2 cols tablet, 3 cols desktop
- Formulaire responsive
- Modals adaptés mobile

