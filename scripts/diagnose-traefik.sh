#!/bin/bash
# Script de diagnostic Traefik pour cjd80.fr
# À exécuter sur le VPS pour diagnostiquer les problèmes de routage

set -e

echo "=================================================="
echo "🔍 Diagnostic Traefik - cjd80.fr"
echo "=================================================="
echo ""

cd /docker/cjd80

# 1. Vérifier que le conteneur est en cours d'exécution
echo "1️⃣  Vérification du conteneur cjd-app..."
if docker ps | grep -q "cjd-app"; then
    echo "   ✅ Conteneur cjd-app est en cours d'exécution"
    docker ps | grep "cjd-app"
else
    echo "   ❌ Conteneur cjd-app n'est pas en cours d'exécution"
    echo "   📋 Conteneurs arrêtés:"
    docker ps -a | grep "cjd-app" || echo "   Aucun conteneur cjd-app trouvé"
    exit 1
fi
echo ""

# 2. Vérifier le réseau proxy
echo "2️⃣  Vérification du réseau proxy..."
if docker network ls | grep -q "proxy"; then
    echo "   ✅ Réseau proxy existe"
    
    # Vérifier si cjd-app est sur le réseau proxy
    if docker network inspect proxy 2>/dev/null | grep -q "cjd-app"; then
        echo "   ✅ Conteneur cjd-app est sur le réseau proxy"
    else
        echo "   ❌ Conteneur cjd-app n'est PAS sur le réseau proxy"
        echo "   🔄 Tentative de connexion..."
        docker network connect proxy cjd-app 2>/dev/null && echo "   ✅ Connecté au réseau proxy" || echo "   ⚠️  Échec de la connexion"
    fi
else
    echo "   ❌ Réseau proxy n'existe pas!"
    echo "   🔄 Création du réseau proxy..."
    docker network create proxy && echo "   ✅ Réseau proxy créé" || echo "   ❌ Échec de la création"
fi
echo ""

# 3. Vérifier les labels Traefik
echo "3️⃣  Vérification des labels Traefik..."
if command -v jq &> /dev/null; then
    TRAEFIK_ENABLED=$(docker inspect cjd-app 2>/dev/null | jq -r '.[0].Config.Labels["traefik.enable"]' || echo "")
    TRAEFIK_RULE=$(docker inspect cjd-app 2>/dev/null | jq -r '.[0].Config.Labels["traefik.http.routers.cjd80.rule"]' || echo "")
else
    TRAEFIK_ENABLED=$(docker inspect cjd-app 2>/dev/null | grep -o '"traefik.enable":"true"' || echo "")
    TRAEFIK_RULE=$(docker inspect cjd-app 2>/dev/null | grep -o '"traefik.http.routers.cjd80.rule":"[^"]*"' || echo "")
fi

if [ "$TRAEFIK_ENABLED" = "true" ] || [ -n "$TRAEFIK_ENABLED" ]; then
    echo "   ✅ Label traefik.enable=true trouvé"
    echo "   📋 Règle de routage: $TRAEFIK_RULE"
    
    echo "   📋 Tous les labels Traefik:"
    docker inspect cjd-app 2>/dev/null | grep "traefik" || echo "   Aucun label Traefik trouvé"
else
    echo "   ❌ Label traefik.enable non trouvé ou incorrect"
    echo "   📋 Labels actuels du conteneur:"
    docker inspect cjd-app 2>/dev/null | grep -A 30 "Labels" || echo "   Impossible de lire les labels"
fi
echo ""

# 4. Vérifier que Traefik est en cours d'exécution
echo "4️⃣  Vérification de Traefik..."
if docker ps | grep -q "traefik"; then
    echo "   ✅ Traefik est en cours d'exécution"
    
    # Vérifier que Traefik peut voir le conteneur
    echo "   🔍 Vérification que Traefik détecte cjd-app..."
    if docker exec traefik wget --spider -q http://cjd-app:5000/api/health 2>/dev/null; then
        echo "   ✅ Traefik peut accéder au conteneur"
    else
        echo "   ⚠️  Traefik ne peut pas accéder directement au conteneur"
        echo "   (Cela peut être normal si Traefik utilise le réseau proxy)"
    fi
else
    echo "   ❌ Traefik n'est pas en cours d'exécution!"
    echo "   ⚠️  Traefik doit être démarré pour que le routage fonctionne"
fi
echo ""

# 5. Vérifier le health check interne
echo "5️⃣  Vérification du health check interne..."
if docker compose exec -T cjd-app wget --spider -q http://localhost:5000/api/health 2>/dev/null; then
    echo "   ✅ Health check interne réussi"
    HEALTH_RESPONSE=$(docker compose exec -T cjd-app wget -q -O- http://localhost:5000/api/health 2>/dev/null || echo "")
    echo "   📋 Réponse: $HEALTH_RESPONSE"
else
    echo "   ❌ Health check interne échoué"
fi
echo ""

# 6. Vérifier l'accès depuis l'extérieur (si possible)
echo "6️⃣  Vérification de l'accès externe..."
if curl -f -s -o /dev/null https://cjd80.fr/api/health 2>/dev/null; then
    echo "   ✅ Site accessible depuis l'extérieur"
    HEALTH_RESPONSE=$(curl -s https://cjd80.fr/api/health 2>/dev/null || echo "")
    echo "   📋 Réponse: $HEALTH_RESPONSE"
else
    echo "   ❌ Site non accessible depuis l'extérieur"
    echo "   ⚠️  Cela peut indiquer un problème de configuration Traefik"
fi
echo ""

# 7. Résumé et recommandations
echo "=================================================="
echo "📊 Résumé"
echo "=================================================="
echo ""

if docker ps | grep -q "cjd-app" && docker network inspect proxy 2>/dev/null | grep -q "cjd-app"; then
    echo "✅ Conteneur et réseau: OK"
else
    echo "❌ Problème avec le conteneur ou le réseau"
fi

if [ "$TRAEFIK_ENABLED" = "true" ] || [ -n "$TRAEFIK_ENABLED" ]; then
    echo "✅ Labels Traefik: OK"
else
    echo "❌ Labels Traefik: Manquants ou incorrects"
fi

if docker ps | grep -q "traefik"; then
    echo "✅ Traefik: En cours d'exécution"
    echo ""
    echo "💡 Si le site n'est toujours pas accessible:"
    echo "   1. Redémarrer Traefik: docker restart traefik"
    echo "   2. Vérifier les logs Traefik: docker logs traefik"
    echo "   3. Vérifier la configuration Traefik"
else
    echo "❌ Traefik: Non démarré"
    echo ""
    echo "💡 Action requise: Démarrer Traefik"
fi

echo ""
echo "=================================================="

