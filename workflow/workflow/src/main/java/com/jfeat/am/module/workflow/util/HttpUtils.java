package com.jfeat.am.module.workflow.util;

import com.alibaba.fastjson.JSONObject;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.*;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * HTTP请求工具类
 */
public class HttpUtils {
    private static final Logger logger = LoggerFactory.getLogger(HttpUtils.class);
    
    private static final int CONNECT_TIMEOUT = 5000; // 连接超时时间
    private static final int SOCKET_TIMEOUT = 10000; // 数据读取超时时间
    
    private static final RequestConfig requestConfig = RequestConfig.custom()
            .setConnectTimeout(CONNECT_TIMEOUT)
            .setSocketTimeout(SOCKET_TIMEOUT)
            .build();
    
    /**
     * 发送GET请求
     *
     * @param url 请求URL
     * @param params 请求参数
     * @param headers 请求头
     * @return 响应内容
     */
    public static String doGet(String url, Map<String, String> params, Map<String, String> headers) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            // 构建带参数的URL
            StringBuilder urlBuilder = new StringBuilder(url);
            if (params != null && !params.isEmpty()) {
                urlBuilder.append(url.contains("?") ? "&" : "?");
                params.forEach((key, value) -> {
                    try {
                        urlBuilder.append(key)
                                .append("=")
                                .append(java.net.URLEncoder.encode(value, StandardCharsets.UTF_8.name()))
                                .append("&");
                    } catch (Exception e) {
                        logger.error("URL编码异常: {}", e.getMessage());
                    }
                });
                urlBuilder.setLength(urlBuilder.length() - 1); // 移除最后一个&
            }
            
            HttpGet httpGet = new HttpGet(urlBuilder.toString());
            httpGet.setConfig(requestConfig);
            
            // 设置请求头
            if (headers != null) {
                headers.forEach(httpGet::addHeader);
            }
            
            HttpResponse response = httpClient.execute(httpGet);
            return handleResponse(response);
        } catch (Exception e) {
            logger.error("GET请求发生异常: {}", e.getMessage());
            throw new RuntimeException("HTTP GET request failed", e);
        }
    }
    
    /**
     * 发送POST请求
     *
     * @param url 请求URL
     * @param jsonBody JSON请求体
     * @param headers 请求头
     * @return 响应内容
     */
    public static String doPost(String url, JSONObject jsonBody, Map<String, String> headers) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPost httpPost = new HttpPost(url);
            httpPost.setConfig(requestConfig);
            
            // 设置请求头
            if (headers != null) {
                headers.forEach(httpPost::addHeader);
            }
            
            // 设置请求体
            if (jsonBody != null) {
                StringEntity entity = new StringEntity(jsonBody.toString(), StandardCharsets.UTF_8);
                entity.setContentType("application/json");
                httpPost.setEntity(entity);
            }
            
            HttpResponse response = httpClient.execute(httpPost);
            return handleResponse(response);
        } catch (Exception e) {
            logger.error("POST请求发生异常: {}", e.getMessage());
            throw new RuntimeException("HTTP POST request failed", e);
        }
    }
    
    /**
     * 发送PUT请求
     *
     * @param url 请求URL
     * @param jsonBody JSON请求体
     * @param headers 请求头
     * @return 响应内容
     */
    public static String doPut(String url, JSONObject jsonBody, Map<String, String> headers) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpPut httpPut = new HttpPut(url);
            httpPut.setConfig(requestConfig);
            
            // 设置请求头
            if (headers != null) {
                headers.forEach(httpPut::addHeader);
            }
            
            // 设置请求体
            if (jsonBody != null) {
                StringEntity entity = new StringEntity(jsonBody.toString(), StandardCharsets.UTF_8);
                entity.setContentType("application/json");
                httpPut.setEntity(entity);
            }
            
            HttpResponse response = httpClient.execute(httpPut);
            return handleResponse(response);
        } catch (Exception e) {
            logger.error("PUT请求发生异常: {}", e.getMessage());
            throw new RuntimeException("HTTP PUT request failed", e);
        }
    }
    
    /**
     * 发送DELETE请求
     *
     * @param url 请求URL
     * @param headers 请求头
     * @return 响应内容
     */
    public static String doDelete(String url, Map<String, String> headers) {
        try (CloseableHttpClient httpClient = HttpClients.createDefault()) {
            HttpDelete httpDelete = new HttpDelete(url);
            httpDelete.setConfig(requestConfig);
            
            // 设置请求头
            if (headers != null) {
                headers.forEach(httpDelete::addHeader);
            }
            
            HttpResponse response = httpClient.execute(httpDelete);
            return handleResponse(response);
        } catch (Exception e) {
            logger.error("DELETE请求发生异常: {}", e.getMessage());
            throw new RuntimeException("HTTP DELETE request failed", e);
        }
    }
    
    /**
     * 处理HTTP响应
     *
     * @param response HTTP响应对象
     * @return 响应内容
     * @throws IOException IO异常
     */
    private static String handleResponse(HttpResponse response) throws IOException {
        HttpEntity entity = response.getEntity();
        if (entity != null) {
            String result = EntityUtils.toString(entity, StandardCharsets.UTF_8);
            int statusCode = response.getStatusLine().getStatusCode();
            
            if (statusCode >= 200 && statusCode < 300) {
                return result;
            } else {
                logger.error("HTTP请求失败, 状态码: {}, 响应内容: {}", statusCode, result);
                throw new RuntimeException("HTTP request failed with status code: " + statusCode);
            }
        }
        return null;
    }
}