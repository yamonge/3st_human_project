package com.cucook.moc.chat.service;

import com.cucook.moc.chat.dao.ChatRoomDAO;
import com.cucook.moc.chat.dao.ChatParticipantDAO;
import com.cucook.moc.chat.dto.ChatRoomSummaryDTO;
import com.cucook.moc.chat.vo.ChatRoomVO;
import com.cucook.moc.shopping.dao.ShoppingPostDAO;
import com.cucook.moc.shopping.dao.ShoppingPostJoinDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShoppingChatRoomService {

    // 🔥 마지막 자동 완료 실행 시간 (메모리에 저장)
    private static LocalDateTime lastAutoCompleteTime = null;
    
    // 🔥 체크 주기 (10분)
    private static final int CHECK_INTERVAL_MINUTES = 10;

    @Autowired
    private ChatRoomDAO chatRoomDAO;

    @Autowired
    private ChatParticipantDAO chatParticipantDAO;

    @Autowired
    private ShoppingPostDAO shoppingPostDAO;

    @Autowired
    private ShoppingPostJoinDAO shoppingPostJoinDAO;

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
    @Transactional
    public List<ChatRoomSummaryDTO> getMyChatRooms(Long userId) {
        // 🔥 자동 완료 체크 (10분마다)
        checkAndAutoCompletePosts();
        
        return chatRoomDAO.selectRoomsByUser(userId);
    }
    
    /**
     * 만료된 게시글/채팅방 자동 완료 체크
     * 10분마다 1회만 실행
     */
    private void checkAndAutoCompletePosts() {
        LocalDateTime now = LocalDateTime.now();
        
        // 🔥 첫 실행이거나 10분 지났으면 실행
        if (lastAutoCompleteTime == null || 
            lastAutoCompleteTime.plusMinutes(CHECK_INTERVAL_MINUTES).isBefore(now)) {
            
            System.out.println("[자동 완료 체크] 시작 - " + now);
            
            // 1. 만료된 게시글 일괄 업데이트
            int updatedPosts = shoppingPostDAO.bulkUpdateExpiredPosts();
            
            if (updatedPosts > 0) {
                // 2. 해당 채팅방도 일괄 업데이트
                int updatedRooms = chatRoomDAO.bulkUpdateExpiredRooms();
                System.out.println("[자동 완료] 게시글 " + updatedPosts + "개, 채팅방 " + updatedRooms + "개 처리");
            }
            
            // 3. 마지막 실행 시간 갱신
            lastAutoCompleteTime = now;
        }
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

        // 채팅방 정보 조회
        ChatRoomVO room = chatRoomDAO.selectById(chatRoomId);
        if (room != null && room.getShoppingPostId() != null) {
            // 게시글 인원수 감소
            shoppingPostJoinDAO.decreaseCurrentPersonCnt(room.getShoppingPostId());
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

        // 🔥 게시글 상태도 CANCELED로 변경
        if (room.getShoppingPostId() != null) {
            shoppingPostDAO.updateStatus(room.getShoppingPostId(), "CANCELED");
            System.out.println("[게시글 상태 변경] postId: " + room.getShoppingPostId() + " -> CANCELED");
        }
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
