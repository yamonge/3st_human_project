package com.cucook.moc.shopping.service;

import com.cucook.moc.shopping.dao.ShoppingPostJoinDAO;
import com.cucook.moc.shopping.vo.ShoppingPostVO;
import com.cucook.moc.chat.service.ShoppingChatRoomService;
import com.cucook.moc.common.FirebaseService;
import com.cucook.moc.user.dao.UserDAO;
import com.cucook.moc.user.vo.UserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShoppingPostJoinService {

    @Autowired
    private ShoppingPostJoinDAO shoppingPostJoinDAO;

    @Autowired
    private ShoppingChatRoomService shoppingChatRoomService;

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private UserDAO userDAO;

    @Transactional
    public Long joinPost(Long postId, Long userId) {

        // 1) 게시글 조회 (FOR UPDATE)
        ShoppingPostVO postVO = shoppingPostJoinDAO.selectPostForUpdate(postId);

        if (postVO == null) {
            throw new IllegalArgumentException("존재하지 않는 게시글입니다.");
        }

        if (!"OPEN".equals(postVO.getStatusCd())) {
            throw new IllegalStateException("모집 중이 아닌 게시글입니다.");
        }

        if (postVO.getCurrentPersonCnt() >= postVO.getMaxPersonCnt()) {
            throw new IllegalStateException("이미 인원이 마감된 게시글입니다.");
        }


        // 2) 인원 +1
        shoppingPostJoinDAO.increaseCurrentPersonCnt(postId);

        // 3) 채팅방 조회 + 참여
        Long chatRoomId = shoppingPostJoinDAO.selectChatRoomIdByPostId(postId);
        if (chatRoomId == null) {
            throw new IllegalStateException("해당 게시글의 채팅방이 존재하지 않습니다.");
        }

        shoppingChatRoomService.joinRoom(chatRoomId, userId);

        // 4) 🔥 게시글 작성자에게 푸시 알림 전송
        try {
            // 참여한 사용자 정보 조회
            UserVO joinUser = userDAO.selectById(userId);
            
            // 게시글 작성자 정보 조회
            UserVO writerUser = userDAO.selectById(postVO.getWriterUserId());
            
            // 작성자가 본인이 아니고, FCM Token이 있는 경우에만 알림 전송
            if (writerUser != null 
                && !userId.equals(postVO.getWriterUserId())
                && writerUser.getFcmToken() != null 
                && !writerUser.getFcmToken().isEmpty()) {
                
                String joinUserNickname = (joinUser != null && joinUser.getUserNickname() != null) 
                    ? joinUser.getUserNickname() 
                    : "새로운 참여자";
                
                String title = "🛒 같이 장보기 참여 알림";
                String body = String.format("%s님이 '%s'에 참여했습니다!", 
                    joinUserNickname, 
                    postVO.getPlaceName() != null ? postVO.getPlaceName() : "장보기"
                );
                
                firebaseService.sendPushNotification(
                    writerUser.getFcmToken(), 
                    title, 
                    body
                );
                
                System.out.println("✅ 푸시 알림 전송 완료: " + writerUser.getUserNickname() + "에게 전송");
            }
        } catch (Exception e) {
            // 알림 전송 실패해도 참여 로직은 성공으로 처리
            System.err.println("⚠️ 푸시 알림 전송 실패 (참여는 성공): " + e.getMessage());
        }

        // 🔥 프론트에서 바로 이 방으로 입장할 수 있게 roomId 반환
        return chatRoomId;
    }
}

