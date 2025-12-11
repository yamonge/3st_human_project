package com.cucook.moc.admin.dto.response;

import lombok.*;
import java.sql.Timestamp;

/**
 * 공지사항 목록 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AdminNoticeListItemResponseDTO {

    private Long noticeId;
    private String title;
    private boolean pinned;
    private Timestamp createdDate;
}
