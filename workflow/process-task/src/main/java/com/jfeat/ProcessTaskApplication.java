package com.jfeat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.cloud.netflix.feign.EnableFeignClients;

@SpringBootApplication

@EnableCaching(proxyTargetClass = true)  // 强制使用CGLIB
@EnableAsync(proxyTargetClass = true)
@EnableFeignClients
public class ProcessTaskApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProcessTaskApplication.class, args);
    }

}
