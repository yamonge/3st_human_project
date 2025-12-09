package com.cucook.moc.place.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PlaceResponseDTO {
    private Long placeId;
    private String placeName;
    private String address;
    private Double latitude;
    private Double longitude;
}
