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

    public Long createPost(Long writerUserId, ShoppingPostCreateRequestDTO dto) {

        // 1) 장소 upsert
        PlaceUpsertRequestDTO placeDto = new PlaceUpsertRequestDTO();
        placeDto.setMapProviderCd(dto.getMapProviderCd());
        placeDto.setPlaceExternalId(dto.getPlaceExternalId());
        placeDto.setPlaceName(dto.getPlaceName());
        placeDto.setAddress(dto.getPlaceAddress());
        placeDto.setLatitude(dto.getLatitude());
        placeDto.setLongitude(dto.getLongitude());

        Long placeId = placeService.upsertPlace(placeDto);

        // 2) 게시글 저장
        ShoppingPostVO postVO = new ShoppingPostVO();
        postVO.setPlaceId(placeId);
        postVO.setWriterUserId(writerUserId);
        postVO.setMeetDatetime(
                Timestamp.valueOf(LocalDateTime.parse(dto.getMeetDateTime()))
        );
        postVO.setMinPersonCnt(dto.getMinPersonCnt() != null ? dto.getMinPersonCnt() : 2);
        postVO.setMaxPersonCnt(dto.getMaxPersonCnt());
        postVO.setCurrentPersonCnt(1);
        postVO.setDescription(dto.getDescription());
        postVO.setStatusCd("OPEN");

        shoppingPostDAO.insertPost(postVO);
        Long postId = postVO.getShoppingPostId();

        // 3) 카테고리 저장
        if (dto.getCategoryCodes() != null) {
            for (String cd : dto.getCategoryCodes()) {
                shoppingPostDAO.insertPostCategory(postId, cd);
            }
        }

        // 4) 채팅방 생성 (게시글 당 1개)
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
