package com.cucook.moc.shopping.dto;

import lombok.*;

import java.sql.Timestamp;
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
    private String placeName;         // 장소명
    private String placeAddress;      // 주소
    private Double latitude;          // 위도
    private Double longitude;         // 경도

    // ===== 모집 정보 =====
    /**
     * 만나는 일시 (ISO-8601 문자열)
     * 예) "2025-12-08T20:30:00"
     */
    private Timestamp meetDateTime;
    private Integer minPersonCnt;     // 최소 인원(없으면 기본 2)
    private Integer maxPersonCnt;     // 최대 인원(2~10)
    private String description;       // 설명/비고

    /**
     * 택한 재료 카테고리 코드들 (ING_CATEGORY)
     * 예) ["MART", "DISCOUNT", ...] (필요 없다면 나중에 제거 가능)
     */
    private List<String> categoryCodes;
}
