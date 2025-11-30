# Guide de Finalisation Migration NestJS

**Date:** 2025-01-30  
**Statut actuel:** 161 routes migrées sur ~174 (~93%)  
**Objectif:** Finaliser la migration et supprimer les fichiers legacy

## État Actuel

### ✅ Migration Complète
- **Modules créés:** 20 modules NestJS
- **Routes migrées:** 161 routes (93%)
- **Routes critiques:** ✅ 100% migrées
- **Modules complets:** 11/11 (100%)

### ⏳ Routes Restantes (~13 routes)
Les routes restantes dans `server/routes.ts` sont principalement :
- Routes de test/développement
- Routes utilitaires
- Routes de migration/compatibilité

## Étapes de Finalisation

### Phase 1 : Audit des Routes Restantes

1. **Identifier les routes non migrées**
```bash
# Analyser server/routes.ts pour trouver les routes restantes
grep -n "router\.\(get\|post\|put\|patch\|delete\)" server/routes.ts
```

2. **Vérifier l'utilisation**
- Routes utilisées par le frontend ?
- Routes utilisées par les tests E2E ?
- Routes de développement uniquement ?

3. **Décider de la stratégie**
- Migrer vers NestJS si utilisées
- Supprimer si obsolètes
- Conserver si nécessaires pour compatibilité

### Phase 2 : Migration des Routes Restantes

Pour chaque route restante :

1. **Créer/ajouter au controller approprié**
```typescript
@Controller('api/...')
export class XxxController {
  @Get('route')
  async handler() {
    // Implémentation
  }
}
```

2. **Créer/ajouter au service**
```typescript
@Injectable()
export class XxxService {
  async method() {
    // Logique métier
  }
}
```

3. **Tester la route migrée**
- Test unitaire du service
- Test d'intégration du controller
- Test E2E si nécessaire

### Phase 3 : Mise à Jour des Tests E2E

1. **Mettre à jour playwright.config.ts**
```typescript
webServer: {
  command: 'NODE_ENV=test PORT=5001 tsx server/src/main.ts', // Au lieu de server/index.ts
  // ...
}
```

2. **Mettre à jour create-test-app.ts**
- Utiliser NestJS au lieu d'Express
- Créer une instance NestJS pour les tests

3. **Vérifier tous les tests E2E**
```bash
npm run test:playwright
```

### Phase 4 : Suppression des Fichiers Legacy

**⚠️ ATTENTION : Ne supprimer QUE après vérification complète**

1. **Vérifier que tout fonctionne**
```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:playwright

# Build production
npm run build
npm start
```

2. **Supprimer les fichiers**
```bash
# Supprimer server/routes.ts (après migration complète)
rm server/routes.ts

# Supprimer server/index.ts (après mise à jour tests)
rm server/index.ts

# Supprimer server/auth.ts (déjà migré dans auth module)
rm server/auth.ts
```

3. **Nettoyer les imports**
- Vérifier tous les imports de ces fichiers
- Mettre à jour les références

### Phase 5 : Nettoyage Final

1. **Supprimer les scripts Express**
```json
// package.json - Supprimer si plus utilisés
"dev:express": "...",
"build:express": "...",
"start:express": "..."
```

2. **Nettoyer les dépendances**
- Vérifier si `express` est encore nécessaire (NestJS l'utilise via @nestjs/platform-express)
- Vérifier autres dépendances Express

3. **Mettre à jour la documentation**
- README.md
- Guides de déploiement
- Documentation API

## Checklist de Finalisation

### Avant Suppression des Fichiers Legacy

- [ ] Toutes les routes migrées vers NestJS
- [ ] Tests E2E mis à jour pour utiliser NestJS
- [ ] Tous les tests passent
- [ ] Build production fonctionne
- [ ] Application démarre correctement
- [ ] Documentation mise à jour

### Après Suppression

- [ ] Vérifier que l'application fonctionne
- [ ] Vérifier que les tests passent
- [ ] Vérifier que le build fonctionne
- [ ] Commit des changements
- [ ] Mettre à jour la documentation de migration

## Commandes Utiles

```bash
# Compter les routes dans routes.ts
grep -c "router\.\(get\|post\|put\|patch\|delete\)" server/routes.ts

# Lister toutes les routes
grep -n "router\.\(get\|post\|put\|patch\|delete\)" server/routes.ts

# Vérifier les imports de routes.ts
grep -r "from.*routes" --include="*.ts" --include="*.tsx"

# Vérifier les imports de server/index.ts
grep -r "server/index" --include="*.ts" --include="*.json"
```

## Risques et Précautions

### ⚠️ Risques
1. **Tests E2E** - playwright.config.ts utilise server/index.ts
2. **Imports** - Certains fichiers peuvent importer depuis routes.ts
3. **Fonctions exportées** - requireAuth, requirePermission, etc.

### ✅ Solutions
1. Mettre à jour playwright.config.ts avant suppression
2. Vérifier tous les imports avant suppression
3. Migrer les fonctions utilitaires vers des modules NestJS

## Prochaines Étapes Recommandées

1. **Court terme** (1-2 jours)
   - Auditer les routes restantes
   - Identifier celles à migrer vs supprimer

2. **Moyen terme** (1 semaine)
   - Migrer les routes restantes
   - Mettre à jour les tests E2E

3. **Long terme** (après validation)
   - Supprimer les fichiers legacy
   - Nettoyer les dépendances
   - Finaliser la documentation

## Support

Pour toute question ou problème lors de la finalisation :
- Consulter `docs/migration/NESTJS_MIGRATION_COMPLETE.md`
- Vérifier les exemples dans les controllers existants
- Tester progressivement chaque étape

