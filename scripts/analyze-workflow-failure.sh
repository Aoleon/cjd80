#!/bin/bash
set -e

# ============================================================================
# Script d'analyse approfondie des échecs du workflow GitHub Actions
# ============================================================================

print_header() {
    echo "=================================================="
    echo "$1"
    echo "=================================================="
}

print_header "🔍 Analyse Approfondie des Échecs Workflow"

echo ""
echo "1. VÉRIFICATION DE LA SYNTAXE YAML"
echo "-----------------------------------"
if command -v yamllint &> /dev/null; then
    yamllint .github/workflows/deploy.yml || echo "⚠️  yamllint non disponible"
else
    echo "ℹ️  yamllint non installé, vérification basique..."
    # Vérification basique de la syntaxe
    python3 -c "
import yaml
try:
    with open('.github/workflows/deploy.yml', 'r') as f:
        yaml.safe_load(f)
    print('✅ Syntaxe YAML valide')
except Exception as e:
    print(f'❌ Erreur YAML: {e}')
" 2>/dev/null || echo "⚠️  Impossible de vérifier (Python/yaml requis)"
fi

echo ""
echo "2. VÉRIFICATION DES ÉTAPES DU WORKFLOW"
echo "--------------------------------------"
echo "Étapes du job build-and-push:"
grep -n "name:" .github/workflows/deploy.yml | grep -A 1 "build-and-push" -m 1 | head -10

echo ""
echo "Étapes du job deploy:"
grep -n "name:" .github/workflows/deploy.yml | grep -A 1 "deploy:" -m 1 | head -15

echo ""
echo "3. VÉRIFICATION DES SECRETS REQUIS"
echo "----------------------------------"
REQUIRED_SECRETS=("VPS_SSH_KEY" "VPS_HOST" "VPS_PORT" "VPS_USER")
echo "Secrets requis dans le workflow:"
for secret in "${REQUIRED_SECRETS[@]}"; do
    if grep -q "\${{ secrets.$secret }}" .github/workflows/deploy.yml; then
        echo "  ✅ $secret référencé"
    else
        echo "  ❌ $secret NON référencé"
    fi
done

echo ""
echo "4. VÉRIFICATION DE L'AUTHENTIFICATION GHCR"
echo "------------------------------------------"
echo "Authentification dans build-and-push:"
grep -A 5 "Log in to GitHub Container Registry" .github/workflows/deploy.yml | head -6

echo ""
echo "Authentification VPS dans deploy:"
grep -A 8 "Authenticate VPS to GHCR" .github/workflows/deploy.yml | head -9

echo ""
echo "5. VÉRIFICATION DU DOCKERFILE"
echo "------------------------------"
if [ -f "Dockerfile" ]; then
    echo "✅ Dockerfile présent"
    echo "Lignes critiques:"
    grep -E "^(FROM|RUN npm|COPY|WORKDIR)" Dockerfile | head -10
else
    echo "❌ Dockerfile manquant!"
fi

echo ""
echo "6. VÉRIFICATION DES SCRIPTS DE DÉPLOIEMENT"
echo "------------------------------------------"
if [ -f "scripts/vps-deploy.sh" ]; then
    echo "✅ scripts/vps-deploy.sh présent"
    if [ -x "scripts/vps-deploy.sh" ]; then
        echo "✅ Script exécutable"
    else
        echo "❌ Script non exécutable"
    fi
else
    echo "❌ scripts/vps-deploy.sh manquant!"
fi

echo ""
echo "7. TEST LOCAL DU BUILD"
echo "----------------------"
echo "Test npm ci (dry-run):"
npm ci --dry-run 2>&1 | tail -3 || echo "⚠️  Erreur npm ci"

echo ""
echo "Test npm run check:"
npm run check 2>&1 | tail -5 || echo "⚠️  Erreur npm run check"

echo ""
echo "8. PROBLÈMES POTENTIELS IDENTIFIÉS"
echo "-----------------------------------"
PROBLEMS=()

# Vérifier si l'authentification SSH utilise la clé
if ! grep -q "-i ~/.ssh/id_rsa" .github/workflows/deploy.yml; then
    PROBLEMS+=("L'authentification SSH n'utilise pas explicitement la clé SSH")
fi

# Vérifier si GITHUB_TOKEN est utilisé correctement
if ! grep -q "secrets.GITHUB_TOKEN" .github/workflows/deploy.yml; then
    PROBLEMS+=("GITHUB_TOKEN non utilisé dans le workflow")
fi

# Vérifier les permissions
if ! grep -q "packages: write" .github/workflows/deploy.yml; then
    PROBLEMS+=("Permission 'packages: write' manquante")
fi

if [ ${#PROBLEMS[@]} -eq 0 ]; then
    echo "✅ Aucun problème évident détecté dans le workflow"
else
    echo "⚠️  Problèmes potentiels:"
    for problem in "${PROBLEMS[@]}"; do
        echo "  - $problem"
    done
fi

echo ""
echo "9. RECOMMANDATIONS"
echo "------------------"
echo "1. Vérifier les logs GitHub Actions:"
echo "   https://github.com/Aoleon/cjd80/actions"
echo ""
echo "2. Vérifier que les secrets sont configurés:"
echo "   Settings > Secrets and variables > Actions"
echo ""
echo "3. Vérifier les permissions du repository:"
echo "   Settings > Actions > General > Workflow permissions"
echo ""
echo "4. Tester localement:"
echo "   npm ci && npm run check && npm run build"
echo ""
echo "5. Vérifier l'authentification GHCR sur le VPS:"
echo "   ssh thibault@141.94.31.162"
echo "   docker pull ghcr.io/aoleon/cjd80:latest"

print_header "✅ Analyse terminée"
