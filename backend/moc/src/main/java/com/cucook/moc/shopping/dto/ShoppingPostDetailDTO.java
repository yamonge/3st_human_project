package com.cucook.moc.shopping.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

// 상세화면
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ShoppingPostDetailDTO {

    private Long shoppingPostId;
    private String placeName;
    private String placeAddress;
    private Double latitude;
    private Double longitude;

    private LocalDateTime meetDatetime;
    private Integer minPersonCnt;
    private Integer maxPersonCnt;
    private Integer currentPersonCnt;
    private String description;
    private String statusCd;

    private String writerNickname;   // 상세에서도 닉네임만
}

