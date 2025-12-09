package com.cucook.moc.shopping.vo;

import lombok.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ShoppingPostVO {
    private Long shoppingPostId;
    private Long placeId;
    private Long writerUserId;       // FK → tb_user.user_id

    private Timestamp meetDatetime;
    private Integer minPersonCnt;
    private Integer maxPersonCnt;
    private Integer currentPersonCnt;
    private String description;
    private String statusCd;         // OPEN / FULL / DONE ...

    private Timestamp createdDate;
    private Timestamp updatedDate;
}

