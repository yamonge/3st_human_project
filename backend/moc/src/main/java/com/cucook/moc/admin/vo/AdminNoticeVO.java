package com.cucook.moc.admin.vo;

import lombok.*;
import java.sql.Timestamp;

import lombok.*;
import java.sql.Timestamp;

/**
 * 공지사항 VO (tb_notice 매핑)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AdminNoticeVO {

    // tb_notice.notice_id
    private Long noticeId;

    // tb_notice.title
    private String title;

    // tb_notice.content
    private String content;

    // tb_notice.image_url
    private String imageUrl;

    // tb_notice.is_pinned (Y/N)
    private String isPinned;

    // tb_notice.is_visible (Y/N)
    private String isVisible;

    // tb_notice.created_id
    private Long createdId;

    // tb_notice.created_date
    private Timestamp createdDate;

    // tb_notice.updated_id
    private Long updatedId;

    // tb_notice.updated_date
    private Timestamp updatedDate;
}
