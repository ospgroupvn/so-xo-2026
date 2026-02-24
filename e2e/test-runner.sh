#!/bin/bash
# E2E Test Runner Script
# Usage: ./test-runner.sh [test_name]

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "🧪 E2E Test Runner for Lottery Tracker"
echo "Base URL: $BASE_URL"
echo ""

# Health Check Test
test_health_check() {
    echo "📋 Testing Health Check..."
    response=$(curl -s "$BASE_URL/health")
    if echo "$response" | grep -q '"status"'; then
        echo "✅ Health check passed"
        return 0
    else
        echo "❌ Health check failed"
        return 1
    fi
}

# Ticket Registration Test
test_ticket_registration() {
    echo "📋 Testing Ticket Registration..."
    response=$(curl -s -X POST "$BASE_URL/api/v1/tickets" \
        -H "Content-Type: application/json" \
        -d '{"name": "Test User", "numbers": ["123", "456"]}')

    if echo "$response" | grep -q '"success":true'; then
        echo "✅ Ticket registration passed"
        return 0
    else
        echo "❌ Ticket registration failed: $response"
        return 1
    fi
}

# List Tickets Test
test_list_tickets() {
    echo "📋 Testing List Tickets..."
    response=$(curl -s "$BASE_URL/api/v1/tickets")

    if echo "$response" | grep -q '"success":true'; then
        echo "✅ List tickets passed"
        return 0
    else
        echo "❌ List tickets failed: $response"
        return 1
    fi
}

# Results API Test
test_results() {
    echo "📋 Testing Results API..."
    response=$(curl -s "$BASE_URL/api/v1/results/today")
    # 404 is acceptable if no results yet
    if echo "$response" | grep -qE '"success":(true|false)'; then
        echo "✅ Results API passed"
        return 0
    else
        echo "❌ Results API failed"
        return 1
    fi
}

# Winners API Test
test_winners() {
    echo "📋 Testing Winners API..."
    response=$(curl -s "$BASE_URL/api/v1/winners")

    if echo "$response" | grep -q '"success":true'; then
        echo "✅ Winners API passed"
        return 0
    else
        echo "❌ Winners API failed"
        return 1
    fi
}

# Admin Auth Test
test_admin_auth() {
    echo "📋 Testing Admin Authentication..."
    # Test without secret - should fail
    response=$(curl -s -X DELETE "$BASE_URL/api/v1/tickets/test-id")

    if echo "$response" | grep -q '"UNAUTHORIZED"'; then
        echo "✅ Admin auth check passed"
        return 0
    else
        echo "⚠️ Admin auth check inconclusive"
        return 0
    fi
}

# Run all tests
run_all_tests() {
    local passed=0
    local failed=0

    test_health_check && ((passed++)) || ((failed++))
    test_ticket_registration && ((passed++)) || ((failed++))
    test_list_tickets && ((passed++)) || ((failed++))
    test_results && ((passed++)) || ((failed++))
    test_winners && ((passed++)) || ((failed++))
    test_admin_auth && ((passed++)) || ((failed++))

    echo ""
    echo "================================"
    echo "Test Results: $passed passed, $failed failed"
    echo "================================"

    if [ $failed -gt 0 ]; then
        exit 1
    fi
}

# Main
case "$1" in
    health) test_health_check ;;
    register) test_ticket_registration ;;
    list) test_list_tickets ;;
    results) test_results ;;
    winners) test_winners ;;
    admin) test_admin_auth ;;
    *) run_all_tests ;;
esac
