package com.cucook.moc.user.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter; // 날짜 포맷팅을 위해 추가

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserIngredientResponseDTO {
    private Long userIngredientId;  // 재료 ID
    private Long userId;            // 사용자 ID
    private String ingredientName;  // 재료명
    private String quantityDesc;    // 수량 설명
    private String categoryCd;      // 카테고리 코드
    private String usedFlag;        // 사용 여부 (Y/N)
    private LocalDate expiredDate;  // 유통기한
    private String expiredDateFormatted; // ⭐ UI 표시용: "YYYY-MM-DD" 포맷
    private String memo;            // 메모
    private boolean isExpired;      // ⭐ UI 로직용: 유통기한 만료 여부
    private boolean isNearExpiry;   // ⭐ UI 로직용: 유통기한 임박 여부 (예: 7일 이내)
    private long daysUntilExpired;  // ⭐ UI 로직용: 남은 유통기한 일수

    // UserIngredientVO를 기반으로 DTO를 생성하는 편의 메서드 (선택 사항)
    public static UserIngredientResponseDTO from(com.cucook.moc.user.vo.UserIngredientVO vo) {
        UserIngredientResponseDTO dto = new UserIngredientResponseDTO();
        dto.setUserIngredientId(vo.getUserIngredientId());
        dto.setUserId(vo.getUserId());
        dto.setIngredientName(vo.getIngredientName());
        dto.setQuantityDesc(vo.getQuantityDesc());
        dto.setCategoryCd(vo.getCategoryCd());
        dto.setUsedFlag(vo.getUsedFlag());
        dto.setExpiredDate(vo.getExpiredDate());
        dto.setMemo(vo.getMemo());

        // UI 로직 관련 추가 필드 계산
        if (vo.getExpiredDate() != null) {
            LocalDate today = LocalDate.now();
            dto.setExpiredDateFormatted(vo.getExpiredDate().format(DateTimeFormatter.ISO_LOCAL_DATE)); // "YYYY-MM-DD"
            dto.setExpired(vo.getExpiredDate().isBefore(today)); // 오늘보다 이전이면 만료
            long days = java.time.temporal.ChronoUnit.DAYS.between(today, vo.getExpiredDate());
            dto.setDaysUntilExpired(days);
            dto.setNearExpiry(days <= 7 && days >= 0); // 7일 이내이고 만료되지 않았으면 임박
        } else {
            dto.setExpiredDateFormatted(null);
            dto.setExpired(false);
            dto.setNearExpiry(false);
            dto.setDaysUntilExpired(-1); // 유통기한 없음
        }
        return dto;
    }
}