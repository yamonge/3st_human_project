package com.cucook.moc.user.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class UserProfileDTO {

    private Long userId;
    private String userEmail;      // 전체 이메일
    private String userNickname;   // 내 닉네임
}