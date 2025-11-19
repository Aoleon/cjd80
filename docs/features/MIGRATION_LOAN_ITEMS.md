# Migration - Table loan_items

## Problème
La table `loan_items` n'existe probablement pas encore dans la base de données, ce qui cause des erreurs lors des requêtes.

## Solution

### Option 1 : Via Drizzle (recommandé si DATABASE_URL est configurée)

Exécutez la commande suivante pour pousser le schéma vers la base de données :

```bash
npm run db:push
```

Cette commande va :
- Analyser le schéma dans `shared/schema.ts`
- Générer les migrations nécessaires
- Appliquer les changements à la base de données (création de la table `loan_items`)

**Note** : Cette commande nécessite que la variable d'environnement `DATABASE_URL` soit définie.

### Option 2 : Via script SQL (si DATABASE_URL n'est pas configurée)

Si vous préférez créer la table manuellement ou si `DATABASE_URL` n'est pas configurée :

1. **Via script Node.js** (nécessite DATABASE_URL) :
```bash
npm run db:create-loan-table
```

2. **Via SQL direct** :
   - Connectez-vous à votre base de données PostgreSQL
   - Exécutez le fichier `scripts/create-loan-items-table.sql`
   - Ou copiez-collez le contenu SQL dans votre client PostgreSQL

### 2. Vérification

Après avoir exécuté `npm run db:push`, la table `loan_items` devrait être créée avec les colonnes suivantes :
- `id` (UUID, primary key)
- `title` (text, NOT NULL)
- `description` (text)
- `lender_name` (text, NOT NULL)
- `photo_url` (text)
- `status` (text, NOT NULL, default: 'pending')
- `proposed_by` (text, NOT NULL)
- `proposed_by_email` (text, NOT NULL)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `updated_by` (text)

Et les index :
- `loan_items_status_idx` sur `status`
- `loan_items_created_at_idx` sur `created_at`

### 3. Gestion d'erreur améliorée

Le code a été modifié pour :
- Détecter si la table n'existe pas
- Retourner une liste vide au lieu d'une erreur si la table n'existe pas
- Logger un avertissement au lieu d'une erreur dans ce cas

Cela permet à l'application de fonctionner même si la table n'existe pas encore, en affichant simplement "Aucun matériel disponible" au lieu d'une erreur.

## Note

Si vous voyez toujours des erreurs après avoir exécuté `npm run db:push`, vérifiez :
1. Que la variable d'environnement `DATABASE_URL` est correctement configurée
2. Que vous avez les permissions nécessaires sur la base de données
3. Les logs du serveur pour voir les erreurs exactes

