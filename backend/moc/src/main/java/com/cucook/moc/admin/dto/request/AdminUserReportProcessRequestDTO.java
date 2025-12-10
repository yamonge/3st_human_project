package com.cucook.moc.admin.dto.request;

import lombok.*;

/**
 * 신고 처리(경고/계정정지/반려) 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AdminUserReportProcessRequestDTO {

    private Long userReportId;
    private Long reportedUserId;
    private Long adminUserId;

    /** WARNING / SUSPEND / REJECT */
    private String actionType;

    /** SUSPEND일 때만 사용: ONE_DAY / THREE_DAYS / SEVEN_DAYS / PERMANENT */
    private String suspendType;

    /** 처리 코멘트 */
    private String adminComment;
}
