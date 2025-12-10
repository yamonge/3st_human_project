package com.cucook.moc.user.dto.response;

import com.cucook.moc.user.vo.UserIngredientVO;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter; // 날짜 포맷팅을 위해 추가
import java.time.temporal.ChronoUnit;

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
    private Timestamp expiredDate;  // 유통기한
    private String expiredDateFormatted; // ⭐ UI 표시용: "YYYY-MM-DD" 포맷
    private String memo;            // 메모
    private boolean isExpired;      // ⭐ UI 로직용: 유통기한 만료 여부
    private boolean isNearExpiry;   // ⭐ UI 로직용: 유통기한 임박 여부 (예: 7일 이내)
    private long daysUntilExpired;  // ⭐ UI 로직용: 남은 유통기한 일수

    // UserIngredientVO를 기반으로 DTO를 생성하는 편의 메서드 (선택 사항)
    public static UserIngredientResponseDTO from(UserIngredientVO vo) {
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

            Timestamp today = new Timestamp(System.currentTimeMillis());
            Timestamp expired = vo.getExpiredDate();

            // 날짜 포맷 (Timestamp -> String)
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            dto.setExpiredDateFormatted(sdf.format(expired));

            // 만료 여부 (today 이후면 false, 이전이면 true)
            dto.setExpired(expired.before(today));

            // 남은 일수 계산 (Timestamp만 사용)
            long diffMillis = expired.getTime() - today.getTime();
            long days = diffMillis / (1000 * 60 * 60 * 24); // 밀리초 → 일수 변환
            dto.setDaysUntilExpired(days);

            // 7일 이내 && 아직 만료되지 않았으면 임박
            dto.setNearExpiry(days <= 7 && days >= 0);

        } else {

            dto.setExpiredDateFormatted(null);
            dto.setExpired(false);
            dto.setNearExpiry(false);
            dto.setDaysUntilExpired(-1);
        }

        return dto;
    }
}