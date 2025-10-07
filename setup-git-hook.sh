#!/bin/bash

# Script d'installation du hook Git pour purge automatique du cache
# Ce script configure Git pour invalider automatiquement le cache après chaque commit

echo "📦 Installation du hook Git pour purge automatique du cache..."

# Créer le fichier de hook post-commit
cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash

# Hook Git : Purge automatique du cache après chaque commit
# Ce script est exécuté automatiquement après chaque commit

# Exécuter le script d'invalidation du cache
if [ -f "invalidate-cache.sh" ]; then
  bash invalidate-cache.sh
fi
EOF

# Rendre le hook exécutable
chmod +x .git/hooks/post-commit

echo "✅ Hook post-commit installé avec succès !"
echo ""
echo "📌 Configuration terminée :"
echo "   • À chaque commit : le cache sera automatiquement invalidé"
echo "   • Les utilisateurs recevront la nouvelle version dans les 5 minutes"
echo ""
echo "💡 Vous pouvez aussi invalider le cache manuellement avec :"
echo "   bash invalidate-cache.sh"
