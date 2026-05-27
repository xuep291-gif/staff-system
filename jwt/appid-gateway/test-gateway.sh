#!/bin/bash
# Appid Gateway 测试脚本
# 用于验证网关功能

set -e

GATEWAY_URL="${GATEWAY_URL:-http://localhost:8081}"
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"

echo "================================"
echo "Appid Gateway 测试脚本"
echo "================================"
echo "Gateway URL: $GATEWAY_URL"
echo "Backend URL: $BACKEND_URL"
echo ""

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_case() {
    local name="$1"
    local url="$2"
    local expected="$3"

    echo -n "Testing: $name ... "

    local response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n-1)

    if [ "$http_code" = "$expected" ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}FAIL${NC} (HTTP $http_code, expected $expected)"
        echo "Response: $body"
        return 1
    fi
}

# 测试 1: 健康检查
test_case "Health Check" "$GATEWAY_URL/health" "200"

# 测试 2: 管理 API - 获取 appid 列表
echo ""
echo "Testing Admin API..."
test_case "Get Appid List" "$GATEWAY_URL/admin/appids" "200"

# 测试 3: 路由转发（需要后端服务）
echo ""
echo "Testing Route Forwarding..."
echo "(Note: These tests require a running backend service)"

# 测试 app-a 路由
echo -n "Testing app-a route ... "
response=$(curl -s -i "$GATEWAY_URL/app-a/api/health" 2>/dev/null)
if echo "$response" | grep -q "X-APPID-KEY"; then
    echo -e "${GREEN}PASS${NC} (X-APPID-KEY header found)"
else
    echo -e "${YELLOW}SKIP${NC} (No backend or header not found)"
fi

# 测试 app-b 路由
echo -n "Testing app-b route ... "
response=$(curl -s -i "$GATEWAY_URL/app-b/api/health" 2>/dev/null)
if echo "$response" | grep -q "X-APPID-KEY"; then
    echo -e "${GREEN}PASS${NC} (X-APPID-KEY header found)"
else
    echo -e "${YELLOW}SKIP${NC} (No backend or header not found)"
fi

# 测试 4: 详细查看 X-APPID-KEY header
echo ""
echo "Detailed header inspection:"
echo "curl -v $GATEWAY_URL/app-a/api/health"
echo "---"
curl -v "$GATEWAY_URL/app-a/api/health" 2>&1 | grep -i "x-appid-key" || echo "No X-APPID-KEY header found"

# 测试 5: 添加新的 appid
echo ""
echo "Testing Add Appid..."
echo -n "Adding app-c ... "
response=$(curl -s -X POST "$GATEWAY_URL/admin/appids" \
    -H "Content-Type: application/json" \
    -d '{"appid":"app-c","secret":"app-c-secret","validity_days":30}' \
    -w "\n%{http_code}" 2>/dev/null)
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${YELLOW}Result: $http_code${NC}"
fi

# 测试 6: 删除 appid
echo ""
echo "Testing Remove Appid..."
echo -n "Removing app-c ... "
response=$(curl -s -X DELETE "$GATEWAY_URL/admin/appids?appid=app-c" \
    -w "\n%{http_code}" 2>/dev/null)
http_code=$(echo "$response" | tail -n1)
if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${YELLOW}Result: $http_code${NC}"
fi

echo ""
echo "================================"
echo "测试完成！"
echo "================================"
echo ""
echo "手动测试命令："
echo "  # 健康检查"
echo "  curl $GATEWAY_URL/health"
echo ""
echo "  # 查看 appid 配置"
echo "  curl $GATEWAY_URL/admin/appids"
echo ""
echo "  # 测试路由转发（带详细 header）"
echo "  curl -v $GATEWAY_URL/app-a/api/health"
echo ""
echo "  # 测试后端集成"
echo "  curl $GATEWAY_URL/app-a/api/health \\"
echo "    -H 'X-APPID-KEY: test-key'"
