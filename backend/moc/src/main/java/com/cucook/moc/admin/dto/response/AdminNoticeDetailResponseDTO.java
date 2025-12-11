package com.cucook.moc.admin.dto.response;

import lombok.*;
import java.sql.Timestamp;

/**
 * 공지사항 상세 조회 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AdminNoticeDetailResponseDTO {

    private Long noticeId;
    private String title;
    private String content;
    private String imageUrl;
    private boolean pinned;
    private Timestamp createdDate;
    private Timestamp updatedDate;
}
