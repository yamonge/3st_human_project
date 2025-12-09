package com.cucook.moc.user.dao;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.cucook.moc.user.vo.UserReviewVO;
import com.cucook.moc.user.dto.UserReviewDTO;

@Mapper
public interface UserReviewDAO {

    void insert(UserReviewVO vo);

    // 이미 작성된 리뷰가 있는지
    int countExisting(@Param("shoppingPostId") Long shoppingPostId,
                      @Param("writerUserId") Long writerUserId,
                      @Param("targetUserId") Long targetUserId);

    // 특정 유저(타겟)를 대상으로 한 리뷰 목록
    List<UserReviewDTO> selectReviewsForUser(@Param("targetUserId") Long targetUserId);
}
