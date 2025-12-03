package com.cucook.moc.user.dao;

import com.cucook.moc.user.vo.UserVO;
import org.apache.ibatis.annotations.Param;

public interface UserDAO {
        // 로그인
        UserVO findByLoginEmail(@Param("userEmail") String userEmail);

        // 이메일 중복 검사
        int countByLoginEmail(@Param("userEmail") String userEmail);

        // 회원가입
        void insertUser(UserVO userVO);

        // 비밀번호 찾기 : 이메일 + 이름 + 생년월일
        UserVO findByLoginPwd(@Param("userEmail"))
}
