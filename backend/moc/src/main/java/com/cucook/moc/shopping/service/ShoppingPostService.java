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
import java.util.List;

@Service
@Transactional
public class ShoppingPostService {

    @Autowired
    private ShoppingPostDAO shoppingPostDAO;

    @Autowired
    private ShoppingChatRoomService shoppingChatRoomService;

    /**
     * 글 생성 + 카테고리 + 채팅방 생성
     */
    public Long createPost(Long writerUserId, ShoppingPostCreateRequestDTO dto) {


        if (dto.getMaxPersonCnt() == null || dto.getMaxPersonCnt() < 2) {
            throw new IllegalArgumentException("최대 인원은 2명 이상이어야 합니다.");
        }

        // 1) meetDateTime 파싱
        Timestamp meetTs = dto.getMeetDateTime();
        if (meetTs == null) {
            throw new IllegalArgumentException("meetDateTime은 필수입니다. (Timestamp 타입)");
        }


        // 2) 게시글 VO 구성
        ShoppingPostVO postVO = new ShoppingPostVO();
        postVO.setWriterUserId(writerUserId);
        postVO.setMeetDatetime(meetTs);
        postVO.setMinPersonCnt(dto.getMinPersonCnt() != null ? dto.getMinPersonCnt() : 2);
        postVO.setMaxPersonCnt(dto.getMaxPersonCnt());
        postVO.setCurrentPersonCnt(1); // 작성자 본인
        postVO.setDescription(dto.getDescription());
        postVO.setStatusCd("OPEN");

        postVO.setPlaceName(dto.getPlaceName());
        postVO.setPlaceAddress(dto.getPlaceAddress());
        postVO.setLatitude(dto.getLatitude());
        postVO.setLongitude(dto.getLongitude());

        // 게시글 INSERT
        shoppingPostDAO.insertPost(postVO);
        Long postId = postVO.getShoppingPostId();

        // 카테고리 INSERT
        if (dto.getCategoryCodes() != null) {
            for (String cd : dto.getCategoryCodes()) {
                shoppingPostDAO.insertPostCategory(postId, cd);
            }
        }

        // 3) 채팅방 생성 + 작성자 참여
        shoppingChatRoomService.createRoomForPost(postId, writerUserId);

        return postId;
    }

    /**
     * 현재 위치 기준 주변 게시글
     */
    @Transactional(readOnly = true)
    public List<ShoppingPostSummaryDTO> getNearbyPosts(double lat, double lng) {
        double latDiff = 0.03;
        double lngDiff = 0.03;
        return shoppingPostDAO.selectNearbyPosts(
            lat - latDiff, lat + latDiff,
            lng - lngDiff, lng + lngDiff);
    }

    /**
     * 특정 마트(핀) 기준 게시글 목록
     */
    @Transactional(readOnly = true)
    public List<ShoppingPostSummaryDTO> getPostsForPlace(double lat, double lng) {
        double latDiff = 0.001; // 대략 100m 정도 박스
        double lngDiff = 0.001;
        return shoppingPostDAO.selectPostsByPlace(
                lat - latDiff, lat + latDiff,
                lng - lngDiff, lng + lngDiff
        );
    }
    
    @Transactional(readOnly = true)
    public ShoppingPostDetailDTO getPostDetail(Long postId) {
        return shoppingPostDAO.selectPostDetail(postId);
    }
}
