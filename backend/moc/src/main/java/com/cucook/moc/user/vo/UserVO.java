package com.cucook.moc.user.vo;

import lombok.*;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class UserVO {
    private Long userId;            //
    private String userEmail;       // 이메일
    private String userName;
    private String userNickname;
    private String userPassword;
    private String passwordConfirm;     // 회원가입 시 비밀번호 확인용
    private String userProfileImageUrl;
    private String userType;
    private String userStatus;
    private String suspendedReason;
    private Integer reportedCnt;
    private Integer shoppingCompletedCnt;
    private Double ratingScore;
    private Double trustScore;
    private LocalDate userBirthDate;

    private Timestamp lastLoginDate;
    private String deviceOs;
    private String deviceVersion;
    private String fcmToken;

    private Long createdId;
    private Timestamp createdDate;
    private Long updatedId;
    private Timestamp updatedDate;
}
