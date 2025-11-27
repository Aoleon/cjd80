# Outils de Base de Données PostgreSQL

Ce document décrit les outils installés pour interagir et monitorer la base de données PostgreSQL.

## 🛠️ Outils Installés

### 1. **pgcli** - Client CLI Amélioré
Client PostgreSQL en ligne de commande avec autocomplétion, coloration syntaxique et historique.

**Installation:**
```bash
# Via pipx (recommandé)
brew install pipx
pipx install pgcli

# Ou via pip (si pipx n'est pas disponible)
python3 -m pip install --user pgcli
```

**Utilisation:**
```bash
npm run db:connect
# ou directement
pgcli $DATABASE_URL
```

**Fonctionnalités:**
- ✅ Autocomplétion intelligente
- ✅ Coloration syntaxique
- ✅ Historique des commandes
- ✅ Export des résultats en CSV/JSON
- ✅ Multi-lignes avec support des blocs SQL

### 2. **pg_activity** - Monitoring en Temps Réel
Outil de monitoring en temps réel des connexions et requêtes PostgreSQL.

**Installation:**
```bash
# Via pipx (recommandé)
brew install pipx
pipx install pg_activity

# Ou via pip (si pipx n'est pas disponible)
python3 -m pip install --user pg_activity
```

**Utilisation:**
```bash
npm run db:monitor
# ou directement
pg_activity $DATABASE_URL
```

**Fonctionnalités:**
- ✅ Vue en temps réel des connexions actives
- ✅ Affichage des requêtes en cours
- ✅ Statistiques de performance
- ✅ Interface interactive (similaire à `top`)

### 3. **Scripts Personnalisés**

#### `db:connect` - Connexion Interactive
```bash
npm run db:connect
```
Se connecte à la base de données avec `pgcli` (ou `psql` en fallback).

#### `db:monitor` - Monitoring en Temps Réel
```bash
npm run db:monitor
```
Lance `pg_activity` pour monitorer la base de données en temps réel.

#### `db:stats` - Statistiques Détaillées
```bash
npm run db:stats
```
Affiche des statistiques détaillées sur la base de données:
- Taille de la base de données
- Nombre de connexions actives
- Cache hit ratio
- Top 20 tables par taille
- Connexions actives
- Requêtes lentes (si `pg_stat_statements` est activé)

## 📊 Exemples d'Utilisation

### Connexion Interactive
```bash
# Via npm script
npm run db:connect

# Directement avec pgcli
pgcli $DATABASE_URL

# Avec psql (si pgcli n'est pas disponible)
psql $DATABASE_URL
```

### Monitoring en Temps Réel
```bash
# Via npm script
npm run db:monitor

# Directement
pg_activity $DATABASE_URL
```

### Statistiques
```bash
npm run db:stats
```

### Requêtes Utiles

#### Voir toutes les tables
```sql
\dt
```

#### Décrire une table
```sql
\d table_name
```

#### Voir les connexions actives
```sql
SELECT * FROM pg_stat_activity;
```

#### Voir la taille de la base de données
```sql
SELECT pg_size_pretty(pg_database_size(current_database()));
```

#### Voir les tables les plus volumineuses
```sql
SELECT 
  schemaname || '.' || tablename AS table_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

## 🔧 Configuration

Les scripts utilisent automatiquement la variable d'environnement `DATABASE_URL` depuis le fichier `.env`.

## 📚 Ressources

- [pgcli Documentation](https://www.pgcli.com/)
- [pg_activity Documentation](https://github.com/dalibo/pg_activity)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

