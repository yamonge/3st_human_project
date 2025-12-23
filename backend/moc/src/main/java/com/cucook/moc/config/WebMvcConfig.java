package com.cucook.moc.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring MVC 설정
 * 정적 리소스(업로드된 파일) 제공을 위한 핸들러 설정
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * 정적 리소스 핸들러 추가
     * /uploads/** 경로로 요청이 오면 classpath:/static/uploads/ 디렉토리에서 파일 제공
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 업로드된 파일 제공
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("classpath:/static/uploads/");
        
        // 기존 이미지 리소스도 명시적으로 추가
        registry.addResourceHandler("/image/**")
                .addResourceLocations("classpath:/static/image/");
    }
}
