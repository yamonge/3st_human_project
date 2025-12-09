package com.cucook.moc.recipe.service;

import com.cucook.moc.recipe.dto.request.RecipeGenerationRequestDTO;
import com.cucook.moc.recipe.dto.response.RecipeRecommendationResponseDTO;

/**
 * AI 레시피 추천 및 관련 비즈니스 로직을 정의하는 서비스 인터페이스입니다.
 */
public interface RecipeService {

    /**
     * AI 레시피 추천 워크플로우를 실행하여 사용자에게 레시피를 추천합니다.
     * 사용자 선택 재료 및 필터 조건에 따라 Gemini AI를 통해 레시피를 생성하고,
     * 데이터베이스에 저장 후, 우선순위에 따라 정렬된 레시피 목록을 반환합니다.
     *
     * @param requestDTO 사용자 선택 재료 및 필터 조건을 포함하는 요청 DTO
     * @return AI가 추천한 레시피 목록을 포함하는 응답 DTO
     */
    RecipeRecommendationResponseDTO recommendRecipes(RecipeGenerationRequestDTO requestDTO);

    // 향후 필요에 따라 레시피 상세 조회, 사용자 레시피 관리 등의 메서드 추가 가능
    // RecipeVO getRecipeDetail(Long recipeId);
    // List<RecipeVO> searchRecipes(RecipeSearchCriteriaDTO criteria);
}