package com.cucook.moc.shopping.dto;

import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ShoppingPostSummaryDTO {

    private Long shoppingPostId;

    // 장소
    private String placeName;
    private String placeAddress;
    private Double latitude;
    private Double longitude;

    // 시간/인원/상태
    private Timestamp meetDatetime;
    private Integer minPersonCnt;
    private Integer maxPersonCnt;
    private Integer currentPersonCnt;
    private String statusCd;

    // 작성자 정보
    private Long writerUserId;
    private String writerNickname;
}
