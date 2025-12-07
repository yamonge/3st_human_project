//package com.cucook.moc.recipe.service.impl;
//
//import com.cucook.moc.recipe.dao.RecipeDAO;
//import com.cucook.moc.recipe.dto.request.RecipeGenerationRequestDTO;
//import com.cucook.moc.recipe.dto.request.SelectedIngredientRequestDTO;
//import com.cucook.moc.recipe.dto.response.RecipeRecommendationResponseDTO; // 사용자 요청에 따라 이 DTO 이름 유지
//import com.cucook.moc.recipe.dto.response.RecommendedRecipeDTO;
//import com.cucook.moc.recipe.dto.response.RecipeIngredientResponseDTO;
//import com.cucook.moc.recipe.dto.response.RecipeStepResponseDTO;
//import com.cucook.moc.recipe.service.AiRecipeLogService;
//import com.cucook.moc.recipe.service.RecipeIngredientService; // 추가: RecipeIngredientService 주입
//import com.cucook.moc.recipe.service.RecipeService;
//import com.cucook.moc.recipe.service.RecipeStepService; // 추가: RecipeStepService 주입
//import com.cucook.moc.recipe.vo.AiRecipeLogVO;
//import com.cucook.moc.recipe.vo.RecipeIngredientVO;
//import com.cucook.moc.recipe.vo.RecipeStepVO;
//import com.cucook.moc.recipe.vo.RecipeVO;
//import com.cucook.moc.gemini.GeminiApiUtils; // Gemini API 호출 유틸리티 (패키지 구조 변경 반영)
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.core.type.TypeReference;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.ArrayList;
//import java.util.Comparator;
//import java.util.List;
//import java.util.Map;
//import java.util.stream.Collectors;
//
//@Service // 이 클래스를 Spring Service 컴포넌트로 등록
//public class RecipeServiceImpl implements RecipeService {
//
//    private final RecipeDAO recipeDAO;
//    private final AiRecipeLogService aiRecipeLogService;
//    private final GeminiApiUtils geminiApiUtils;
//    private final ObjectMapper objectMapper;
//    private final RecipeIngredientService recipeIngredientService;
//    private final RecipeStepService recipeStepService; // 추가: RecipeStepService 주입
//
//    @Autowired
//    public RecipeServiceImpl(RecipeDAO recipeDAO,
//                             AiRecipeLogService aiRecipeLogService,
//                             GeminiApiUtils geminiApiUtils,
//                             ObjectMapper objectMapper,
//                             RecipeIngredientService recipeIngredientService, // 추가
//                             RecipeStepService recipeStepService) { // 추가
//        this.recipeDAO = recipeDAO;
//        this.aiRecipeLogService = aiRecipeLogService;
//        this.geminiApiUtils = geminiApiUtils;
//        this.objectMapper = objectMapper;
//        this.recipeIngredientService = recipeIngredientService; // 주입
//        this.recipeStepService = recipeStepService; // 주입
//    }
//
//    @Override
//    @Transactional
//    public RecipeRecommendationResponseDTO recommendRecipes(RecipeGenerationRequestDTO requestDTO) { // 반환 타입 RecipeRecommendationResponseDTO 유지
//        // 1. 사용자 선택 재료 분석 및 필터 조건 준비 (requestDTO에서 이미 처리됨)
//
//        // 2. Gemini AI 프롬프트 생성
//        String prompt = createGeminiPrompt(requestDTO);
//
//        // 3. Gemini AI 호출
//        String aiResponseJson = "";
//        try {
//            aiResponseJson = geminiApiUtils.callGeminiApi(prompt);
//        } catch (Exception e) {
//            System.err.println("Gemini API 호출 실패: " + e.getMessage());
//            logAiRecipeGeneration(requestDTO, prompt, "ERROR: " + e.getMessage(), 0); // 실패 로그
//            return new RecipeRecommendationResponseDTO(new ArrayList<>(), "ERROR", "레시피 생성 중 오류가 발생했습니다."); // 반환 객체 수정
//        }
//
//        // 4. Gemini AI 응답 파싱 및 검증
//        List<RecommendedRecipeDTO> generatedRecipes;
//        try {
//            generatedRecipes = parseGeminiRecipeResponse(aiResponseJson, requestDTO);
//        } catch (Exception e) {
//            System.err.println("Gemini 응답 파싱 실패: " + e.getMessage());
//            logAiRecipeGeneration(requestDTO, prompt, "ERROR: " + e.getMessage() + " / Raw response: " + aiResponseJson, 0); // 실패 로그
//            return new RecipeRecommendationResponseDTO(new ArrayList<>(), "ERROR", "AI 응답 파싱 중 오류가 발생했습니다."); // 반환 객체 수정
//        }
//
//        // 5. 레시피 저장 및 이미지 할당, 재료 매칭률 계산
//        List<RecommendedRecipeDTO> processedRecipes = new ArrayList<>();
//        // int successCount = 0; // 사용되지 않으므로 제거
//        for (RecommendedRecipeDTO recipeDTO : generatedRecipes) {
//            try {
//                RecipeVO recipeVO = mapToRecipeVO(recipeDTO, requestDTO.getUserId());
//                String thumbnailUrl = getCategoryImage(recipeVO.getCuisineStyleCd(), recipeVO.getTitle());
//                recipeVO.setThumbnailUrl(thumbnailUrl);
//
//                recipeDAO.insertRecipe(recipeVO);
//                Long generatedRecipeId = recipeVO.getRecipeId(); // 시퀀스 값 반환
//
//                List<RecipeStepVO> stepVOs = mapToRecipeStepVOs(recipeDTO.getCookingSteps(), generatedRecipeId, requestDTO.getUserId());
//                for(RecipeStepVO step : stepVOs) {
//                    if (step.getImageUrl() == null || step.getImageUrl().isEmpty() || step.getImageUrl().equals("placeholder_url")) {
//                        step.setImageUrl(thumbnailUrl); // 레시피 대표 이미지로 대체하거나, 단계별 기본 이미지 할당
//                    }
//                }
//                recipeStepService.saveAllRecipeSteps(stepVOs); // RecipeStepService 호출
//
//                List<RecipeIngredientVO> ingredientVOs = mapToRecipeIngredientVOs(recipeDTO.getRequiredIngredients(), generatedRecipeId, requestDTO.getUserId());
//                for (RecipeIngredientVO ingredientVO : ingredientVOs) {
//                    // 사용자가 가진 재료와 매칭하여 is_owned_default 설정
//                    boolean isUserOwned = requestDTO.getSelectedIngredients().stream()
//                            .anyMatch(si -> si.getIngredientName().equals(ingredientVO.getIngredientName()));
//                    ingredientVO.setIsOwnedDefault(isUserOwned ? "Y" : "N");
//                }
//                recipeIngredientService.saveAllRecipeIngredients(ingredientVOs); // RecipeIngredientService 호출
//
//                // 저장된 레시피 정보를 DTO에 업데이트 (특히 DB에서 부여된 ID, 실제 이미지 URL)
//                recipeDTO.setRecipeId(generatedRecipeId);
//                recipeDTO.setThumbnailUrl(thumbnailUrl);
//
//                // 재료 매칭률 및 부족한 재료 개수 계산 (response DTO에 반영)
//                List<RecipeIngredientResponseDTO> responseIngredients = calculateIngredientOwnership(
//                        requestDTO.getSelectedIngredients(),
//                        ingredientVOs // DB에 저장될 재료 VO 리스트 사용
//                );
//                recipeDTO.setRequiredIngredients(responseIngredients); // DTO의 재료 목록을 업데이트
//
//                processedRecipes.add(recipeDTO);
//                // successCount++; // 사용되지 않으므로 제거
//
//            } catch (Exception e) {
//                System.err.println("개별 레시피 저장 실패 (제목: " + recipeDTO.getTitle() + "): " + e.getMessage());
//                e.printStackTrace();
//            }
//        }
//
//        // 6. 우선순위 정렬 (재료 매칭률, 부족한 재료, 난이도)
//        processedRecipes.sort(Comparator
//                .<RecommendedRecipeDTO>comparingDouble(recipe -> {
//                    double totalRecipeIngredients = recipe.getRequiredIngredients().size();
//                    long matchingIngredients = recipe.getRequiredIngredients().stream()
//                            .filter(RecipeIngredientResponseDTO::isOwned)
//                            .count();
//                    return totalRecipeIngredients > 0 ? (double) matchingIngredients / totalRecipeIngredients : 0.0;
//                }).reversed() // 1순위: 재료 매칭률 높은 순
//                .thenComparingInt(recipe -> (int) recipe.getRequiredIngredients().stream()
//                        .filter(ing -> !ing.isOwned())
//                        .count()) // 2순위: 부족한 재료 적은 순
//                .thenComparing(recipe -> { // 3순위: 난이도 (사용자 선택 기준)
//                    if (requestDTO.getFilterDifficultyCd() != null) {
//                        // 사용자 선택 난이도에 따라 정렬 (예: 선택 난이도와 일치하는 것이 우선)
//                        if (requestDTO.getFilterDifficultyCd().equalsIgnoreCase(recipe.getDifficultyCd())) return 0;
//                    }
//                    // 기본 난이도 순서 (EASY -> NORMAL -> HARD)
//                    if ("EASY".equalsIgnoreCase(recipe.getDifficultyCd())) return 1;
//                    if ("NORMAL".equalsIgnoreCase(recipe.getDifficultyCd())) return 2;
//                    if ("HARD".equalsIgnoreCase(recipe.getDifficultyCd())) return 3;
//                    return 4; // 기타
//                })
//        );
//
//        // 7. 결과 반환 (상위 3개 선택)
//        List<RecommendedRecipeDTO> finalRecommendedRecipes = processedRecipes.stream()
//                .limit(3)
//                .collect(Collectors.toList());
//
//        // AI 생성 로그 저장 (디버깅용)
//        logAiRecipeGeneration(requestDTO, prompt, aiResponseJson, finalRecommendedRecipes.size());
//
//        return new RecipeRecommendationResponseDTO(finalRecommendedRecipes, "SUCCESS", "AI 레시피 추천이 완료되었습니다."); // 반환 객체 수정
//    }
//
//    /**
//     * Gemini AI에 전송할 프롬프트를 생성합니다.
//     *
//     * @param requestDTO 사용자 요청 DTO
//     * @return Gemini AI 프롬프트 문자열
//     */
//    private String createGeminiPrompt(RecipeGenerationRequestDTO requestDTO) {
//        StringBuilder promptBuilder = new StringBuilder();
//        promptBuilder.append("당신은 요리 전문가 AI 입니다. 사용자가 제공한 재료와 필터 조건에 맞춰 최적의 레시피 3개를 JSON 형식으로 생성해주세요.\n");
//        // JSON 형식 예시에서 thumbnailUrl과 imageUrl 제거, category 추가
//        promptBuilder.append("반드시 다음 JSON 형식에 맞춰 생성해야 합니다: [{\"title\":\"레시피1 제목\", \"summary\":\"간단 요약\", \"difficultyCd\":\"EASY\", \"cookTimeMin\":30, \"cuisineStyleCd\":\"KOR\", \"category\":\"rice_dish\", \"requiredIngredients\":[{\"ingredientName\":\"재료1\", \"quantityDesc\":\"수량\"}], \"cookingSteps\":[{\"stepNo\":1, \"stepDesc\":\"단계1 설명\"}]}, ...]\n");
//
//        promptBuilder.append("\n[카테고리 규칙]\n"); // ⭐ 이미지 프롬프트의 카테고리 규칙 추가
//        promptBuilder.append("각 레시피마다 'category' 필드를 포함해야 합니다.\n");
//        promptBuilder.append("category는 아래 값 중 하나만 사용하세요: [\"rice_dish\",\"noodle\",\"soup_stew\",\"stir_fry\",\"grill_roast\",\"salad\",\"side_dish\",\"dessert_snack\"]\n");
//
//
//        promptBuilder.append("\n사용자 선택 재료:\n");
//        requestDTO.getSelectedIngredients().forEach(ing -> {
//            promptBuilder.append("- ").append(ing.getIngredientName());
//            if (ing.getUsageType() != null && !ing.getUsageType().isEmpty()) {
//                promptBuilder.append(" (사용량: ").append(ing.getUsageType()).append(")");
//            }
//            if (ing.getAmountHint() != null && !ing.getAmountHint().isEmpty()) {
//                promptBuilder.append(" (양 힌트: ").append(ing.getAmountHint()).append(")");
//            }
//            promptBuilder.append("\n");
//        });
//
//        promptBuilder.append("\n필터 조건:\n");
//        promptBuilder.append("- 요리 스타일: ").append(requestDTO.getFilterCuisineCd()).append("\n");
//        promptBuilder.append("- 난이도: ").append(requestDTO.getFilterDifficultyCd()).append("\n");
//        promptBuilder.append("- 조리 시간: ").append(requestDTO.getFilterCookTimeCd()).append("\n");
//
//        promptBuilder.append("\n생성 규칙:\n");
//        promptBuilder.append("- 제공된 모든 재료를 최대한 활용해주세요.\n");
//        promptBuilder.append("- 레시피 3개를 생성하고, JSON 배열 형태로 반환해주세요.\n");
//        promptBuilder.append("- 각 레시피는 제목, 요약, 난이도, 조리시간(분 단위 숫자), 요리 스타일, 카테고리, 필요한 재료 목록, 조리 순서를 포함해야 합니다.\n"); // ⭐ 카테고리 포함 명시
//        promptBuilder.append("- 필요한 재료 목록에는 재료명과 수량설명(예: 200g, 1개, 1/2컵)이 포함되어야 합니다.\n");
//        promptBuilder.append("- 조리 순서에는 단계 번호, 단계 설명이 포함되어야 합니다.\n");
//        promptBuilder.append("- 부족한 재료가 있더라도 사용자가 선택한 재료를 중심으로 맛있고 창의적인 레시피를 제안해주세요.\n");
//
//        return promptBuilder.toString();
//    }
//
//
//    /**
//     * Gemini AI의 JSON 응답을 RecommendedRecipeDTO 리스트로 파싱합니다.
//     * AI가 제공한 이미지 URL (placeholder)은 그대로 사용하되, 나중에 실제 이미지로 대체될 수 있습니다.
//     *
//     * @param aiResponseJson Gemini AI의 원본 JSON 응답
//     * @param requestDTO 요청 DTO (기본값 설정용)
//     * @return 파싱된 RecommendedRecipeDTO 리스트
//     * @throws Exception JSON 파싱 중 오류 발생 시
//     */
//    private List<RecommendedRecipeDTO> parseGeminiRecipeResponse(String aiResponseJson, RecipeGenerationRequestDTO requestDTO) throws Exception {
//        List<RecommendedRecipeDTO> recipes = objectMapper.readValue(aiResponseJson, new TypeReference<List<RecommendedRecipeDTO>>() {});
//
//        // AI가 제공하지 않은 필터 조건을 기본값으로 채우기 (AI가 생성하지 않을 경우)
//        for (RecommendedRecipeDTO recipe : recipes) {
//            if (recipe.getCuisineStyleCd() == null || recipe.getCuisineStyleCd().isEmpty()) { // 오타 수정 완료
//                recipe.setCuisineStyleCd(requestDTO.getFilterCuisineCd());
//            }
//            if (recipe.getDifficultyCd() == null || recipe.getDifficultyCd().isEmpty()) {
//                recipe.setDifficultyCd(requestDTO.getFilterDifficultyCd());
//            }
//            // cookTimeMin은 AI가 숫자로 줄 것이므로 따로 처리하지 않음.
//        }
//
//        return recipes;
//    }
//
//    /**
//     * RecommendedRecipeDTO를 RecipeVO로 매핑합니다.
//     *
//     * @param dto RecommendedRecipeDTO 객체
//     * @param userId 생성자 ID
//     * @return 매핑된 RecipeVO 객체
//     */
//    private RecipeVO mapToRecipeVO(RecommendedRecipeDTO dto, String userId) {
//        RecipeVO vo = new RecipeVO();
//        vo.setOwnerUserId(userId);
//        vo.setSourceType("AI_GENERATED");
//        vo.setTitle(dto.getTitle());
//        vo.setSummary(dto.getSummary());
//        vo.setCuisineStyleCd(dto.getCuisineStyleCd());
//        vo.setCategory(dto.getCategory());
//        vo.setThumbnailUrl(dto.getThumbnailUrl());
//        vo.setDifficultyCd(dto.getDifficultyCd());
//        vo.setCookTimeMin(dto.getCookTimeMin());
//        vo.setCuisineStyleCd(dto.getCuisineStyleCd());
//        vo.setIsPublic("N");
//        vo.setIsDeleted("N");
//        vo.setViewCnt(0);
//        vo.setLikeCnt(0);
//        vo.setReportCnt(0);
//        vo.setCreatedId(userId);
//        return vo;
//    }
//
//    /**
//     * RecipeStepResponseDTO 리스트를 RecipeStepVO 리스트로 매핑합니다.
//     *
//     * @param dtos RecipeStepResponseDTO 리스트
//     * @param recipeId 연결할 레시피 ID
//     * @param createdId 생성자 ID
//     * @return 매핑된 RecipeStepVO 리스트
//     */
//    private List<RecipeStepVO> mapToRecipeStepVOs(List<RecipeStepResponseDTO> dtos, Long recipeId, String createdId) {
//        return dtos.stream().map(dto -> {
//            RecipeStepVO vo = new RecipeStepVO();
//            vo.setRecipeId(recipeId); // RecipeVO 저장 후 얻은 ID
//            vo.setStepNo(dto.getStepNo());
//            vo.setStepDesc(dto.getStepDesc());
//            vo.setImageUrl(dto.getImageUrl()); // AI가 준 placeholder URL (나중에 실제 이미지로 대체될 수 있음)
//            vo.setCreatedId(createdId);
//            return vo;
//        }).collect(Collectors.toList());
//    }
//
//    /**
//     * RecipeIngredientResponseDTO 리스트를 RecipeIngredientVO 리스트로 매핑합니다.
//     * isOwnedDefault 필드는 나중에 실제 재료 보유 여부 판단 후 채워집니다.
//     *
//     * @param dtos RecipeIngredientResponseDTO 리스트
//     * @param recipeId 연결할 레시피 ID
//     * @param createdId 생성자 ID
//     * @return 매핑된 RecipeIngredientVO 리스트
//     */
//    private List<RecipeIngredientVO> mapToRecipeIngredientVOs(List<RecipeIngredientResponseDTO> dtos, Long recipeId, String createdId) {
//        return dtos.stream().map(dto -> {
//            RecipeIngredientVO vo = new RecipeIngredientVO();
//            vo.setRecipeId(recipeId); // RecipeVO 저장 후 얻은 ID
//            vo.setIngredientName(dto.getIngredientName());
//            vo.setQuantityDesc(dto.getQuantityDesc());
//            vo.setIsOwnedDefault("N"); // 초기값 N으로 설정, 이후 로직에서 Y로 업데이트 됨
//            vo.setCreatedId(createdId); // String 타입으로 직접 설정
//            return vo;
//        }).collect(Collectors.toList());
//    }
//
//
//    /**
//     * DB에 저장된 카테고리별 이미지 중 적절한 이미지를 선택하여 URL을 반환합니다.
//     * 실제 구현 시에는 별도의 이미지 관리 테이블/DAO를 통해 조회하는 로직이 필요합니다.
//     *
//     * @param cuisineStyleCd 요리 스타일 코드
//     * @param recipeTitle 레시피 제목 (검색 키워드로 활용될 수 있음)
//     * @return 이미지 URL
//     */
//    private String getCategoryImage(String cuisineStyleCd, String recipeTitle) {
//        // TODO: 실제 DB에서 카테고리별 이미지 조회 로직 구현 필요
//        // 예시: 카테고리별로 미리 정해둔 이미지를 반환하거나, 랜덤 이미지 할당
//        switch (cuisineStyleCd) {
//            case "KOR": return "https://moc.cucook.com/images/korean_dish_default.jpg";
//            case "CHN": return "https://moc.cucook.com/images/chinese_dish_default.jpg";
//            case "JPN": return "https://moc.cucook.com/images/japanese_dish_default.jpg";
//            case "WES": return "https://moc.cucook.com/images/western_dish_default.jpg";
//            default: return "https://moc.cucook.com/images/default_dish.jpg";
//        }
//    }
//
//    /**
//     * 사용자가 선택한 재료와 레시피에 필요한 재료를 비교하여 보유 여부를 계산하고,
//     * RecipeIngredientResponseDTO 리스트로 반환합니다.
//     *
//     * @param userSelectedIngredients 사용자 선택 재료 DTO 리스트
//     * @param recipeRequiredIngredientVOs 레시피에 필요한 재료 VO 리스트 (DB에 저장될 재료 목록)
//     * @return 보유 여부가 계산된 RecipeIngredientResponseDTO 리스트
//     */
//    private List<RecipeIngredientResponseDTO> calculateIngredientOwnership(
//            List<SelectedIngredientRequestDTO> userSelectedIngredients,
//            List<RecipeIngredientVO> recipeRequiredIngredientVOs) {
//
//        // 사용자가 선택한 재료명들을 집합(Set)으로 만들어 검색 효율을 높임
//        Map<String, SelectedIngredientRequestDTO> userIngredientMap = userSelectedIngredients.stream()
//                .collect(Collectors.toMap(
//                        SelectedIngredientRequestDTO::getIngredientName,
//                        ing -> ing,
//                        (existing, replacement) -> existing // 중복 시 기존 값 유지
//                ));
//
//        return recipeRequiredIngredientVOs.stream().map(vo -> {
//            RecipeIngredientResponseDTO dto = new RecipeIngredientResponseDTO();
//            dto.setIngredientName(vo.getIngredientName());
//            dto.setQuantityDesc(vo.getQuantityDesc());
//            // 사용자가 가진 재료명 Set에 현재 레시피 재료가 포함되는지 확인
//            dto.setOwned(userIngredientMap.containsKey(vo.getIngredientName()));
//            return dto;
//        }).collect(Collectors.toList());
//    }
//
//    /**
//     * AI 레시피 생성 로그를 저장합니다.
//     *
//     * @param requestDTO AI 요청 DTO
//     * @param prompt Gemini AI에 보낸 프롬프트
//     * @param aiResponse Gemini AI로부터 받은 응답
//     * @param resultCount 생성된 레시피 수
//     */
//    private void logAiRecipeGeneration(RecipeGenerationRequestDTO requestDTO, String prompt, String aiResponse, int resultCount) {
//        AiRecipeLogVO logVO = new AiRecipeLogVO();
//        logVO.setUserId(requestDTO.getUserId());
//        logVO.setBaseSourceCd(requestDTO.getCameraSessionId() != null && !requestDTO.getCameraSessionId().isEmpty() ? "CAMERA" : "MANUAL");
//        logVO.setCameraSessionId(requestDTO.getCameraSessionId());
//        logVO.setManualIngredients(requestDTO.getSelectedIngredients().stream()
//                .map(SelectedIngredientRequestDTO::getIngredientName)
//                .collect(Collectors.joining(",")));
//        logVO.setFilterCuisineCd(requestDTO.getFilterCuisineCd());
//        logVO.setFilterDiffCd(requestDTO.getFilterDifficultyCd());
//        logVO.setFilterTimeCd(requestDTO.getFilterCookTimeCd());
//        logVO.setGovApiRaw("N/A_NO_GOV_API");
//        logVO.setAiRequest(prompt);
//        logVO.setAiResponse(aiResponse);
//        logVO.setResultCnt(resultCount);
//        logVO.setCreatedId(requestDTO.getUserId());
//
//        aiRecipeLogService.saveAiRecipeLog(logVO);
//    }
//}