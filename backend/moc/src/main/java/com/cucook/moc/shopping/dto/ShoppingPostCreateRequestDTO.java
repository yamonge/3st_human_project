package com.cucook.moc.shopping.dto;

import lombok.*;

import java.util.List;

// 글쓰기 - request
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ShoppingPostCreateRequestDTO {

    // 장소 정보 (네이버에서 받아온 것)
    private String mapProviderCd;
    private String placeExternalId;
    private String placeName;
    private String placeAddress;
    private Double latitude;
    private Double longitude;

    // 모집 정보
    private String meetDateTime;         // "2025-12-10T18:30"
    private Integer minPersonCnt;
    private Integer maxPersonCnt;
    private String description;

    private List<String> categoryCodes;  // ING_CATEGORY 코드 목록
}

