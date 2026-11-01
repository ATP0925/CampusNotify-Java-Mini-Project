package com.campusnotify.config;

import com.campusnotify.security.SlidingTokenRenewalInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final SlidingTokenRenewalInterceptor slidingTokenRenewalInterceptor;

    public WebMvcConfig(SlidingTokenRenewalInterceptor slidingTokenRenewalInterceptor) {
        this.slidingTokenRenewalInterceptor = slidingTokenRenewalInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(slidingTokenRenewalInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/login", "/api/auth/register");
    }
}
