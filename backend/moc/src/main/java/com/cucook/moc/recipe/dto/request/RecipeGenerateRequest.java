package com.cucook.moc.recipe.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class RecipeGenerateRequest {
    private Long userId; // [1단계] 사용자 ID (로그인 사용자일 경우)
    private List<IngredientInputDto> ingredients; // [1단계] 사용자가 선택한 재료 목록

    private String cuisineStyleCd;   // [2단계] 필터 조건: 요리 스타일 코드 (예: "KOR", "CHN", "WES")
    private String difficultyCd;     // [2단계] 필터 조건: 난이도 코드 (예: "EASY", "NORMAL", "HARD")
    private Integer maxCookTimeMin;  // [2단계] 필터 조건: 최대 조리 시간 (분 단위)
    // "조리 시간 (10분/30분/1시간/2시간+)"은 클라이언트에서 maxCookTimeMin으로 변환하여 보낸다고 가정합니다.
    // 만약 코드로 받고 싶다면 private String cookTimeCd; 로 변경 후 매핑 로직 필요

    // 카메라 세션 ID (있다면)
    private String cameraSessionId; // [AiRecipeLogVO의 camera_session_id와 연결될 수 있음]
}