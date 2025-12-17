package com.seikyuuressha.lms.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Cho phép Frontend (localhost:5173) truy cập
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000")); 
        
        // Cho phép các method và header cần thiết
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        // Áp dụng cho tất cả đường dẫn, đặc biệt là /graphql
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}