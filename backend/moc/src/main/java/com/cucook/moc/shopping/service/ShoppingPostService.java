package com.cucook.moc.shopping.service;

import com.cucook.moc.shopping.dao.ShoppingPostDAO;
import com.cucook.moc.shopping.dto.ShoppingPostCreateRequestDTO;
import com.cucook.moc.shopping.dto.ShoppingPostDetailDTO;
import com.cucook.moc.shopping.dto.ShoppingPostSummaryDTO;
import com.cucook.moc.shopping.vo.ShoppingPostVO;
import com.cucook.moc.chat.service.ShoppingChatRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ShoppingPostService {

    @Autowired
    private ShoppingPostDAO shoppingPostDAO;

    @Autowired
    private ShoppingChatRoomService shoppingChatRoomService;

    public Long createPost(Long writerUserId, ShoppingPostCreateRequestDTO dto) {

        if (dto.getMeetDateTime() == null) {
            throw new IllegalArgumentException("meetDateTime은 필수입니다.(Timestamp)");
        }
        if (dto.getMaxPersonCnt() == null || dto.getMaxPersonCnt() < 2) {
            throw new IllegalArgumentException("최대 인원은 2명 이상이어야 합니다.");
        }

        ShoppingPostVO postVO = ShoppingPostVO.builder()
                .writerUserId(writerUserId)
                .meetDatetime(dto.getMeetDateTime())
                .minPersonCnt(
                        dto.getMinPersonCnt() != null ? dto.getMinPersonCnt() : 2
                )
                .maxPersonCnt(dto.getMaxPersonCnt())
                .currentPersonCnt(1) // 작성자 포함
                .description(dto.getDescription())
                .statusCd("OPEN")
                .placeName(dto.getPlaceName())
                .placeAddress(dto.getPlaceAddress())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .build();

        // 1) 게시글 INSERT
        shoppingPostDAO.insertPost(postVO);
        Long postId = postVO.getShoppingPostId();

        // 2) 카테고리 INSERT (있으면)
        if (dto.getCategoryCodes() != null) {
            for (String cd : dto.getCategoryCodes()) {
                shoppingPostDAO.insertPostCategory(postId, cd);
            }
        }

        // 3) 채팅방 생성 + 작성자 참여
        shoppingChatRoomService.createRoomForPost(postId, writerUserId);

        return postId;
    }

    @Transactional(readOnly = true)
    public List<ShoppingPostSummaryDTO> getNearbyPosts(double lat, double lng) {
        double latDiff = 0.03;
        double lngDiff = 0.03;
        return shoppingPostDAO.selectNearbyPosts(lat, lng, latDiff, lngDiff);
    }

    @Transactional(readOnly = true)
    public ShoppingPostDetailDTO getPostDetail(Long postId) {
        return shoppingPostDAO.selectPostDetail(postId);
    }
}
