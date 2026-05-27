#!/bin/bash
# Appid Gateway 配置向导
# 交互式添加新的 appid 配置

set -e

CONFIG_FILE="conf/appid-config.json"
CONFIG_EXAMPLE="conf/appid-config.example.json"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================"
echo "Appid Gateway 配置向导"
echo -e "================================${NC}"
echo ""

# 检查配置文件是否存在
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}配置文件不存在，正在创建...${NC}"
    if [ -f "$CONFIG_EXAMPLE" ]; then
        cp "$CONFIG_EXAMPLE" "$CONFIG_FILE"
        echo -e "${GREEN}✓ 已从模板创建配置文件${NC}"
    else
        echo '{"_comment":"Appid Gateway Configuration"}' > "$CONFIG_FILE"
        echo -e "${GREEN}✓ 已创建空配置文件${NC}"
    fi
    echo ""
fi

# 读取 appid
read -p "请输入应用标识 (appid): " APPID
if [ -z "$APPID" ]; then
    echo -e "${YELLOW}appid 不能为空，退出${NC}"
    exit 1
fi

# 检查 appid 是否已存在
if grep -q "\"$APPID\"" "$CONFIG_FILE"; then
    echo -e "${YELLOW}appid '$APPID' 已存在${NC}"
    read -p "是否更新配置? (y/N): " UPDATE
    if [ "$UPDATE" != "y" ] && [ "$UPDATE" != "Y" ]; then
        echo "取消操作"
        exit 0
    fi
fi

# 读取密钥
echo ""
echo "密钥选项:"
echo "1. 自动生成强密钥 (推荐)"
echo "2. 手动输入密钥"
read -p "请选择 (1/2): " SECRET_OPTION

if [ "$SECRET_OPTION" = "2" ]; then
    read -p "请输入密钥: " SECRET
    if [ -z "$SECRET" ]; then
        echo -e "${YELLOW}密钥不能为空，使用自动生成${NC}"
        SECRET=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)
    fi
else
    SECRET=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)
    echo -e "${GREEN}✓ 已生成密钥: $SECRET${NC}"
fi

# 读取有效期
echo ""
read -p "请输入有效期 (天) [默认: 365]: " DAYS
if [ -z "$DAYS" ]; then
    DAYS=365
fi

# 读取路由前缀
echo ""
read -p "请输入路由前缀 [默认: $APPID]: " ROUTE
if [ -z "$ROUTE" ]; then
    ROUTE="$APPID"
fi

# 确认配置
echo ""
echo -e "${BLUE}================================"
echo "配置确认"
echo -e "================================${NC}"
echo "Appid:        $APPID"
echo "Secret:       $SECRET"
echo "Validity:     $DAYS 天"
echo "Route Prefix: $ROUTE"
echo ""
read -p "确认添加? (Y/n): " CONFIRM

if [ "$CONFIRM" = "n" ] || [ "$CONFIRM" = "N" ]; then
    echo "取消操作"
    exit 0
fi

# 构建配置 JSON
CONFIG_JSON=$(cat <<EOF
{
  "appid": "$APPID",
  "secret": "$SECRET",
  "validity_days": $DAYS,
  "routes": ["$ROUTE"]
}
EOF
)

# 使用 jq 添加到配置文件（如果可用）
if command -v jq >/dev/null 2>&1; then
    # 读取现有配置
    EXISTING_CONFIG=$(cat "$CONFIG_FILE")

    # 移除 _comment 和 _docs 字段（临时）
    TEMP_CONFIG=$(echo "$EXISTING_CONFIG" | jq 'del(._comment, ._docs)')

    # 添加新配置
    NEW_CONFIG=$(echo "$TEMP_CONFIG" | jq --arg key "$APPID" --argjson value "$CONFIG_JSON" '. + {($key): $value}')

    # 保存配置
    echo "$NEW_CONFIG" > "$CONFIG_FILE"

    echo -e "${GREEN}✓ 配置已添加到 $CONFIG_FILE${NC}"
else
    echo ""
    echo -e "${YELLOW}警告: jq 未安装，请手动将以下配置添加到 $CONFIG_FILE${NC}"
    echo ""
    echo '"'$APPID'": '$CONFIG_JSON','
    echo ""
fi

# 询问是否重启服务
echo ""
read -p "是否重启网关服务? (Y/n): " RESTART
if [ "$RESTART" != "n" ] && [ "$RESTART" != "N" ]; then
    if command -v make >/dev/null 2>&1; then
        make reload
    else
        echo "请手动重启服务: docker-compose restart"
    fi
fi

echo ""
echo -e "${GREEN}================================"
echo "配置完成！"
echo -e "================================${NC}"
echo ""
echo "测试命令:"
echo "  curl http://localhost:8081/$ROUTE/api/health"
echo ""
echo "管理命令:"
echo "  make appids       # 查看所有 appid"
echo "  make test-appid   # 测试指定 appid"
echo "  make logs         # 查看日志"
echo ""
