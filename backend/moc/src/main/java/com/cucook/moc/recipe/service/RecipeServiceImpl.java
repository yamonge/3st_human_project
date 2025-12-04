package com.cucook.moc.recipe.service;

import com.cucook.moc.recipe.dto.response.RecipeGenerateResponse;
import com.cucook.moc.recipe.service.RecipeService;
import com.cucook.moc.recipe.dao.AiRecipeLogDAO;
import com.cucook.moc.recipe.dao.RecipeDAO;
import com.cucook.moc.recipe.dao.RecipeStepDAO;
import com.cucook.moc.recipe.dto.*;
import com.cucook.moc.recipe.vo.AiRecipeLogVO;
import com.cucook.moc.recipe.vo.RecipeVO;
import com.cucook.moc.recipe.vo.RecipeStepVO;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

// --- 의존성 주입 (가상의 AI 클라이언트, 외부 API 클라이언트, 이미지 서비스) ---
// 실제 프로젝트에서는 인터페이스로 분리하고 구현체를 주입받는 것이 좋습니다.
interface GeminiAiClient {
    String generateRecipe(String prompt); // AI 프롬프트 전송 및 응답 반환
}

interface GovRecipeApiClient {
    String searchRecipes(List<String> ingredients, String cuisine, String difficulty, Integer cookTime); // 정부 API 조회
}

interface ImageSearchClient {
    String searchImageUrl(String recipeTitle); // 레시피 제목으로 이미지 검색
}
// --------------------------------------------------------------------------

@Service
@RequiredArgsConstructor // Lombok을 사용하여 final 필드에 대한 생성자 자동 생성 (의존성 주입)
@Slf4j // Lombok을 사용하여 로거 자동 생성
public class RecipeRecommendationServiceImpl implements RecipeService {

    private final AiRecipeLogDAO aiRecipeLogDAO;
    private final RecipeDAO recipeDAO;
    private final RecipeStepDAO recipeStepDAO;

    // 가상의 의존성 주입 (실제로는 Spring 빈으로 등록하여 주입받아야 함)
    private final GeminiAiClient geminiAiClient;
    private final GovRecipeApiClient govRecipeApiClient;
    private final ImageSearchClient imageSearchClient;

    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 파싱을 위한 ObjectMapper

    @Override
    @Transactional // 트랜잭션 관리 (DB 저장 중 에러 발생 시 롤백)
    public RecipeGenerateResponse generateAndRecommendAiRecipes(RecipeGenerateRequest request) throws Exception {

        // ---------------------------------------------------------------------------------------------------
        // [1단계: 사용자 선택 재료 분석 & 2단계: 필터 조건 적용]
        // Request DTO에서 필요한 정보를 추출하고 AI 프롬프트 및 외부 API 호출에 사용할 형태로 가공
        List<String> manualIngredientsList = request.getIngredients().stream()
                .map(IngredientInputDto::getName)
                .collect(Collectors.toList());
        String manualIngredientsStr = String.join(", ", manualIngredientsList);

        String cuisineStyleCd = request.getCuisineStyleCd();
        String difficultyCd = request.getDifficultyCd();
        Integer maxCookTimeMin = request.getMaxCookTimeMin();
        Long userId = request.getUserId(); // 사용자 ID

        // ---------------------------------------------------------------------------------------------------
        // [3단계: 외부 레시피 API 조회 (정부 API)]
        // 정부 API에 전달할 파라미터 구성 및 호출
        log.info("정부 API 조회 시작 - 재료: {}, 요리스타일: {}", manualIngredientsStr, cuisineStyleCd);
        String govApiRawResponse = govRecipeApiClient.searchRecipes(
                manualIngredientsList,
                cuisineStyleCd,
                difficultyCd,
                maxCookTimeMin
        );
        log.debug("정부 API 응답: {}", govApiRawResponse);
        // TODO: govApiRawResponse 파싱 및 AI 프롬프트에 활용할 데이터 추출 로직 추가
        // 이 예시에서는 raw 응답 자체를 프롬프트에 포함한다고 가정합니다.

        // ---------------------------------------------------------------------------------------------------
        // [4단계: Gemini AI 레시피 생성]
        // Gemini AI에 보낼 프롬프트 구성
        String aiPrompt = buildGeminiAiPrompt(
                manualIngredientsList,
                cuisineStyleCd,
                difficultyCd,
                maxCookTimeMin,
                govApiRawResponse // 정부 API 참고 데이터
        );
        log.info("Gemini AI 프롬프트 생성 완료");
        log.debug("AI 프롬프트: {}", aiPrompt);

        // Gemini AI 호출
        String aiResponse = geminiAiClient.generateRecipe(aiPrompt);
        log.info("Gemini AI 응답 수신 완료");
        log.debug("AI 응답: {}", aiResponse);

        // AI 응답 파싱 및 검증
        List<AiRecipeOutputDto> aiGeneratedRecipes = parseAiResponse(aiResponse);
        if (aiGeneratedRecipes.isEmpty()) {
            throw new RuntimeException("AI가 유효한 레시피를 생성하지 못했습니다.");
        }
        log.info("AI가 {}개의 레시피를 생성했습니다.", aiGeneratedRecipes.size());

        // 재료 매칭률 계산 및 부족한 재료 개수 확인
        for (AiRecipeOutputDto recipe : aiGeneratedRecipes) {
            calculateIngredientMatch(recipe, manualIngredientsList);
        }

        // ---------------------------------------------------------------------------------------------------
        // [5단계: 레시피 이미지 수집]
        for (AiRecipeOutputDto recipe : aiGeneratedRecipes) {
            String imageUrl = imageSearchClient.searchImageUrl(recipe.getTitle() + " 음식 요리");
            recipe.setThumbnailUrl(imageUrl != null ? imageUrl : "default_image_url.png"); // 기본 이미지 설정
            log.debug("레시피 '{}' 이미지 URL: {}", recipe.getTitle(), recipe.getThumbnailUrl());
        }

        // ---------------------------------------------------------------------------------------------------
        // [6단계: 우선순위 정렬]
        // 재료 매칭률, 부족한 재료 수, 난이도를 기준으로 정렬
        aiGeneratedRecipes.sort(Comparator
                .comparing(AiRecipeOutputDto::getIngredientMatchRate, Comparator.reverseOrder()) // 매칭률 높은 순
                .thenComparing(AiRecipeOutputDto::getMissingIngredientCount) // 부족 재료 적은 순
                .thenComparing(r -> getDifficultyOrder(r.getDifficultyCd())) // 난이도 (사용자 선택 기준 또는 정해진 순서)
        );
        log.info("레시피 우선순위 정렬 완료");

        // ---------------------------------------------------------------------------------------------------
        // [7단계: 결과 반환 및 AI 생성 로그 저장]

        // AI 생성 로그 저장 (디버깅용)
        AiRecipeLogVO aiRecipeLogVO = new AiRecipeLogVO();
        aiRecipeLogVO.setUserId(userId);
        aiRecipeLogVO.setBaseSourceCd("USER_INPUT"); // 또는 "CAMERA_INGREDIENTS" 등
        aiRecipeLogVO.setCameraSessionId(request.getCameraSessionId());
        aiRecipeLogVO.setManualIngredients(manualIngredientsStr);
        aiRecipeLogVO.setFilterCuisineCd(cuisineStyleCd);
        aiRecipeLogVO.setFilterDiffCd(difficultyCd);
        aiRecipeLogVO.setFilterTimeCd(convertCookTimeToTimeCd(maxCookTimeMin)); // 예시: 분 -> 코드 변환
        aiRecipeLogVO.setGovApiRaw(govApiRawResponse);
        aiRecipeLogVO.setAiRequest(aiPrompt);
        aiRecipeLogVO.setAiResponse(aiResponse);
        aiRecipeLogVO.setResultCnt(aiGeneratedRecipes.size());
        aiRecipeLogVO.setCreatedId(userId); // 생성자 ID
        aiRecipeLogDAO.insertAiRecipeLog(aiRecipeLogVO);
        log.info("AI 레시피 생성 로그 저장 완료 (ID: {})", aiRecipeLogVO.getAiRecipeLogId());


        // 최종 추천 레시피들을 DB에 저장하고 Response DTO 구성
        RecipeGenerateResponse response = new RecipeGenerateResponse();
        List<RecommendedRecipeDto> recommendedRecipes = new ArrayList<>();

        int count = 0;
        for (AiRecipeOutputDto aiRecipe : aiGeneratedRecipes) {
            if (count >= 3) break; // 상위 3개만 반환 (기본값)

            // RecipeVO, RecipeStepVO로 변환하여 tb_recipe, tb_recipe_step 테이블에 저장
            RecipeVO recipeVO = convertToRecipeVO(aiRecipe, userId);
            recipeDAO.insertRecipe(recipeVO); // recipeId가 selectKey로 생성됨

            // 조리 단계 저장
            List<RecipeStepDto> stepDtos = new ArrayList<>();
            if (aiRecipe.getSteps() != null) {
                for (int i = 0; i < aiRecipe.getSteps().size(); i++) {
                    RecipeStepInputDto stepInput = aiRecipe.getSteps().get(i);
                    RecipeStepVO recipeStepVO = convertToRecipeStepVO(recipeVO.getRecipeId(), i + 1, stepInput, userId);
                    recipeStepDAO.insertRecipeStep(recipeStepVO);

                    // Response DTO를 위한 Step DTO 생성
                    RecipeStepDto stepDto = new RecipeStepDto();
                    stepDto.setStepNo(i + 1);
                    stepDto.setStepDesc(stepInput.getDescription());
                    // stepDto.setImageUrl(stepInput.getImageUrl()); // 단계별 이미지가 있다면
                    stepDtos.add(stepDto);
                }
            }
            log.info("레시피 '{}' 및 {}개 단계 저장 완료", recipeVO.getTitle(), stepDtos.size());

            // RecommendedRecipeDto 구성
            RecommendedRecipeDto recommendedRecipeDto = convertToRecommendedRecipeDto(recipeVO, aiRecipe, stepDtos);
            recommendedRecipes.add(recommendedRecipeDto);
            count++;
        }

        response.setRecommendedRecipes(recommendedRecipes);
        log.info("AI 레시피 추천 서비스 완료. {}개의 레시피 반환.", recommendedRecipes.size());
        return response;
    }

    // --- Private Helper Methods (서비스 로직 분리) ---

    private String buildGeminiAiPrompt(List<String> ingredients, String cuisine, String difficulty, Integer cookTime, String govApiData) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("다음 조건을 만족하는 독창적인 레시피 3개를 JSON 형식으로 생성해줘.\n");
        prompt.append("입력 재료: ").append(String.join(", ", ingredients)).append("\n");
        if (cuisine != null && !cuisine.isEmpty()) prompt.append("요리 스타일: ").append(cuisine).append("\n");
        if (difficulty != null && !difficulty.isEmpty()) prompt.append("난이도: ").append(difficulty).append("\n");
        if (cookTime != null) prompt.append("최대 조리 시간: ").append(cookTime).append("분\n");
        if (govApiData != null && !govApiData.isEmpty()) {
            prompt.append("다음 정부 API 레시피 데이터를 참고하여 아이디어를 얻어도 좋아: ").append(govApiData).append("\n");
        }
        prompt.append("레시피는 제목, 요약, 난이도, 조리시간(분), 재료 목록(재료명, 양), 조리 순서(단계별 설명)를 포함해야 해.\n");
        prompt.append("재료 매칭률을 높게 유지하고, 재료의 모든 부분을 활용하는 데 중점을 둬.\n");
        prompt.append("JSON 형식:\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"title\": \"\",\n");
        prompt.append("    \"summary\": \"\",\n");
        prompt.append("    \"difficultyCd\": \"\",\n");
        prompt.append("    \"cookTimeMin\": ,\n");
        prompt.append("    \"ingredients\": [\n");
        prompt.append("      { \"name\": \"\", \"quantity\": \"\" }\n");
        prompt.append("    ],\n");
        prompt.append("    \"steps\": [\n");
        prompt.append("      { \"description\": \"\" }\n");
        prompt.append("    ]\n");
        prompt.append("  }\n");
        prompt.append("]");
        return prompt.toString();
    }

    private List<AiRecipeOutputDto> parseAiResponse(String aiResponse) throws Exception {
        List<AiRecipeOutputDto> recipes = new ArrayList<>();
        try {
            JsonNode rootNode = objectMapper.readTree(aiResponse);
            if (rootNode.isArray()) {
                for (JsonNode recipeNode : rootNode) {
                    AiRecipeOutputDto recipe = objectMapper.treeToValue(recipeNode, AiRecipeOutputDto.class);
                    recipes.add(recipe);
                }
            }
        } catch (Exception e) {
            log.error("AI 응답 파싱 중 오류 발생: {}", e.getMessage(), e);
            throw new Exception("AI 응답을 파싱할 수 없습니다.", e);
        }
        return recipes;
    }

    private void calculateIngredientMatch(AiRecipeOutputDto recipe, List<String> userIngredients) {
        if (recipe.getIngredients() == null || userIngredients == null || userIngredients.isEmpty()) {
            recipe.setIngredientMatchRate(0.0);
            recipe.setMissingIngredientCount(recipe.getIngredients() != null ? recipe.getIngredients().size() : 0);
            return;
        }

        int totalRequiredIngredients = recipe.getIngredients().size();
        if (totalRequiredIngredients == 0) {
            recipe.setIngredientMatchRate(1.0); // 필요한 재료가 없으면 100% 매칭
            recipe.setMissingIngredientCount(0);
            return;
        }

        int matchedCount = 0;
        List<IngredientStatusDto> ingredientStatusList = new ArrayList<>();
        List<String> missingIngredients = new ArrayList<>();

        for (IngredientInputDto requiredIngredient : recipe.getIngredients()) {
            boolean found = userIngredients.stream()
                    .anyMatch(userIng -> userIng.equalsIgnoreCase(requiredIngredient.getName()));
            IngredientStatusDto status = new IngredientStatusDto();
            status.setName(requiredIngredient.getName());
            status.setQuantity(requiredIngredient.getQuantityPreference()); // AI 응답의 quantity를 사용
            status.setOwned(found);
            ingredientStatusList.add(status);

            if (found) {
                matchedCount++;
            } else {
                missingIngredients.add(requiredIngredient.getName());
            }
        }

        recipe.setIngredientMatchRate((double) matchedCount / totalRequiredIngredients);
        recipe.setMissingIngredientCount(totalRequiredIngredients - matchedCount);
        recipe.setIngredientStatusList(ingredientStatusList); // 응답 DTO를 위해 저장
        recipe.setMissingIngredients(missingIngredients); // 응답 DTO를 위해 저장
    }


    private int getDifficultyOrder(String difficultyCd) {
        // 난이도 코드에 따른 정렬 순서 정의
        return switch (difficultyCd) {
            case "EASY" -> 1;
            case "NORMAL" -> 2;
            case "HARD" -> 3;
            default -> 99; // 기타 난이도
        };
    }

    // VO 변환 헬퍼 메서드
    private RecipeVO convertToRecipeVO(AiRecipeOutputDto aiRecipe, Long userId) {
        RecipeVO vo = new RecipeVO();
        vo.setOwnerUserId(userId);
        vo.setSourceType("AI"); // AI 생성 레시피
        vo.setTitle(aiRecipe.getTitle());
        vo.setSummary(aiRecipe.getSummary());
        vo.setThumbnailUrl(aiRecipe.getThumbnailUrl());
        vo.setDifficultyCd(aiRecipe.getDifficultyCd());
        vo.setCookTimeMin(aiRecipe.getCookTimeMin());
        vo.setCuisineStyleCd(aiRecipe.getCuisineStyleCd()); // AI 응답에 요리 스타일이 있다면
        vo.setPublic(true); // 기본적으로 공개
        vo.setDeleted(false);
        vo.setViewCnt(0);
        vo.setLikeCnt(0);
        vo.setReportCnt(0);
        vo.setCreatedId(userId);
        return vo;
    }

    private RecipeStepVO convertToRecipeStepVO(long recipeId, int stepNo, RecipeStepInputDto stepInput, Long createdId) {
        RecipeStepVO vo = new RecipeStepVO();
        vo.setRecipeId(recipeId);
        vo.setStepNo(stepNo);
        vo.setStepDesc(stepInput.getDescription());
        // vo.setImageUrl(stepInput.getImageUrl()); // 단계별 이미지가 있다면
        vo.setCreatedId(createdId);
        return vo;
    }

    private RecommendedRecipeDto convertToRecommendedRecipeDto(RecipeVO recipeVO, AiRecipeOutputDto aiRecipe, List<RecipeStepDto> stepDtos) {
        RecommendedRecipeDto dto = new RecommendedRecipeDto();
        dto.setRecipeId(recipeVO.getRecipeId());
        dto.setTitle(recipeVO.getTitle());
        dto.setSummary(recipeVO.getSummary());
        dto.setThumbnailUrl(recipeVO.getThumbnailUrl());
        dto.setDifficultyCd(recipeVO.getDifficultyCd());
        dto.setCookTimeMin(recipeVO.getCookTimeMin());
        dto.setCuisineStyleCd(recipeVO.getCuisineStyleCd());

        dto.setIngredientMatchRate(aiRecipe.getIngredientMatchRate());
        dto.setMissingIngredientCount(aiRecipe.getMissingIngredientCount());
        dto.setIngredients(aiRecipe.getIngredientStatusList()); // 계산된 재료 상태 목록
        dto.setSteps(stepDtos); // 저장된 단계 목록
        return dto;
    }

    private String convertCookTimeToTimeCd(Integer cookTimeMin) {
        if (cookTimeMin == null) return null;
        if (cookTimeMin <= 10) return "10MIN";
        if (cookTimeMin <= 30) return "30MIN";
        if (cookTimeMin <= 60) return "1HOUR";
        return "2HOURPLUS"; // 2시간 이상
    }

    // AI 응답 파싱을 위한 DTO (내부적으로만 사용되거나, 필요에 따라 별도 파일로 분리)
    @Data
    static class AiRecipeOutputDto {
        private String title;
        private String summary;
        private String difficultyCd;
        private Integer cookTimeMin;
        private String cuisineStyleCd; // AI 응답에 포함될 경우
        private List<IngredientInputDto> ingredients; // AI가 제안하는 재료 목록 (AI 응답에서 파싱)
        private List<RecipeStepInputDto> steps;

        // 워크플로우 4, 6, 7단계에서 계산된 정보
        private String thumbnailUrl; // 이미지 검색 후 추가
        private Double ingredientMatchRate;
        private Integer missingIngredientCount;
        private List<IngredientStatusDto> ingredientStatusList; // 각 재료의 보유 여부
        private List<String> missingIngredients; // 부족한 재료 목록
    }

    @Data
    static class RecipeStepInputDto {
        private String description;
        // private String imageUrl; // AI가 단계별 이미지 URL을 준다면
    }
}
