package com.cucook.moc.place.vo;

import lombok.*;

import java.sql.Timestamp;

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

    private Long createdId;
    private Timestamp createdDate;
    private Long updatedId;
    private Timestamp updatedDate;
}
