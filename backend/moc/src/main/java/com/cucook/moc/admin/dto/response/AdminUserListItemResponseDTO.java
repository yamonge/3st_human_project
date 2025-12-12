package com.cucook.moc.admin.dto.response;

import lombok.*;
import java.sql.Timestamp;

/**
 * 관리자 회원 목록 한 행에 대한 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AdminUserListItemResponseDTO {

    private Long userId;
    private String userEmail;
    private String userName;
    private String userNickname;

    private String userStatus;
    private Integer reportedCnt;
    private Timestamp suspendedUntil;
    private Timestamp createdDate;
}
