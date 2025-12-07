package com.cucook.moc.chat.controller;

import com.cucook.moc.chat.dto.ChatRoomSummaryDTO;
import com.cucook.moc.chat.service.ShoppingChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// REST - 채팅방 목록 조회
@RestController
@RequestMapping("/api/chat/rooms")
public class ShoppingChatRoomController {

    @Autowired
    private ShoppingChatRoomService shoppingChatRoomService;

    @GetMapping("/me")
    public List<ChatRoomSummaryDTO> getMyChatRooms(@RequestParam("userId") Long userId) {
        return shoppingChatRoomService.getMyChatRooms(userId);
    }
}
