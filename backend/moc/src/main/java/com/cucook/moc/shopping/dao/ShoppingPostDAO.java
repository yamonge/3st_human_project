package com.cucook.moc.shopping.dao;

import com.cucook.moc.shopping.dto.ShoppingPostDetailDTO;
import com.cucook.moc.shopping.dto.ShoppingPostSummaryDTO;
import com.cucook.moc.shopping.vo.ShoppingPostVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ShoppingPostDAO {

    void insertPost(ShoppingPostVO vo);

    void insertPostCategory(@Param("postId") Long postId,
                            @Param("categoryCd") String categoryCd);

    List<ShoppingPostSummaryDTO> selectNearbyPosts(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("latDiff") double latDiff,
            @Param("lngDiff") double lngDiff
    );

    ShoppingPostDetailDTO selectPostDetail(@Param("postId") Long postId);

    // 리뷰/DONE 체크용: 게시글 단건 조회
    ShoppingPostVO selectById(@Param("postId") Long postId);
}

