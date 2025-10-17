# Guide de Déploiement - CJD Amiens (cjd80.fr)

Ce guide explique comment déployer l'application CJD Amiens sur votre VPS avec le domaine cjd80.fr.

## 📋 Prérequis

### Sur le VPS
- Ubuntu 20.04+ ou Debian 11+
- Docker et Docker Compose installés
- Nginx installé
- Certificat SSL (Let's Encrypt recommandé)
- Base de données PostgreSQL accessible
- Accès SSH avec clé

### Variables d'environnement
Toutes les variables listées dans `.env.example` doivent être configurées.

---

## 🚀 Installation Initiale

### 1. Préparer le VPS

```bash
# Se connecter au VPS
ssh user@cjd80.fr

# Créer le répertoire de déploiement
sudo mkdir -p /docker/cjd80
sudo chown $USER:$USER /docker/cjd80
cd /docker/cjd80

# Cloner le repository (ou utiliser votre méthode actuelle)
git clone https://github.com/Aoleon/cjd80.git .
```

### 2. Configurer les variables d'environnement

```bash
# Copier le fichier exemple
cp .env.example .env

# Éditer le fichier .env avec vos vraies valeurs
nano .env
```

**Variables critiques à configurer :**
- `DATABASE_URL` : Connexion à votre PostgreSQL
- `SESSION_SECRET` : Générez avec `openssl rand -base64 32`
- `SMTP_USER` et `SMTP_PASS` : Configuration email
- `VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY` : Générez avec `npx web-push generate-vapid-keys`

### 3. Configurer Nginx

```bash
# Copier la configuration exemple
sudo cp nginx.conf.example /etc/nginx/sites-available/cjd80.fr

# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/cjd80.fr /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 4. Obtenir un certificat SSL (Let's Encrypt)

```bash
# Installer certbot si nécessaire
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat
sudo certbot --nginx -d cjd80.fr -d www.cjd80.fr

# Le renouvellement automatique est configuré par défaut
```

---

## 🔄 Déploiement avec GitHub Actions

### Configuration des secrets GitHub

Dans votre repository GitHub, allez dans `Settings > Secrets and variables > Actions` et ajoutez :

| Secret | Description |
|--------|-------------|
| `VPS_SSH_KEY` | Clé privée SSH pour accéder au VPS |
| `VPS_HOST` | Adresse du VPS (cjd80.fr ou IP) |
| `VPS_PORT` | Port SSH (généralement 22) |
| `VPS_USER` | Utilisateur SSH |
| `GH_TOKEN` | Token GitHub pour l'API |
| `GH_REPO_OWNER` | Aoleon |
| `GH_REPO_NAME` | cjd80 |

### Script de déploiement sur le VPS

Créez `/docker/cjd80/deploy.sh` :

```bash
#!/bin/bash
set -e

echo "🔄 Pulling latest code..."
cd /docker/cjd80
git fetch origin
git reset --hard origin/main

echo "🐳 Building and starting Docker containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "⏳ Waiting for health check..."
sleep 10

# Vérifier que l'application répond
for i in {1..30}; do
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        exit 0
    fi
    echo "Attempt $i/30: Waiting for application to start..."
    sleep 2
done

echo "❌ Health check failed after 60 seconds"
docker-compose logs --tail=50
exit 1
```

Rendez-le exécutable :
```bash
chmod +x /docker/cjd80/deploy.sh
```

### Déploiement automatique

Chaque push sur la branche `main` déclenche automatiquement le déploiement via GitHub Actions (`.github/workflows/deploy.yml`).

---

## 🔍 Vérification Post-Déploiement

### Vérifier que l'application fonctionne

```bash
# Health check
curl https://cjd80.fr/api/health

# Réponse attendue:
# {"status":"healthy","timestamp":"...","uptime":123,"version":"1.0.0",...}

# Vérifier les logs
docker-compose logs -f --tail=100

# Vérifier le statut du container
docker-compose ps
```

### Tests fonctionnels

1. **Frontend** : https://cjd80.fr
2. **Admin** : https://cjd80.fr/admin
3. **API Health** : https://cjd80.fr/api/health
4. **API Events** : https://cjd80.fr/api/events

---

## 🛠️ Opérations Courantes

### Voir les logs

```bash
# Logs en temps réel
docker-compose logs -f

# Dernières 100 lignes
docker-compose logs --tail=100

# Logs d'un service spécifique
docker-compose logs -f cjd-app
```

### Redémarrer l'application

```bash
cd /docker/cjd80
docker-compose restart
```

### Mettre à jour l'application manuellement

```bash
cd /docker/cjd80
./deploy.sh
```

### Accéder au container

```bash
docker-compose exec cjd-app sh
```

### Nettoyer les ressources Docker

```bash
# Supprimer les images inutilisées
docker image prune -a -f

# Supprimer les volumes non utilisés
docker volume prune -f

# Nettoyer complètement (ATTENTION: supprime tout ce qui n'est pas utilisé)
docker system prune -a -f
```

---

## 🐛 Dépannage

### L'application retourne 404

**Causes possibles :**
1. Le container n'a pas démarré → Vérifier avec `docker-compose ps`
2. Nginx mal configuré → Vérifier avec `sudo nginx -t`
3. Le build a échoué → Vérifier les logs `docker-compose logs`

**Solutions :**
```bash
# Vérifier le health check
curl http://localhost:5000/api/health

# Vérifier que Nginx proxy correctement
curl -I https://cjd80.fr

# Reconstruire complètement
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### La base de données ne se connecte pas

**Vérifications :**
```bash
# Tester la connexion PostgreSQL depuis le container
docker-compose exec cjd-app sh
# Puis dans le container:
# npm install -g pg
# node -e "const {Client} = require('pg'); const c = new Client(process.env.DATABASE_URL); c.connect().then(() => console.log('OK')).catch(e => console.error(e));"
```

**Solutions :**
- Vérifier que `DATABASE_URL` est correcte dans `.env`
- Vérifier que PostgreSQL accepte les connexions externes
- Vérifier les règles de firewall

### Le certificat SSL ne se renouvelle pas

```bash
# Tester le renouvellement manuellement
sudo certbot renew --dry-run

# Forcer le renouvellement
sudo certbot renew --force-renewal

# Vérifier que le service certbot est actif
sudo systemctl status certbot.timer
```

### Problèmes de performances

```bash
# Vérifier l'utilisation des ressources
docker stats

# Augmenter les limites dans docker-compose.yml si nécessaire
# Section deploy.resources.limits
```

---

## 📊 Monitoring

### Health Checks disponibles

| Endpoint | Description |
|----------|-------------|
| `/api/health` | Health check global (DB + uptime) |
| `/api/health/db` | Santé de la base de données |
| `/api/health/ready` | Readiness check (pour orchestrateurs) |
| `/api/health/live` | Liveness check (toujours 200) |

### Alertes recommandées

Configurez des alertes (UptimeRobot, StatusCake, etc.) sur :
- `https://cjd80.fr/api/health` - toutes les 5 minutes
- Temps de réponse > 3 secondes
- Certificat SSL expire dans < 30 jours

---

## 🔒 Sécurité

### Recommandations

1. **Firewall** : Ouvrir uniquement les ports 80, 443, et SSH
2. **SSH** : Désactiver l'authentification par mot de passe
3. **Base de données** : Ne pas exposer PostgreSQL publiquement
4. **Secrets** : Ne jamais committer `.env` dans Git
5. **Updates** : Maintenir le système à jour (`apt update && apt upgrade`)

### Backup de la base de données

```bash
# Backup manuel
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Automatiser avec cron (quotidien à 2h du matin)
0 2 * * * pg_dump $DATABASE_URL > /backups/cjd-$(date +\%Y\%m\%d).sql
```

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `docker-compose logs`
2. Vérifier le health check : `curl http://localhost:5000/api/health`
3. Consulter ce guide de déploiement
4. Vérifier les issues GitHub

---

## ✅ Checklist de déploiement

- [ ] VPS configuré avec Docker et Nginx
- [ ] Certificat SSL obtenu et configuré
- [ ] Fichier `.env` créé avec toutes les variables
- [ ] Nginx configuré pour cjd80.fr
- [ ] Script `deploy.sh` créé et exécutable
- [ ] Secrets GitHub Actions configurés
- [ ] Premier déploiement réussi
- [ ] Health check répond correctement
- [ ] Frontend accessible sur https://cjd80.fr
- [ ] Monitoring/alertes configurés
- [ ] Backup base de données configuré
