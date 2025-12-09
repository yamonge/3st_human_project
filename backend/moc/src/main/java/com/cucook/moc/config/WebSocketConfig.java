package com.cucook.moc.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // 클라이언트가 접속할 WebSocket 엔드포인트
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-shopping-chat")   // 예: ws://서버/ws-shopping-chat
                .setAllowedOriginPatterns("*")
                .withSockJS(); // 앱에서 SockJS 쓸 거면 유지, 아니면 제거 가능
    }

    // 메시지 브로커 설정
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 구독용 prefix
        registry.enableSimpleBroker("/sub");
        // 발행용 prefix
        registry.setApplicationDestinationPrefixes("/pub");
    }
}
