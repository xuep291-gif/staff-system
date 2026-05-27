#!/bin/bash
#
# generate-appid-key.sh
# 基于 Maven 的 X-APPID-KEY 生成脚本
#
# 使用方式：
#   ./generate-appid-key.sh <appid> [days|expire]
#
# 示例：
#   ./generate-appid-key.sh xuexi-songto 2027-01-01  # 指定过期日期
#   ./generate-appid-key.sh xuexi-songto 90          # 指定有效天数
#   ./generate-appid-key.sh xuexi-songto             # 使用默认 30 天
#

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 打印使用说明
print_usage() {
    echo -e "${GREEN}Usage:${NC}"
    echo -e "  $0 <appid> [days|expire]"
    echo ""
    echo -e "${GREEN}Arguments:${NC}"
    echo -e "  appid     App identifier (letters, numbers, hyphen, underscore only)"
    echo -e "  days      Validity days (optional, default: 30)"
    echo -e "  expire    Expiry date in YYYY-MM-DD format (optional)"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo -e "  $0 xuexi-songto 2027-01-01    # expire on 2027-01-01"
    echo -e "  $0 xuexi-songto 90            # valid for 90 days"
    echo -e "  $0 xuexi-songto               # default 30 days"
    exit 1
}

# 输出 curl 测试命令
print_curl_command() {
    local appid="$1"
    local key="$2"
    local url="${3:-http://localhost:8080/api/endpoint}"

    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📝 Test with curl:${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}curl${NC} ${url} \\"
    echo -e "  ${BLUE}-H${NC} \"X-APPID-KEY: ${key}\" \\"
    echo -e "  ${BLUE}-H${NC} \"Content-Type: application/json\""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# 检查参数
if [[ $# -eq 0 ]]; then
    print_usage
fi

# 检查 Maven 是否安装
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}Error: Maven not found. Please install Maven first.${NC}"
    exit 1
fi

# 检查是否在正确的目录中
if [[ ! -f "${SCRIPT_DIR}/pom.xml" ]]; then
    echo -e "${RED}Error: pom.xml not found. Please run this script in jwt-core directory.${NC}"
    exit 1
fi

# 切换到项目目录
cd "${SCRIPT_DIR}"

# Maven exec 命令
MVN_CMD="mvn -q exec:java -Dexec.mainClass=com.jfeat.am.core.jwt.AppidKeyCli"

# 直接模式
APPID="$1"
EXPIRE="$2"

# 验证 appid 格式（只允许字母、数字、中划线、下划线）
if [[ ! "$APPID" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    echo -e "${RED}Error: Invalid appid format. Only letters, numbers, hyphen and underscore are allowed.${NC}"
    exit 1
fi

echo -e "${GREEN}Generating X-APPID-KEY for: ${APPID}${NC}"

# 检测第二个参数是日期还是天数
calculated_days=""
if [[ -n "$EXPIRE" ]]; then
    # 检查是否是日期格式 (YYYY-MM-DD)
    if [[ "$EXPIRE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        # 计算从今天到过期日期的天数
        expire_epoch=$(date -d "$EXPIRE" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$EXPIRE" +%s 2>/dev/null)
        today_epoch=$(date +%s)

        if [[ -n "$expire_epoch" && "$expire_epoch" -gt "$today_epoch" ]]; then
            calculated_days=$(( (expire_epoch - today_epoch) / 86400 ))
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "${GREEN}📅 Expiry Date Analysis:${NC}"
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
            echo -e "  ${YELLOW}Input:${NC}        ${EXPIRE}"
            echo -e "  ${YELLOW}Today:${NC}        $(date +%Y-%m-%d)"
            echo -e "  ${YELLOW}Calculated Days:${NC} ${calculated_days} days"
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        else
            echo -e "${YELLOW}Warning: Invalid or past expiry date. Using as-is.${NC}"
        fi
    fi
fi

# 捕获输出并解析 X-APPID-KEY
output=""
x_appid_key=""

# 如果有第二个参数，传递给程序
if [[ -n "$EXPIRE" ]]; then
    output=$(eval "${MVN_CMD} -Dexec.args=\"${APPID} ${EXPIRE}\"" 2>&1)
else
    output=$(eval "${MVN_CMD} -Dexec.args=\"${APPID}\"" 2>&1)
fi

# 显示原始输出
echo "$output"

# 解析 X-APPID-KEY (格式: "    <key_value>" 或直接在 "X-APPID-KEY: " 后)
x_appid_key=$(echo "$output" | grep -oP '(?<=X-APPID-KEY: )\S+' | head -1)

# 如果没找到，尝试解析 "✓ X-APPID-KEY generated:" 后的缩进值
if [[ -z "$x_appid_key" ]]; then
    x_appid_key=$(echo "$output" | grep -A1 "✓ X-APPID-KEY generated" | tail -1 | sed 's/^[[:space:]]*//')
fi

# 输出 curl 测试命令
if [[ -n "$x_appid_key" ]]; then
    print_curl_command "$APPID" "$x_appid_key"
fi
