package com.cucook.moc.user.dao;

import java.sql.Timestamp;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.cucook.moc.user.vo.UserVO;

@Mapper
public interface UserDAO {

    // 이메일로 유저 조회 (로그인용)
    UserVO findByUserEmail(@Param("userEmail") String userEmail);

    // 이메일 중복 체크
    int countByUserEmail(@Param("userEmail") String userEmail);

    // 회원가입
    void insertUser(UserVO user);

    /**
     * 주어진 닉네임과 같은 값이 DB에 몇 개 있는지 카운트합니다.
     */
    int countByNickname(@Param("userNickname") String userNickname);

    // 이름 + 생년월일로 아이디 찾기
    UserVO findByNameAndBirthDate(@Param("userName") String userName,
                                  @Param("userBirthDate") Timestamp userBirthDate);

    // 비밀번호 찾기 (이메일 + 이름 + 생년월일)
    UserVO findForPasswordReset(@Param("userEmail") String userEmail,
                                @Param("userName") String userName,
                                @Param("userBirthDate") Timestamp userBirthDate);

    // 비밀번호 변경
    void updatePassword(@Param("userId") Long userId,
                        @Param("userPassword") String encodedPassword);

    // 마지막 로그인 시간 갱신
    void updateLastLoginDate(@Param("userId") Long userId);

    // FCM Token 업데이트
    void updateFcmToken(@Param("userId") Long userId,
                        @Param("fcmToken") String fcmToken,
                        @Param("deviceOs") String deviceOs,
                        @Param("deviceVersion") String deviceVersion);

    // userId로 회원 한 명 조회 (마이페이지용)
    UserVO selectById(@Param("userId") Long userId);
    
    // 같이 장보기에 대한 유저 평점 평균
    void updateRatingScoreByAvg(@Param("targetUserId") Long targetUserId);
}
