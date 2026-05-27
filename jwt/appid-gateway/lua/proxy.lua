-- proxy.lua
-- 代理和 X-APPID-KEY 生成模块
-- 负责生成 X-APPID-KEY 和处理请求转发

local ngx = ngx
local cjson = require "cjson"

-- 模块局部变量
local _M = {}

-- 固定派生密钥（必须与 Java 代码一致）
local APPID_HASH_DERIVATION_KEY = "X7K9mP2vN8wR4tY6uJ0fG5hC1dE8sZ3oP6nQ9"

-- 永久有效的 appid 列表
local PERMANENT_APPIDS = {
    root = true,
    none = true
}

-- HMAC-SHA256 实现
-- 使用 OpenResty 内置的 OpenSSL
local function hmac_sha256(secret, data)
    local resty_string = require "resty.string"
    local openssl_hmac = require "resty.openssl.hmac"
    local digest = require "resty.openssl.digest"

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

-- 字节数组转十六进制字符串
local function bytes_to_hex(bytes)
    local hex = ""
    for i = 1, #bytes do
        local byte = string.byte(bytes, i)
        hex = hex .. string.format("%02x", byte)
    end
    return hex
end

-- 生成 X-APPID-KEY
-- @param appid 应用标识
-- @param secret 密钥
-- @return X-APPID-KEY 字符串，格式: {appid_hash}.{timestamp}.{signature}
function _M.generate_appid_key(appid, secret)
    if not appid or not secret then
        ngx.log(ngx.ERR, "Missing appid or secret")
        return nil
    end

    -- 生成时间戳
    local timestamp = ngx.now() * 1000  -- 转换为毫秒
    timestamp = math.floor(timestamp)

    -- 生成 appid 哈希
    local appid_hash = hash_appid(appid)

    -- 构造签名数据: appid.timestamp
    local data_to_sign = appid .. "." .. timestamp

    -- 计算签名
    local signature = hmac_sha256(secret, data_to_sign)

    -- 构造 X-APPID-KEY: appid_hash.timestamp.signature
    local appid_key = string.format("%s.%d.%s", appid_hash, timestamp, signature)

    ngx.log(ngx.INFO, "Generated X-APPID-KEY for appid: ", appid)
    return appid_key
end

-- 验证 X-APPID-KEY（可选功能，用于调试）
-- @param key X-APPID-KEY 字符串
-- @param appid_config appid 配置表
-- @return 解析出的 appid，验证失败返回 nil
function _M.verify_appid_key(key, appid_config)
    if not key or key == "" then
        return nil
    end

    -- 解析 X-APPID-KEY
    local parts = {}
    for part in string.gmatch(key, "[^%.]+") do
        table.insert(parts, part)
    end

    if #parts ~= 3 then
        ngx.log(ngx.WARN, "Invalid X-APPID-KEY format: ", key)
        return nil
    end

    local provided_appid_hash = parts[1]
    local timestamp = tonumber(parts[2])
    local provided_signature = parts[3]

    if not timestamp then
        ngx.log(ngx.WARN, "Invalid timestamp in X-APPID-KEY: ", key)
        return nil
    end

    -- 检查 appid 配置
    if not appid_config or not appid_config.appid or not appid_config.secret then
        ngx.log(ngx.WARN, "Invalid appid config")
        return nil
    end

    -- 验证 appid 哈希
    local expected_appid_hash = hash_appid(appid_config.appid)
    if expected_appid_hash ~= provided_appid_hash then
        ngx.log(ngx.WARN, "Appid hash mismatch")
        return nil
    end

    -- 验证签名
    local data_to_sign = appid_config.appid .. "." .. timestamp
    local expected_signature = hmac_sha256(appid_config.secret, data_to_sign)

    if expected_signature ~= provided_signature then
        ngx.log(ngx.WARN, "Signature mismatch for appid: ", appid_config.appid)
        return nil
    end

    -- 检查过期时间
    if not PERMANENT_APPIDS[appid_config.appid] and appid_config.validity_ms then
        local current_time = ngx.now() * 1000
        if current_time - timestamp > appid_config.validity_ms then
            ngx.log(ngx.WARN, "X-APPID-KEY expired for appid: ", appid_config.appid)
            return nil
        end
    end

    -- 对于永久 appid，返回 nil
    if PERMANENT_APPIDS[appid_config.appid] then
        ngx.log(ngx.DEBUG, "Resolved permanent appid, returning nil: ", appid_config.appid)
        return nil
    end

    ngx.log(ngx.INFO, "Successfully verified appid: ", appid_config.appid)
    return appid_config.appid
end

-- 请求转发预处理
-- @param route_prefix 路由前缀
-- @param target_path 目标路径
-- @return 是否成功，失败时返回 false
function _M.pre_proxy(route_prefix, target_path)
    if not route_prefix or route_prefix == "" then
        ngx.log(ngx.WARN, "No route prefix provided")
        return false
    end

    -- 获取 appid 配置
    local appid_config = require "appid_config"
    local config = appid_config.get_by_route(route_prefix)

    if not config then
        ngx.log(ngx.WARN, "No appid config found for route: ", route_prefix)
        -- 没有配置也允许转发（不带 appid）
        return true
    end

    -- 生成 X-APPID-KEY
    local appid_key = _M.generate_appid_key(config.appid, config.secret)
    if not appid_key then
        ngx.log(ngx.ERR, "Failed to generate X-APPID-KEY for appid: ", config.appid)
        return false
    end

    -- 注入 X-APPID-KEY header
    ngx.req.set_header("X-APPID-KEY", appid_key)

    -- 添加调试 header（生产环境可移除）
    ngx.req.set_header("X-Gateway-Route", route_prefix)
    ngx.req.set_header("X-Gateway-Appid", config.appid)

    ngx.log(ngx.INFO, "Proxied request with appid: ", config.appid, ", route: ", route_prefix)
    return true
end

-- 记录请求信息
function _M.log_request()
    local method = ngx.req.get_method()
    local uri = ngx.var.request_uri
    local appid_key = ngx.var.http_x_appid_key or "none"

    ngx.log(ngx.INFO, string.format("Request: %s %s | X-APPID-KEY: %s",
        method, uri, string.sub(appid_key, 1, 20) .. "..."))
end

-- 错误响应
-- @param message 错误消息
-- @param status HTTP 状态码
function _M.error_response(message, status)
    status = status or ngx.HTTP_INTERNAL_SERVER_ERROR
    ngx.status = status
    ngx.header["Content-Type"] = "application/json"

    local response = {
        error = message,
        timestamp = ngx.time(),
        path = ngx.var.request_uri
    }

    ngx.say(cjson.encode(response))
    ngx.exit(status)
end

-- 获取客户端信息
function _M.get_client_info()
    return {
        remote_addr = ngx.var.remote_addr,
        remote_user = ngx.var.remote_user or "-",
        request_method = ngx.req.get_method(),
        request_uri = ngx.var.request_uri,
        request_time = ngx.var.request_time,
        user_agent = ngx.var.http_user_agent or "-",
        x_appid_key = ngx.var.http_x_appid_key or "none"
    }
end

return _M
