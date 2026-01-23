#!/bin/bash

# Script de test pour l'infrastructure Admin Layout
# Vérifie la présence de tous les fichiers critiques

set -e

echo "=========================================="
echo "Test Infrastructure Admin Layout"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
PASSED=0
FAILED=0

# Fonction de test
test_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $description - MISSING: $file"
        ((FAILED++))
    fi
}

echo "=== Layouts ==="
test_file "app/(protected)/layout.tsx" "Protected layout (auth guard)"
test_file "app/(protected)/admin/layout.tsx" "Admin layout (sidebar + header)"
test_file "app/(protected)/error.tsx" "Error boundary"
echo ""

echo "=== Admin Components ==="
test_file "components/admin/admin-sidebar.tsx" "AdminSidebar component"
test_file "components/admin/admin-breadcrumbs.tsx" "AdminBreadcrumbs component"
test_file "components/admin/index.ts" "Admin components exports"
echo ""

echo "=== Pages ==="
test_file "app/(protected)/admin/page.tsx" "Admin root page"
test_file "app/(protected)/admin/dashboard/page.tsx" "Dashboard page"
test_file "app/(protected)/admin/members/page.tsx" "Members page"
test_file "app/(protected)/admin/patrons/page.tsx" "Patrons page"
echo ""

echo "=== Documentation ==="
test_file "docs/ADMIN_LAYOUT_INFRASTRUCTURE.md" "Infrastructure documentation"
test_file "ADMIN_LAYOUT_SUMMARY.md" "Summary documentation"
echo ""

echo "=== Dependencies ==="
test_file "hooks/use-auth.tsx" "useAuth hook"
test_file "components/ui/button.tsx" "Button UI component"
test_file "components/ui/breadcrumb.tsx" "Breadcrumb UI component"
test_file "components/ui/avatar.tsx" "Avatar UI component"
echo ""

echo "=========================================="
echo -e "Results: ${GREEN}${PASSED} passed${NC}, ${RED}${FAILED} failed${NC}"
echo "=========================================="
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start dev server: npm run dev"
    echo "2. Navigate to: http://localhost:3000/admin/dashboard"
    echo "3. Check authentication redirect"
    echo "4. Test sidebar navigation"
    echo "5. Test breadcrumbs"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please check missing files.${NC}"
    echo ""
    exit 1
fi
