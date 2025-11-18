#!/bin/bash
# Script pour synchroniser package-lock.json sur le serveur

set -e

echo "=== Synchronisation package-lock.json sur le serveur ==="

cd /docker/cjd80

echo "1. Pull dernier code..."
git pull origin main

echo "2. Installation npm pour synchroniser package-lock.json..."
npm install

echo "3. Vérification que bufferutil@4.0.9 est présent..."
if grep -q '"bufferutil".*"4.0.9"' package-lock.json; then
    echo "✅ bufferutil@4.0.9 trouvé dans package-lock.json"
else
    echo "❌ bufferutil@4.0.9 non trouvé"
    exit 1
fi

echo "4. Test npm ci..."
npm ci --dry-run

echo "5. Commit et push package-lock.json..."
git add package-lock.json
git commit -m "fix: synchroniser package-lock.json avec bufferutil@4.0.9" || echo "Aucun changement à commiter"
git push origin main

echo "✅ Synchronisation terminée"

