package com.cucook.moc.recipe.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class RecipeGenerateResponse {
    private List<RecommendedRecipeDto> recommendedRecipes; // [7단계] 상위 3개 레시피 목록 (기본값)
    // private String debugLog; // 디버깅용 로그를 포함하고 싶다면 (개발 중 유용)
}
