package com.cucook.moc.place.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PlaceUpsertRequestDTO {
    private String mapProviderCd;
    private String placeExternalId;
    private String placeName;
    private String address;
    private Double latitude;
    private Double longitude;
}
