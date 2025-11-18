# Configuration Remote - SSH pour CJD80

## 📦 Installation de l'extension

1. **Ouvrir le panneau Extensions** dans Cursor (Cmd+Shift+X sur Mac)
2. **Rechercher** : `Remote - SSH`
3. **Installer** l'extension `Remote - SSH` par Microsoft
4. **Installer** aussi `Remote - SSH: Editing Configuration Files` (optionnel mais utile)

## 🔧 Configuration SSH

### Option 1 : Configuration automatique (recommandée)

1. **Ouvrir la palette de commandes** : `Cmd+Shift+P` (Mac) ou `Ctrl+Shift+P` (Windows/Linux)
2. **Taper** : `Remote-SSH: Connect to Host`
3. **Sélectionner** : `Add New SSH Host...`
4. **Entrer** : `thibault@141.94.31.162`
5. **Choisir** le fichier de configuration SSH (généralement `~/.ssh/config`)
6. **Se connecter** : `Remote-SSH: Connect to Host` → `141.94.31.162`

### Option 2 : Configuration manuelle

1. **Ouvrir votre terminal**
2. **Éditer le fichier SSH config** :
   ```bash
   nano ~/.ssh/config
   ```
3. **Ajouter cette configuration** :
   ```
   Host cjd80-server
       HostName 141.94.31.162
       User thibault
       Port 22
   ```
4. **Sauvegarder** : `Ctrl+O` puis `Ctrl+X`
5. **Dans Cursor** : `Cmd+Shift+P` → `Remote-SSH: Connect to Host` → `cjd80-server`

## 🔐 Première connexion

Lors de la première connexion :
1. Cursor vous demandera le **mot de passe** : `@Tibo4713234`
2. Vous pouvez choisir de **sauvegarder le mot de passe** (optionnel)
3. Cursor va installer le serveur Remote SSH sur le serveur distant
4. Une nouvelle fenêtre Cursor s'ouvrira connectée au serveur

## 📁 Accéder aux fichiers du serveur

Une fois connecté :
- **Explorateur de fichiers** : Vous verrez les fichiers du serveur
- **Terminal intégré** : Le terminal sera connecté au serveur
- **Recherche** : Vous pouvez rechercher dans les fichiers du serveur
- **Édition** : Vous pouvez éditer directement les fichiers sur le serveur

## 🔍 Trouver le fichier agent.md

Une fois connecté au serveur via Remote - SSH :

1. **Ouvrir le terminal intégré** dans Cursor (connecté au serveur)
2. **Rechercher le fichier** :
   ```bash
   find / -maxdepth 6 -type f -name "agent.md" 2>/dev/null
   ```
3. **Ouvrir le fichier** directement dans Cursor depuis l'explorateur

## ⚙️ Commandes utiles

- **Se connecter** : `Cmd+Shift+P` → `Remote-SSH: Connect to Host`
- **Se déconnecter** : `Cmd+Shift+P` → `Remote-SSH: Close Remote Connection`
- **Ouvrir un terminal distant** : `Cmd+Shift+P` → `Terminal: Create New Terminal`

## 🐛 Dépannage

### Problème de connexion
- Vérifiez que le serveur est accessible : `ping 141.94.31.162`
- Vérifiez le port SSH : `ssh -p 22 thibault@141.94.31.162`

### Extension ne se connecte pas
- Redémarrez Cursor
- Vérifiez les logs : `Cmd+Shift+P` → `Remote-SSH: Show Log`

### Mot de passe demandé à chaque fois
- Configurez une clé SSH pour une connexion sans mot de passe (optionnel)
