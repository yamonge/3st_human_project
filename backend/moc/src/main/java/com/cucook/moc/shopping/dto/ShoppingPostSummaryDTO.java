package com.cucook.moc.shopping.dto;

import lombok.*;

import java.time.LocalDateTime;

// 지도 목록 요약
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ShoppingPostSummaryDTO {

    private Long shoppingPostId;
    private String placeName;
    private Double latitude;
    private Double longitude;

    private LocalDateTime meetDatetime;
    private Integer maxPersonCnt;
    private Integer currentPersonCnt;
    private String statusCd;

    private String writerNickname;   // 글쓴이 닉네임만 (이메일 X)
}
