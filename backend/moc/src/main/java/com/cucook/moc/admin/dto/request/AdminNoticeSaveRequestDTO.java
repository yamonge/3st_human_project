package com.cucook.moc.admin.dto.request;

import lombok.*;

/**
 * 공지사항 생성/수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AdminNoticeSaveRequestDTO {

    private String title;
    private String content;
    private String imageUrl;

    /** 상단 고정 여부 -> tb_notice.is_pinned */
    private boolean pinned;

    /** 작성/수정 관리자 ID -> created_id / updated_id */
    private Long adminUserId;
}
