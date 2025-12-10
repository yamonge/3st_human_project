package com.cucook.moc.chat.controller;

import com.cucook.moc.chat.dto.ChatMessageDTO;
import com.cucook.moc.chat.service.ShoppingChatMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

// WebSocket STOMP - 채팅 메시지 전송
@Controller
public class ShoppingChatStompController {

    @Autowired
    private ShoppingChatMessageService shoppingChatMessageService;

    /**
     * 클라이언트: /pub/shopping/chat/message 로 SEND
     * payload: { chatRoomId, senderUserId, messageTypeCd, messageText }
     * senderNickname은 서버에서 UserDAO로 조회해서 세팅
     */
    @MessageMapping("/shopping/chat/message")
    public void handleChatMessage(ChatMessageDTO dto) {
        shoppingChatMessageService.sendMessage(dto);
    }
}
