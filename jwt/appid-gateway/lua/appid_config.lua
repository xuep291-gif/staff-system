-- appid_config.lua
-- Appid 配置管理模块
-- 负责加载、存储和检索 appid 配置

local cjson = require "cjson"
local ngx = ngx

-- 模块局部变量
local _M = {}

-- 配置文件路径
local CONFIG_FILE = "/app/conf/appid-config.yaml"

-- 固定派生密钥（必须与 Java 代码一致）
local APPID_HASH_DERIVATION_KEY = "X7K9mP2vN8wR4tY6uJ0fG5hC1dE8sZ3oP6nQ9"

-- 永久有效的 appid 列表
local PERMANENT_APPIDS = {
    root = true,
    none = true
}

-- 共享内存字典
local appid_cache = nil
local appid_locks = nil

-- HMAC-SHA256 实现
-- 使用 OpenResty 内置的 OpenSSL
local function hmac_sha256(secret, data)
    local resty_string = require "resty.string"
    local openssl_hmac = require "resty.openssl.hmac"

    local hmac = openssl_hmac.new(secret, "sha256")
    hmac:update(data)
    local result = hmac:final()

    return resty_string.to_hex(result)
end

-- 生成 appid 哈希
local function hash_appid(appid)
    local hash = hmac_sha256(APPID_HASH_DERIVATION_KEY, appid)
    return string.sub(hash, 1, 16)
end

-- 初始化共享内存
local function init_shared_memory()
    appid_cache = ngx.shared.appid_cache
    appid_locks = ngx.shared.appid_locks

    if not appid_cache then
        ngx.log(ngx.ERR, "Failed to get appid_cache shared dict")
        return false
    end

    if not appid_locks then
        ngx.log(ngx.ERR, "Failed to get appid_locks shared dict")
        return false
    end

    return true
end

-- 加载配置文件
local function load_config_file()
    local ffi = require "ffi"
    local C = ffi.C

    -- 尝试打开 YAML 配置文件
    -- 注意：这里简化处理，实际可以使用 lua-cyaml 库解析 YAML
    -- 为了简单起见，我们使用 JSON 格式的配置文件
    local json_file = "/app/conf/appid-config.json"

    local f = io.open(json_file, "r")
    if not f then
        ngx.log(ngx.WARN, "No appid config file found: ", json_file)
        return {}
    end

    local content = f:read("*all")
    f:close()

    local ok, data = pcall(cjson.decode, content)
    if not ok then
        ngx.log(ngx.ERR, "Failed to parse appid config: ", data)
        return {}
    end

    return data or {}
end

-- 获取配置锁
local function acquire_lock(key)
    if not appid_locks then
        return false
    end

    local lock_key = "lock:" .. key
    local ok, err = appid_locks:add(lock_key, true, 10)  -- 10秒超时
    if not ok then
        return false
    end

    return true
end

-- 释放配置锁
local function release_lock(key)
    if not appid_locks then
        return
    end

    local lock_key = "lock:" .. key
    appid_locks:delete(lock_key)
end

-- 加载 appid 配置
function _M.load()
    -- 初始化共享内存
    if not init_shared_memory() then
        ngx.log(ngx.ERR, "Failed to initialize shared memory")
        return false
    end

    -- 加载配置文件
    local configs = load_config_file()

    -- 存储配置到共享内存
    for appid, config in pairs(configs) do
        _M.add(appid, config.secret, config.validity_days, config.routes)
    end

    -- 如果没有配置文件，添加默认配置
    if next(configs) == nil then
        ngx.log(ngx.NOTICE, "No appid config found, using defaults")
        _M.add("app-a", "app-a-secret-key-12345", 365, {"app-a"})
        _M.add("app-b", "app-b-secret-key-67890", 365, {"app-b"})
    end

    return true
end

-- 添加 appid 配置
function _M.add(appid, secret, validity_days, routes)
    if not appid_cache then
        ngx.log(ngx.ERR, "Shared memory not initialized")
        return false
    end

    -- 获取锁
    acquire_lock(appid)

    local validity_ms = validity_days and validity_days * 86400000 or 0
    local is_permanent = PERMANENT_APPIDS[appid] == true

    local config = {
        appid = appid,
        secret = secret,
        validity_ms = validity_ms,
        is_permanent = is_permanent,
        routes = routes or {}
    }

    -- 序列化配置
    local config_json = cjson.encode(config)
    local appid_hash = hash_appid(appid)

    -- 存储到共享内存
    appid_cache:set("appid:" .. appid, config_json)
    appid_cache:set("hash:" .. appid_hash, appid)

    -- 存储路由映射
    if routes then
        for _, route in ipairs(routes) do
            appid_cache:set("route:" .. route, appid)
        end
    end

    -- 释放锁
    release_lock(appid)

    ngx.log(ngx.NOTICE, "Added appid config: appid=", appid, ", validity_days=", validity_days)
    return true
end

-- 根据 appid 获取配置
function _M.get(appid)
    if not appid_cache then
        return nil
    end

    local config_json, err = appid_cache:get("appid:" .. appid)
    if not config_json then
        return nil
    end

    return cjson.decode(config_json)
end

-- 根据路由前缀获取配置
function _M.get_by_route(route_prefix)
    if not appid_cache then
        return nil
    end

    local appid = appid_cache:get("route:" .. route_prefix)
    if not appid then
        -- 如果路由没有映射，尝试直接使用路由前缀作为 appid
        appid = route_prefix
    end

    return _M.get(appid)
end

-- 删除 appid 配置
function _M.remove(appid)
    if not appid_cache then
        return false
    end

    acquire_lock(appid)

    local config = _M.get(appid)
    if config then
        -- 删除路由映射
        if config.routes then
            for _, route in ipairs(config.routes) do
                appid_cache:delete("route:" .. route)
            end
        end

        -- 删除 appid 配置
        appid_cache:delete("appid:" .. appid)

        local appid_hash = hash_appid(appid)
        appid_cache:delete("hash:" .. appid_hash)
    end

    release_lock(appid)

    ngx.log(ngx.NOTICE, "Removed appid config: appid=", appid)
    return true
end

-- 列出所有 appid 配置
function _M.list()
    if not appid_cache then
        return {}
    end

    local appids = {}
    local key = "appid:"

    local appid = appid_cache:get(key)
    while appid do
        local config = _M.get(appid)
        if config then
            -- 移除敏感信息
            config.secret = nil
            table.insert(appids, config)
        end

        -- 获取下一个（简化处理）
        break
    end

    return appids
end

-- 刷新配置（重新加载配置文件）
function _M.reload()
    ngx.log(ngx.NOTICE, "Reloading appid configuration...")

    -- 清空现有配置
    if appid_cache then
        appid_cache:flush_all()
    end

    -- 重新加载
    return _M.load()
end

-- 获取派生密钥（用于测试）
function _M.get_derivation_key()
    return APPID_HASH_DERIVATION_KEY
end

return _M
