package com.cucook.moc.shopping.dto;

import lombok.*;

import java.util.List;

/**
 * 같이 장보기 게시글 생성 요청 DTO
 * - 장소 정보 : 네이버(또는 기타 맵)에서 선택한 마트 정보
 * - 모집 정보 : 시간, 인원수, 설명, 카테고리
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ShoppingPostCreateRequestDTO {

    // ===== 장소 정보 (맵 API에서 받아온 값) =====
    private String mapProviderCd;     // 예: "NAVER"
    private String placeExternalId;   // 네이버 placeId 등
    private String placeName;         // 마트 이름
    private String placeAddress;      // 주소
    private Double latitude;          // 위도
    private Double longitude;         // 경도

    // ===== 모집 정보 =====
    /**
     * 만나는 일시 (ISO-8601 문자열)
     * 예) "2025-12-08T20:30:00"
     */
    private String meetDateTime;

    private Integer minPersonCnt;     // 최소 인원(없으면 기본 2)
    private Integer maxPersonCnt;     // 최대 인원(2~10)
    private String description;       // 한줄 설명/비고

    /**
     * 카테고리 코드 목록
     * 예) ["MART", "DISCOUNT", ...]
     */
    private List<String> categoryCodes;
}
