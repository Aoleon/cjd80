#!/bin/bash

# API Validation Script - NestJS REST Routes
# Tests all REST API endpoints

BASE_URL="http://localhost:5000"
RESULTS_FILE="/srv/workspace/cjd80/tests/api-validation/rest-results.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize results
echo "{" > "$RESULTS_FILE"
echo "  \"timestamp\": \"$TIMESTAMP\"," >> "$RESULTS_FILE"
echo "  \"baseUrl\": \"$BASE_URL\"," >> "$RESULTS_FILE"
echo "  \"results\": [" >> "$RESULTS_FILE"

FIRST=true

# Function to test endpoint
test_endpoint() {
    local METHOD=$1
    local PATH=$2
    local AUTH=$3
    local DESCRIPTION=$4
    local DATA=$5

    echo -e "${YELLOW}Testing:${NC} $METHOD $PATH - $DESCRIPTION"

    START_TIME=$(date +%s%3N)

    if [ "$METHOD" = "GET" ]; then
        if [ "$AUTH" = "true" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$PATH" -H "Content-Type: application/json" 2>&1)
        else
            RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$PATH" 2>&1)
        fi
    elif [ "$METHOD" = "POST" ]; then
        if [ -n "$DATA" ]; then
            RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$PATH" -H "Content-Type: application/json" -d "$DATA" 2>&1)
        else
            RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$PATH" -H "Content-Type: application/json" 2>&1)
        fi
    fi

    END_TIME=$(date +%s%3N)
    DURATION=$((END_TIME - START_TIME))

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    # Determine status
    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
        STATUS="success"
        echo -e "${GREEN}✓${NC} $HTTP_CODE (${DURATION}ms)"
    elif [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 403 ]; then
        STATUS="auth_required"
        echo -e "${YELLOW}⚠${NC} $HTTP_CODE - Auth required (${DURATION}ms)"
    else
        STATUS="error"
        echo -e "${RED}✗${NC} $HTTP_CODE (${DURATION}ms)"
    fi

    # Write to JSON (escape quotes in body)
    BODY_ESCAPED=$(echo "$BODY" | sed 's/"/\\"/g' | tr '\n' ' ' | head -c 200)

    if [ "$FIRST" = false ]; then
        echo "," >> "$RESULTS_FILE"
    fi
    FIRST=false

    cat >> "$RESULTS_FILE" << EOF
    {
      "method": "$METHOD",
      "path": "$PATH",
      "description": "$DESCRIPTION",
      "httpCode": $HTTP_CODE,
      "status": "$STATUS",
      "duration": $DURATION,
      "requiresAuth": $AUTH,
      "responseSample": "${BODY_ESCAPED:0:100}"
    }
EOF
}

echo ""
echo "========================================="
echo "  NestJS REST API VALIDATION"
echo "========================================="
echo ""

# ===== HEALTH CHECK =====
echo "--- HEALTH CHECK ---"
test_endpoint "GET" "/api/health" "false" "Health check"
test_endpoint "GET" "/api/health/db" "false" "Database health"
test_endpoint "GET" "/api/health/ready" "false" "Readiness probe"
test_endpoint "GET" "/api/health/live" "false" "Liveness probe"
test_endpoint "GET" "/api/version" "false" "Application version"
test_endpoint "GET" "/api/status/all" "false" "All status checks"

# ===== AUTH =====
echo ""
echo "--- AUTH MODULE ---"
test_endpoint "GET" "/api/auth/mode" "false" "Get auth mode"
test_endpoint "POST" "/api/auth/login" "false" "Login endpoint" '{"email":"test@test.com","password":"test"}'
test_endpoint "GET" "/api/user" "true" "Get current user"

# ===== IDEAS =====
echo ""
echo "--- IDEAS MODULE ---"
test_endpoint "GET" "/api/ideas?page=1&limit=10" "false" "List ideas (public)"
test_endpoint "POST" "/api/ideas" "false" "Create idea (throttled)" '{"title":"Test","description":"Test"}'
test_endpoint "GET" "/api/ideas/123e4567-e89b-12d3-a456-426614174000/votes" "true" "Get votes for idea (admin)"

# ===== VOTES =====
echo ""
echo "--- VOTES MODULE ---"
test_endpoint "POST" "/api/votes" "false" "Create vote (throttled)" '{"ideaId":"123","email":"test@test.com","score":5}'

# ===== EVENTS =====
echo ""
echo "--- EVENTS MODULE ---"
test_endpoint "GET" "/api/events?page=1&limit=10" "false" "List events (public)"
test_endpoint "GET" "/api/events/123e4567-e89b-12d3-a456-426614174000/inscriptions" "true" "Get event inscriptions (admin)"

# ===== INSCRIPTIONS =====
echo ""
echo "--- INSCRIPTIONS MODULE ---"
test_endpoint "POST" "/api/inscriptions" "false" "Create inscription (throttled)"

# ===== UNSUBSCRIPTIONS =====
echo ""
echo "--- UNSUBSCRIPTIONS MODULE ---"
test_endpoint "POST" "/api/unsubscriptions" "false" "Create unsubscription"

# ===== LOANS =====
echo ""
echo "--- LOANS MODULE (Public) ---"
test_endpoint "GET" "/api/loan-items?page=1&limit=10" "false" "List loan items (public)"
test_endpoint "POST" "/api/loan-items" "false" "Create loan item proposal"

echo ""
echo "--- LOANS MODULE (Admin) ---"
test_endpoint "GET" "/api/admin/loan-items?page=1&limit=10" "true" "List all loan items (admin)"
test_endpoint "GET" "/api/admin/loan-items/123e4567-e89b-12d3-a456-426614174000" "true" "Get loan item by ID (admin)"

# ===== MEMBERS =====
echo ""
echo "--- MEMBERS MODULE (Public) ---"
test_endpoint "POST" "/api/members/propose" "false" "Propose member"

echo ""
echo "--- MEMBERS MODULE (Admin) ---"
test_endpoint "GET" "/api/admin/members?page=1&limit=10" "true" "List members (admin)"
test_endpoint "GET" "/api/admin/member-tags" "true" "List member tags (admin)"

# ===== PATRONS =====
echo ""
echo "--- PATRONS MODULE (Admin) ---"
test_endpoint "GET" "/api/patrons?page=1&limit=10" "true" "List patrons (admin)"
test_endpoint "POST" "/api/patrons/propose" "true" "Propose patron"

# ===== FINANCIAL =====
echo ""
echo "--- FINANCIAL MODULE (Admin) ---"
test_endpoint "GET" "/api/admin/finance/budgets" "true" "List budgets (admin)"
test_endpoint "GET" "/api/admin/finance/expenses" "true" "List expenses (admin)"
test_endpoint "GET" "/api/admin/finance/categories" "true" "List categories (admin)"

# ===== TRACKING =====
echo ""
echo "--- TRACKING MODULE (Admin) ---"
test_endpoint "GET" "/api/tracking/dashboard" "true" "Tracking dashboard (admin)"
test_endpoint "GET" "/api/tracking/metrics" "true" "Tracking metrics (admin)"
test_endpoint "GET" "/api/tracking/alerts" "true" "Tracking alerts (admin)"

# ===== ADMIN =====
echo ""
echo "--- ADMIN MODULE ---"
test_endpoint "GET" "/api/admin/stats" "true" "Admin stats"
test_endpoint "GET" "/api/admin/db-health" "true" "Database health (admin)"
test_endpoint "GET" "/api/admin/ideas?page=1&limit=10" "true" "List all ideas (admin)"
test_endpoint "GET" "/api/admin/events?page=1&limit=10" "true" "List all events (admin)"
test_endpoint "GET" "/api/admin/administrators" "true" "List administrators (super_admin)"
test_endpoint "GET" "/api/admin/features" "false" "Get feature config"

# ===== BRANDING =====
echo ""
echo "--- BRANDING MODULE ---"
test_endpoint "GET" "/api/admin/branding" "false" "Get branding config"

# ===== CHATBOT =====
echo ""
echo "--- CHATBOT MODULE (Admin) ---"
test_endpoint "POST" "/api/admin/chatbot/query" "true" "Chatbot query (admin)" '{"question":"Hello"}'

# ===== LOGS =====
echo ""
echo "--- LOGS MODULE ---"
test_endpoint "POST" "/api/logs/frontend-error" "false" "Log frontend error"

# Close JSON
echo "" >> "$RESULTS_FILE"
echo "  ]" >> "$RESULTS_FILE"
echo "}" >> "$RESULTS_FILE"

echo ""
echo "========================================="
echo "  Results saved to: $RESULTS_FILE"
echo "========================================="
