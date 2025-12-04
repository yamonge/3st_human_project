package com.cucook.moc.recipe.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class RecommendedRecipeDto {
    private Long recipeId; // [7단계] 저장된 레시피의 ID (저장 후 생성될 경우)
    private String title;          // [7단계] 레시피 제목
    private String summary;        // [RecipeVO의 summary와 연결]
    private String thumbnailUrl;   // [7단계] 레시피 이미지 URL
    private String difficultyCd;   // [7단계] 난이도 코드
    private Integer cookTimeMin;   // [7단계] 조리시간 (분 단위)
    private String cuisineStyleCd; // [RecipeVO의 cuisineStyleCd와 연결]

    private List<IngredientStatusDto> ingredients; // [7단계] 필요한 재료 목록 (보유/부족 표시)
    private List<RecipeStepDto> steps;           // [7단계] 조리 순서 (단계별)

    private Double ingredientMatchRate; // [4단계] 재료 매칭률
    private Integer missingIngredientCount; // [4단계] 부족한 재료 개수
}
