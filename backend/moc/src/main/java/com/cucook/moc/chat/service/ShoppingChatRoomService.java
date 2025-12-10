package com.cucook.moc.chat.service;

import com.cucook.moc.chat.dao.ChatRoomDAO;
import com.cucook.moc.chat.dao.ChatParticipantDAO;
import com.cucook.moc.chat.dto.ChatRoomSummaryDTO;
import com.cucook.moc.chat.vo.ChatRoomVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShoppingChatRoomService {

    @Autowired
    private ChatRoomDAO chatRoomDAO;

    @Autowired
    private ChatParticipantDAO chatParticipantDAO;

    /**
     * 게시글에 대응되는 채팅방 생성 + 작성자 참여
     */
    @Transactional
    public Long createRoomForPost(Long shoppingPostId, Long hostUserId) {

        ChatRoomVO roomVO = new ChatRoomVO();
        roomVO.setShoppingPostId(shoppingPostId);
        roomVO.setStatusCd("OPEN");

        chatRoomDAO.insertChatRoom(roomVO);
        Long chatRoomId = roomVO.getChatRoomId();

        // 작성자를 참여자로 추가
        chatParticipantDAO.insertParticipant(chatRoomId, hostUserId);

        return chatRoomId;
    }

    /**
     * 기존 방에 참여
     */
    @Transactional
    public void joinRoom(Long chatRoomId, Long userId) {
        boolean exists = chatParticipantDAO.existsByRoomAndUser(chatRoomId, userId);
        if (!exists) {
            chatParticipantDAO.insertParticipant(chatRoomId, userId);
        }
    }

    /**
     * 내 채팅방 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ChatRoomSummaryDTO> getMyChatRooms(Long userId) {
        return chatRoomDAO.selectRoomsByUser(userId);
    }
}
