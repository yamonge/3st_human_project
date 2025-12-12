package com.cucook.moc.admin.dto.request;

import lombok.*;

/**
 * 관리자 - 계정 정지 요청 DTO
 * (tb_user.user_status, tb_user.suspended_until, tb_user.suspended_reason 갱신)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AdminUserSuspendRequestDTO {

    /** 정지 대상 회원 ID (tb_user.user_id) */
    private Long userId;

    /** 정지 기간 타입: ONE_DAY / THREE_DAYS / SEVEN_DAYS / PERMANENT */
    private String suspendType;

    /** 정지 사유(관리자 메모, tb_user.suspended_reason) */
    private String reason;

    /** 처리 관리자 ID (tb_user.user_id, user_type='Y') */
    private Long adminUserId;
}
