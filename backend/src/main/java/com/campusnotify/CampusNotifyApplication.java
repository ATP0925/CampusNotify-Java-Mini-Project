package com.campusnotify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CampusNotifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusNotifyApplication.class, args);
    }
}
