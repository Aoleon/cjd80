#!/bin/bash
set -e

echo "======================================"
echo "Vérification Configuration Vitest"
echo "======================================"
echo ""

# Vérifier vitest.config.ts
echo "1. Vérification vitest.config.ts..."
if grep -q "environment: 'happy-dom'" /srv/workspace/cjd80/vitest.config.ts; then
  echo "   ✅ Environment: happy-dom"
else
  echo "   ❌ Environment NOT set to happy-dom"
  exit 1
fi

if grep -q "pool: 'threads'" /srv/workspace/cjd80/vitest.config.ts; then
  echo "   ✅ Pool: threads"
else
  echo "   ❌ Pool NOT set to threads"
  exit 1
fi

if grep -q "setupFiles.*tests/setup.ts" /srv/workspace/cjd80/vitest.config.ts; then
  echo "   ✅ SetupFiles: ./tests/setup.ts"
else
  echo "   ❌ SetupFiles NOT pointing to ./tests/setup.ts"
  exit 1
fi

# Vérifier package.json
echo ""
echo "2. Vérification package.json..."
if grep -q '"vitest": "\^4\.' /srv/workspace/cjd80/package.json; then
  echo "   ✅ Vitest: ^4.x"
else
  echo "   ❌ Vitest NOT at 4.x"
  exit 1
fi

if grep -q '"happy-dom": "\^' /srv/workspace/cjd80/package.json; then
  echo "   ✅ happy-dom: present"
else
  echo "   ❌ happy-dom: NOT found"
  exit 1
fi

if grep -q '"msw": "\^2\.' /srv/workspace/cjd80/package.json; then
  echo "   ✅ MSW: ^2.x"
else
  echo "   ❌ MSW NOT at 2.x"
  exit 1
fi

# Vérifier tests/setup.ts
echo ""
echo "3. Vérification tests/setup.ts..."
if [ -f /srv/workspace/cjd80/tests/setup.ts ]; then
  echo "   ✅ File exists: tests/setup.ts"
else
  echo "   ❌ File NOT found: tests/setup.ts"
  exit 1
fi

if grep -q "setupServer" /srv/workspace/cjd80/tests/setup.ts; then
  echo "   ✅ MSW setupServer(): present"
else
  echo "   ❌ MSW setupServer(): NOT found"
  exit 1
fi

if grep -q "server.listen" /srv/workspace/cjd80/tests/setup.ts; then
  echo "   ✅ server.listen(): present"
else
  echo "   ❌ server.listen(): NOT found"
  exit 1
fi

if grep -q "onUnhandledRequest: 'error'" /srv/workspace/cjd80/tests/setup.ts; then
  echo "   ✅ onUnhandledRequest: 'error'"
else
  echo "   ❌ onUnhandledRequest NOT configured"
  exit 1
fi

# Vérifier documentation
echo ""
echo "4. Vérification documentation..."
if [ -f /srv/workspace/cjd80/VITEST_SETUP_GUIDE.md ]; then
  echo "   ✅ File exists: VITEST_SETUP_GUIDE.md"
else
  echo "   ❌ File NOT found: VITEST_SETUP_GUIDE.md"
  exit 1
fi

if [ -f /srv/workspace/cjd80/tests/README.md ]; then
  echo "   ✅ File exists: tests/README.md"
else
  echo "   ❌ File NOT found: tests/README.md"
  exit 1
fi

echo ""
echo "======================================"
echo "✅ Toutes les vérifications passées!"
echo "======================================"
echo ""
echo "Prochaines étapes:"
echo "1. cd /srv/workspace/cjd80"
echo "2. npm install"
echo "3. npm run test"
echo ""
