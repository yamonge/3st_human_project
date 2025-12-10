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

        // 🔥 프론트에서 바로 이 방으로 입장할 수 있게 roomId 반환
        return chatRoomId;
    }
}

