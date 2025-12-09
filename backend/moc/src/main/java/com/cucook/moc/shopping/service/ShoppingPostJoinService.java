package com.cucook.moc.shopping.service;

import com.cucook.moc.shopping.dao.ShoppingPostJoinDAO;
import com.cucook.moc.shopping.vo.ShoppingPostVO;
import com.cucook.moc.chat.service.ShoppingChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShoppingPostJoinService {

    @Autowired
    private ShoppingPostJoinDAO shoppingPostJoinDAO;

    @Autowired
    private ShoppingChatRoomService shoppingChatRoomService;

    /**
     * 게시글 참여
     * - 인원/상태 체크
     * - current_person_cnt + 1
     * - 채팅방 참여자 추가
     */
    @Transactional
    public void joinPost(Long postId, Long userId) {

        // 1) 게시글 조회 (DAO에서 FOR UPDATE 걸도록 구현 추천)
        ShoppingPostVO postVO = shoppingPostJoinDAO.selectPostForUpdate(postId);

        if (!"OPEN".equals(postVO.getStatusCd())) {
            throw new IllegalStateException("모집 중이 아닌 게시글입니다.");
        }

        if (postVO.getCurrentPersonCnt() >= postVO.getMaxPersonCnt()) {
            throw new IllegalStateException("이미 인원이 마감된 게시글입니다.");
        }

        // 2) 인원 +1
        shoppingPostJoinDAO.increaseCurrentPersonCnt(postId);

        // 3) 채팅방 참여자 추가
        Long chatRoomId = shoppingPostJoinDAO.selectChatRoomIdByPostId(postId);
        shoppingChatRoomService.joinRoom(chatRoomId, userId);
    }
}

