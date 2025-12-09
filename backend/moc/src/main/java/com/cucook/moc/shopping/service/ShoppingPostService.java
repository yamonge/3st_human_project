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

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ShoppingPostService {

    @Autowired
    private ShoppingPostDAO shoppingPostDAO;

    @Autowired
    private ShoppingChatRoomService shoppingChatRoomService;

    /**
     * 같이 장보기 게시글 생성 + 채팅방 생성
     */
    public Long createPost(Long writerUserId, ShoppingPostCreateRequestDTO dto) {

        // 1) 필수값 검증
        if (dto.getMeetDateTime() == null) {
            throw new IllegalArgumentException("meetDateTime은 필수입니다. (Timestamp)");
        }
        if (dto.getMaxPersonCnt() == null) {
            throw new IllegalArgumentException("maxPersonCnt는 필수입니다.");
        }

        // 2) DTO → VO 매핑 (장소 정보 포함)
        ShoppingPostVO postVO = ShoppingPostVO.builder()
                .writerUserId(writerUserId)
                .meetDatetime(dto.getMeetDateTime())
                .minPersonCnt(dto.getMinPersonCnt() != null ? dto.getMinPersonCnt() : 2)
                .maxPersonCnt(dto.getMaxPersonCnt())
                .currentPersonCnt(1)  // 작성자 본인 포함
                .description(dto.getDescription())
                .statusCd("OPEN")

                .placeName(dto.getPlaceName())
                .placeAddress(dto.getPlaceAddress())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())

                .createdId(writerUserId)
                .build();

        // 최소 인원 기본값 2
        if (dto.getMinPersonCnt() != null) {
            postVO.setMinPersonCnt(dto.getMinPersonCnt());
        } else {
            postVO.setMinPersonCnt(2);
        }

        postVO.setMaxPersonCnt(dto.getMaxPersonCnt());
        postVO.setCurrentPersonCnt(1);      // 작성자 본인 1명
        postVO.setDescription(dto.getDescription());
        postVO.setStatusCd("OPEN");         // 기본 상태

        // 4) 게시글 INSERT
        shoppingPostDAO.insertPost(postVO);
        Long postId = postVO.getShoppingPostId();

        // 5) 게시글 카테고리 INSERT (tb_shopping_post_category 등)
        if (dto.getCategoryCodes() != null) {
            for (String code : dto.getCategoryCodes()) {
                shoppingPostDAO.insertPostCategory(postId, code);
            }
        }

        // 6) 게시글 당 채팅방 1개 생성 (tb_shopping_chat_room + tb_shopping_participant)
        shoppingChatRoomService.createRoomForPost(postId, writerUserId);

        return postId;
    }

    /**
     * 현재 위치 기준 근처 게시글 목록 조회
     */
    @Transactional(readOnly = true)
    public List<ShoppingPostSummaryDTO> getNearbyPosts(double lat, double lng) {
        // 대충 0.03도 ≒ 3~4km 근처 (나중에 조정 가능)
        double latDiff = 0.03;
        double lngDiff = 0.03;
        return shoppingPostDAO.selectNearbyPosts(lat, lng, latDiff, lngDiff);
    }

    /**
     * 게시글 상세
     */
    @Transactional(readOnly = true)
    public ShoppingPostDetailDTO getPostDetail(Long postId) {
        return shoppingPostDAO.selectPostDetail(postId);
    }
}
