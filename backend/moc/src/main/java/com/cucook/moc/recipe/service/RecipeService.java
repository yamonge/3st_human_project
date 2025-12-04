package com.cucook.moc.recipe.service;

import com.cucook.moc.recipe.dto.request.RecipeGenerateRequest;
import com.cucook.moc.recipe.dto.response.RecipeGenerateResponse;
import com.cucook.moc.recipe.vo.AiRecipeLogVO;

import java.util.List;


/**
 * AI 기반 레시피 추천 및 생성 서비스를 위한 인터페이스.
 */
public interface RecipeService {

    /**
     * 사용자 입력 재료 및 필터 조건에 따라 AI 레시피를 추천하고 생성합니다.
     *
     * @param request AI 레시피 생성 요청 데이터 (재료, 필터 조건 등)
     * @return 추천 및 생성된 레시피 목록을 포함하는 응답 DTO
     * @throws Exception 레시피 생성 및 처리 중 발생할 수 있는 예외
     */
    RecipeGenerateResponse generateAndRecommendAiRecipes(RecipeGenerateRequest request) throws Exception;

    // 만약 이미 생성된 AI 레시피 로그를 조회하는 기능도 필요하다면 추가
     List<AiRecipeLogVO> searchAiRecipeLogs(AiRecipeLogSearchRequest request);
}