# Appid Gateway - Makefile
# 用于管理 Appid Gateway 项目

.PHONY: help build up down restart logs test clean
.PHONY: shell reload check appids add-appid remove-appid
.PHONY: gen-secret init-config validate-config test-appid setup

# 默认目标
help:
	@echo "Appid Gateway - 可用命令："
	@echo ""
	@echo "服务管理:"
	@echo "  make build         - 构建 Docker 镜像"
	@echo "  make up            - 启动服务"
	@echo "  make down          - 停止服务"
	@echo "  make restart       - 重启服务"
	@echo "  make logs          - 查看日志"
	@echo "  make shell         - 进入容器 Shell"
	@echo ""
	@echo "配置管理:"
	@echo "  make reload        - 重载 Nginx 配置"
	@echo "  make check         - 检查 Nginx 配置"
	@echo "  make appids        - 查看所有 appid 配置"
	@echo "  make add-appid     - 添加新的 appid"
	@echo "  make remove-appid  - 删除 appid"
	@echo "  make gen-secret    - 生成随机密钥"
	@echo "  make init-config   - 初始化配置文件"
	@echo "  make validate-config - 验证配置文件"
	@echo ""
	@echo "测试:"
	@echo "  make test          - 运行测试"
	@echo "  make test-appid    - 测试指定 appid"
	@echo ""
	@echo "维护:"
	@echo "  make clean         - 清理容器和镜像"
	@echo ""
	@echo "配置向导:"
	@echo "  make setup         - 交互式配置向导"
	@echo "  ./setup-appid.sh   - 直接运行配置向导"
	@echo ""

# 构建 Docker 镜像
build:
	@echo "构建 Docker 镜像..."
	docker-compose build

# 启动服务
up:
	@echo "启动服务..."
	docker-compose up -d
	@echo "等待服务启动..."
	sleep 3
	@echo "服务已启动！"
	@echo "Gateway: http://localhost:8081"
	@echo "Backend:  http://localhost:8080"
	@echo ""
	@echo "查看日志: make logs"

# 停止服务
down:
	@echo "停止服务..."
	docker-compose down

# 重启服务
restart: down up

# 查看日志
logs:
	docker-compose logs -f appid-gateway

# 运行测试
test:
	@echo "运行测试..."
	./test-gateway.sh

# 清理
clean:
	@echo "清理容器和镜像..."
	docker-compose down -v
	docker rmi appid-gateway_appid-gateway 2>/dev/null || true

# 进入容器 Shell
shell:
	docker-compose exec appid-gateway sh

# 重载 Nginx 配置
reload:
	@echo "重载 Nginx 配置..."
	docker-compose exec appid-gateway \
		/usr/local/openresty/bin/openresty -s reload

# 检查配置
check:
	@echo "检查 Nginx 配置..."
	docker-compose exec appid-gateway \
		/usr/local/openresty/nginx/sbin/nginx -t

# 查看 appid 配置
appids:
	@echo "获取 appid 配置..."
	@curl -s http://localhost:8081/admin/appids | jq .

# 添加 appid
add-appid:
	@read -p "Appid: " appid; \
	read -p "Secret: " secret; \
	read -p "Validity Days: " days; \
	curl -s -X POST http://localhost:8081/admin/appids \
		-H "Content-Type: application/json" \
		-d "{\"appid\":\"$$appid\",\"secret\":\"$$secret\",\"validity_days\":$$days}"

# 删除 appid
remove-appid:
	@read -p "Appid to remove: " appid; \
	curl -s -X DELETE "http://localhost:8081/admin/appids?appid=$$appid"

# 生成随机密钥
gen-secret:
	@echo "生成随机密钥："
	@echo ""
	@echo "方式1 (OpenSSL):"
	@openssl rand -base64 32
	@echo ""
	@echo "方式2 (UUID):"
	@uuidgen | tr -d '-'
	@echo ""
	@echo "方式3 (字母数字):"
	@cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1

# 初始化配置文件
init-config:
	@echo "初始化配置文件..."
	@if [ ! -f conf/appid-config.json ]; then \
		cp conf/appid-config.example.json conf/appid-config.json; \
		echo "配置文件已创建: conf/appid-config.json"; \
		echo "请编辑此文件添加您的 appid 配置"; \
	else \
		echo "配置文件已存在: conf/appid-config.json"; \
	fi

# 验证配置文件
validate-config:
	@echo "验证配置文件..."
	@if command -v jq >/dev/null 2>&1; then \
		jq empty conf/appid-config.json && echo "✓ 配置文件格式正确" || echo "✗ 配置文件格式错误"; \
	else \
		echo "请安装 jq 来验证配置文件: apt install jq"; \
	fi

# 测试指定 appid
test-appid:
	@read -p "Appid to test: " appid; \
	read -p "Route prefix (default: $$appid): " route; \
	if [ -z "$$route" ]; then route="$$appid"; fi; \
	echo ""; \
	echo "测试 appid: $$appid"; \
	echo "路由前缀: $$route"; \
	echo ""; \
	echo "1. 健康检查:"; \
	curl -s http://localhost:8081/health; \
	echo ""; \
	echo ""; \
	echo "2. 获取 appid 配置:"; \
	curl -s "http://localhost:8081/admin/appids?appid=$$appid" | jq .; \
	echo ""; \
	echo "3. 测试路由转发:"; \
	curl -v "http://localhost:8081/$$route/api/health" 2>&1 | grep -i "x-appid-key"; \
	echo ""; \
	echo "4. 完整请求头:"; \
	curl -v "http://localhost:8081/$$route/api/health" 2>&1 | grep -E "(> |< )"

# 交互式配置向导
setup:
	@echo "启动配置向导..."
	@./setup-appid.sh
