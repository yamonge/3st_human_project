package com.cucook.moc.place.vo;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PlaceVO {
    private Long placeId;
    private String mapProviderCd;    // NAVER, KAKAO ...
    private String placeExternalId;  // 외부 place id
    private String placeName;
    private String address;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}
