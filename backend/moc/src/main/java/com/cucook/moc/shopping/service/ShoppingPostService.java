package com.cucook.moc.shopping.service;

import com.cucook.moc.place.dto.request.PlaceUpsertRequestDTO;
import com.cucook.moc.place.service.PlaceService;
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
    private PlaceService placeService;

    @Autowired
    private ShoppingPostDAO shoppingPostDAO;

    @Autowired
    private ShoppingChatRoomService shoppingChatRoomService;

    /**
     * 같이 장보기 게시글 생성 + 채팅방 1개 자동 생성
     *
     * @param writerUserId 작성자 user_id
     * @param dto          프론트에서 넘어온 게시글 생성 요청
     * @return 생성된 shopping_post_id
     */
    public Long createPost(Long writerUserId, ShoppingPostCreateRequestDTO dto) {

        // 1) 장소 upsert (tb_place)
        PlaceUpsertRequestDTO placeDto = new PlaceUpsertRequestDTO();
        placeDto.setMapProviderCd(dto.getMapProviderCd());
        placeDto.setPlaceExternalId(dto.getPlaceExternalId());
        placeDto.setPlaceName(dto.getPlaceName());
        placeDto.setAddress(dto.getPlaceAddress());
        placeDto.setLatitude(dto.getLatitude());
        placeDto.setLongitude(dto.getLongitude());

        Long placeId = placeService.upsertPlace(placeDto);

        // 2) meetDateTime 문자열 → Timestamp 변환
        //    프론트에서 "2025-12-08T20:30:00" 형식으로 보낸다고 가정
        LocalDateTime meetLdt = LocalDateTime.parse(dto.getMeetDateTime());
        Timestamp meetTs = Timestamp.valueOf(meetLdt);

        // 3) 게시글 VO 생성 (tb_shopping_post)
        ShoppingPostVO postVO = new ShoppingPostVO();
        postVO.setPlaceId(placeId);
        postVO.setWriterUserId(writerUserId);
        postVO.setMeetDatetime(meetTs);

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

        // 필요하면 createdId 쓸 수 있음 (원하면 주석 해제)
        // postVO.setCreatedId(writerUserId);

        // 4) 게시글 INSERT
        shoppingPostDAO.insertPost(postVO);
        Long postId = postVO.getShoppingPostId();

        // 5) 게시글 카테고리 INSERT (tb_shopping_post_category 등)
        if (dto.getCategoryCodes() != null) {
            for (String cd : dto.getCategoryCodes()) {
                shoppingPostDAO.insertPostCategory(postId, cd);
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
        // 단순 박스 범위 (추후 반경/거리 계산으로 개선 가능)
        double latDiff = 0.03;
        double lngDiff = 0.03;
        return shoppingPostDAO.selectNearbyPosts(lat, lng, latDiff, lngDiff);
    }

    /**
     * 게시글 상세 조회
     */
    @Transactional(readOnly = true)
    public ShoppingPostDetailDTO getPostDetail(Long postId) {
        return shoppingPostDAO.selectPostDetail(postId);
    }
}
