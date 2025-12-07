package com.cucook.moc.shopping.vo;

import lombok.*;

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

    private LocalDateTime meetDatetime;
    private Integer minPersonCnt;
    private Integer maxPersonCnt;
    private Integer currentPersonCnt;
    private String description;
    private String statusCd;         // OPEN / FULL / DONE ...

    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}

