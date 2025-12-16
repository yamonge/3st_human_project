package com.cucook.moc.chat.controller;

import com.cucook.moc.chat.dao.ChatParticipantDAO;
import com.cucook.moc.chat.dto.ChatParticipantDTO;
import com.cucook.moc.chat.dto.ChatRoomSummaryDTO;
import com.cucook.moc.chat.service.ShoppingChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// REST - 채팅방 목록 조회
@RestController
@RequestMapping("/api/chat/rooms")
public class ShoppingChatRoomController {

    @Autowired
    private ShoppingChatRoomService shoppingChatRoomService;

    @Autowired
    private ChatParticipantDAO chatParticipantDAO;

    @GetMapping("/me")
    public List<ChatRoomSummaryDTO> getMyChatRooms(@RequestParam("userId") Long userId) {
        return shoppingChatRoomService.getMyChatRooms(userId);
    }

    /**
     * 채팅방 참여자 목록 조회
     */
    @GetMapping("/{chatRoomId}/participants")
    public ResponseEntity<List<ChatParticipantDTO>> getParticipants(
            @PathVariable Long chatRoomId) {
        List<ChatParticipantDTO> participants = 
            chatParticipantDAO.selectParticipantInfos(chatRoomId);
        return ResponseEntity.ok(participants);
    }

    /**
     * 채팅방 나가기
     */
    @PostMapping("/{chatRoomId}/leave")
    public ResponseEntity<Void> leaveChatRoom(
            @PathVariable Long chatRoomId,
            @RequestParam Long userId) {
        shoppingChatRoomService.leaveRoom(chatRoomId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 채팅방 삭제 (방장만 가능)
     */
    @DeleteMapping("/{chatRoomId}")
    public ResponseEntity<Void> deleteChatRoom(
            @PathVariable Long chatRoomId,
            @RequestParam Long userId) {
        shoppingChatRoomService.deleteChatRoom(chatRoomId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 참여자 강퇴 (방장만 가능)
     */
    @PostMapping("/{chatRoomId}/kick")
    public ResponseEntity<Void> kickParticipant(
            @PathVariable Long chatRoomId,
            @RequestParam Long kickUserId,
            @RequestParam Long requestUserId) {
        shoppingChatRoomService.kickParticipant(chatRoomId, kickUserId, requestUserId);
        return ResponseEntity.ok().build();
    }
}
