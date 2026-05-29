package com.jfeat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// import org.springframework.cloud.netflix.feign.EnableFeignClients;

/**
 * SpringBoot方式启动类
 *
 * @author Admin
 * @Date 2017/5/21 12:06
 */
@SpringBootApplication
// @EnableFeignClients(basePackages = "com.jfeat.users.common.feignclient")
public class AmApplication {
    protected final static Logger logger = LoggerFactory.getLogger(AmApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(AmApplication.class, args);
        logger.info("workFlow Application run success!");
    }
}
