package com.cucook.moc.notice.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * 공지 작성/수정 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class NoticeSaveRequestDTO {

    /** 관리자 user_id (user_type = 'Y') */
    private Long adminUserId;

    /** 제목 */
    private String title;

    /** 내용 */
    private String content;

    /** 이미지 URL (선택) */
    private String imageUrl;

    /** 상단 고정 여부 */
    private Boolean pinned;

    /** 노출 여부 (null 이면 기본 true 로 처리) */
    private Boolean visible;
}
