package com.cucook.moc.chat.service;

import com.cucook.moc.chat.dao.ChatRoomDAO;
import com.cucook.moc.chat.dao.ChatParticipantDAO;
import com.cucook.moc.chat.dto.ChatRoomSummaryDTO;
import com.cucook.moc.chat.vo.ChatRoomVO;
import com.cucook.moc.shopping.dao.ShoppingPostDAO;
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

    @Autowired
    private ShoppingPostDAO shoppingPostDAO;

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

    /**
     * 채팅방 나가기 (참여자 제거)
     */
    @Transactional
    public void leaveRoom(Long chatRoomId, Long userId) {
        // 참여자 확인
        boolean exists = chatParticipantDAO.existsByRoomAndUser(chatRoomId, userId);
        if (!exists) {
            throw new IllegalStateException("채팅방 참여자가 아닙니다.");
        }

        // 참여자 제거 (leave_date 업데이트)
        chatParticipantDAO.updateLeaveDate(chatRoomId, userId);
    }

    /**
     * 채팅방 삭제 (방장만 가능, 상태 변경)
     */
    @Transactional
    public void deleteChatRoom(Long chatRoomId, Long requestUserId) {
        // 방 정보 조회
        ChatRoomVO room = chatRoomDAO.selectById(chatRoomId);
        if (room == null) {
            throw new IllegalArgumentException("존재하지 않는 채팅방입니다.");
        }

        // 방장 권한 확인 (게시글 작성자 확인)
        Long postOwnerId = shoppingPostDAO.selectOwnerUserId(room.getShoppingPostId());
        if (!postOwnerId.equals(requestUserId)) {
            throw new IllegalStateException("채팅방 삭제 권한이 없습니다.");
        }

        // 채팅방 상태를 DELETED로 변경
        chatRoomDAO.updateStatus(chatRoomId, "DELETED");
    }

    /**
     * 참여자 강퇴 (방장만 가능)
     */
    @Transactional
    public void kickParticipant(Long chatRoomId, Long kickUserId, Long requestUserId) {
        // 방 정보 조회
        ChatRoomVO room = chatRoomDAO.selectById(chatRoomId);
        if (room == null) {
            throw new IllegalArgumentException("존재하지 않는 채팅방입니다.");
        }

        // 방장 권한 확인
        Long postOwnerId = shoppingPostDAO.selectOwnerUserId(room.getShoppingPostId());
        if (!postOwnerId.equals(requestUserId)) {
            throw new IllegalStateException("참여자 강퇴 권한이 없습니다.");
        }

        // 참여자 확인
        boolean exists = chatParticipantDAO.existsByRoomAndUser(chatRoomId, kickUserId);
        if (!exists) {
            throw new IllegalStateException("강퇴할 참여자가 존재하지 않습니다.");
        }

        // 참여자 제거
        chatParticipantDAO.updateLeaveDate(chatRoomId, kickUserId);
    }
}
