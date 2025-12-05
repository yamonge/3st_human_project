package com.cucook.moc.user.dao;

import java.time.LocalDate;

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

    // 이름 + 생년월일로 아이디 찾기
    UserVO findByNameAndBirthDate(@Param("userName") String userName,
                                  @Param("userBirthDate") LocalDate userBirthDate);

    // 비밀번호 찾기 (이메일 + 이름 + 생년월일)
    UserVO findForPasswordReset(@Param("userEmail") String userEmail,
                                @Param("userName") String userName,
                                @Param("userBirthDate") LocalDate userBirthDate);

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
}
