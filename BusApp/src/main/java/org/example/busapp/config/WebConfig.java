package org.example.busapp.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*") // 모든 출처 허용 (개발 중에는 좋지만, 프로덕션에서는 적절히 설정 필요)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }
}

