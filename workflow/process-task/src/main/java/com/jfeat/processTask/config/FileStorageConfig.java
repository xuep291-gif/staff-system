package com.jfeat.processTask.config;

import com.jfeat.processTask.utils.FileStorageUtils;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

@Configuration
@ConfigurationProperties(prefix = "file.storage")
public class FileStorageConfig {
    private String localPath;
    private boolean ossEnabled;

    // 初始化静态配置
    @PostConstruct
    public void init() {
        FileStorageUtils.setLocalStoragePath(this.localPath);
        FileStorageUtils.setOssEnabled(this.ossEnabled);
    }
}