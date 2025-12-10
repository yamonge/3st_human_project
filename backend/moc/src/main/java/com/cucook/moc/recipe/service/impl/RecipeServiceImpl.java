package com.cucook.moc.recipe.service.impl;

import com.cucook.moc.recipe.dao.RecipeDAO;
import com.cucook.moc.recipe.dto.request.RecipeGenerationRequestDTO;
import com.cucook.moc.recipe.dto.request.SelectedIngredientRequestDTO;
import com.cucook.moc.recipe.dto.response.*;
import com.cucook.moc.recipe.service.AiRecipeLogService;
import com.cucook.moc.recipe.service.RecipeIngredientService;
import com.cucook.moc.recipe.service.RecipeService;
import com.cucook.moc.recipe.service.RecipeStepService;
import com.cucook.moc.recipe.vo.AiRecipeLogVO;
import com.cucook.moc.recipe.vo.RecipeIngredientVO;
import com.cucook.moc.recipe.vo.RecipeStepVO;
import com.cucook.moc.recipe.vo.RecipeVO;
import com.cucook.moc.gemini.GeminiApiUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RecipeServiceImpl implements RecipeService {

    private final RecipeDAO recipeDAO;
    private final AiRecipeLogService aiRecipeLogService;
    private final GeminiApiUtils geminiApiUtils;
    private final ObjectMapper objectMapper;
    private final RecipeIngredientService recipeIngredientService;
    private final RecipeStepService recipeStepService;

    @Autowired
    public RecipeServiceImpl(RecipeDAO recipeDAO,
                             AiRecipeLogService aiRecipeLogService,
                             GeminiApiUtils geminiApiUtils,
                             ObjectMapper objectMapper,
                             RecipeIngredientService recipeIngredientService,
                             RecipeStepService recipeStepService) {
        this.recipeDAO = recipeDAO;
        this.aiRecipeLogService = aiRecipeLogService;
        this.geminiApiUtils = geminiApiUtils;
        this.objectMapper = objectMapper;
        this.recipeIngredientService = recipeIngredientService;
        this.recipeStepService = recipeStepService;
    }

    @Override
    @Transactional
    public RecipeRecommendationResponseDTO recommendRecipes(RecipeGenerationRequestDTO requestDTO) {
        String prompt = createGeminiPrompt(requestDTO);
        String aiResponseJson = "";
        try {
            aiResponseJson = geminiApiUtils.callGeminiApi(prompt);
        } catch (Exception e) {
            System.err.println("Gemini API 호출 실패: " + e.getMessage());
            logAiRecipeGeneration(requestDTO, prompt, "ERROR: " + e.getMessage(), 0);
            return new RecipeRecommendationResponseDTO(new ArrayList<>(), "ERROR", "레시피 생성 중 오류가 발생했습니다.");
        }

        List<RecommendedRecipeDTO> generatedRecipes;
        try {
            generatedRecipes = parseGeminiRecipeResponse(aiResponseJson, requestDTO);
        } catch (Exception e) {
            System.err.println("Gemini 응답 파싱 실패: " + e.getMessage());
            logAiRecipeGeneration(requestDTO, prompt, "ERROR: " + e.getMessage() + " / Raw response: " + aiResponseJson, 0);
            return new RecipeRecommendationResponseDTO(new ArrayList<>(), "ERROR", "AI 응답 파싱 중 오류가 발생했습니다.");
        }

        List<RecommendedRecipeDTO> processedRecipes = new ArrayList<>();
        for (RecommendedRecipeDTO recipeDTO : generatedRecipes) {
            try {
                // System.out.println("0"); // 디버깅용 출력 제거
                // userId는 String, VO의 ownerUserId, createdId는 Long이므로 변환 필요
                Long userIdLong = (requestDTO.getUserId() != null && !requestDTO.getUserId().isEmpty()) ? Long.valueOf(requestDTO.getUserId()) : null;

                RecipeVO recipeVO = mapToRecipeVO(recipeDTO, userIdLong); // ⭐ userId 파라미터 타입 Long으로 변경
                // System.out.println("1"); // 디버깅용 출력 제거
                String thumbnailUrl = getCategoryImage(recipeVO.getCuisineStyleCd(), recipeVO.getTitle());
                // System.out.println("2"); // 디버깅용 출력 제거
                recipeVO.setThumbnailUrl(thumbnailUrl);
                // System.out.println("3"); // 디버깅용 출력 제거

                recipeDAO.insertRecipe(recipeVO);
                // System.out.println("4"); // 디버깅용 출력 제거
                Long generatedRecipeId = recipeVO.getRecipeId(); // 시퀀스 값 반환
                // System.out.println("5"); // 디버깅용 출력 제거

                List<RecipeStepVO> stepVOs = mapToRecipeStepVOs(recipeDTO.getCookingSteps(), generatedRecipeId, userIdLong); // ⭐ createdId 파라미터 타입 Long으로 변경
                // System.out.println("6"); // 디버깅용 출력 제거
                for(RecipeStepVO step : stepVOs) {
                    if (step.getImageUrl() == null || step.getImageUrl().isEmpty() || step.getImageUrl().equals("placeholder_url")) {
                        step.setImageUrl(thumbnailUrl);
                    }
                }
                // System.out.println("7"); // 디버깅용 출력 제거
                recipeStepService.saveAllRecipeSteps(stepVOs);
                // System.out.println("8"); // 디버깅용 출력 제거

                List<RecipeIngredientVO> ingredientVOs = mapToRecipeIngredientVOs(recipeDTO.getRequiredIngredients(), generatedRecipeId, userIdLong); // ⭐ createdId 파라미터 타입 Long으로 변경
                for (RecipeIngredientVO ingredientVO : ingredientVOs) {
                    boolean isUserOwned = requestDTO.getSelectedIngredients().stream()
                            .anyMatch(si -> si.getIngredientName().equals(ingredientVO.getIngredientName()));
                    ingredientVO.setIsOwnedDefault(isUserOwned ? "Y" : "N");
                }
                // System.out.println("9"); // 디버깅용 출력 제거
                recipeIngredientService.saveAllRecipeIngredients(ingredientVOs);


                // 저장된 레시피 정보를 DTO에 업데이트
                // System.out.println("10"); // 디버깅용 출력 제거
                recipeDTO.setRecipeId(generatedRecipeId);
                // System.out.println("11"); // 디버깅용 출력 제거
                recipeDTO.setThumbnailUrl(thumbnailUrl);

                // 재료 매칭률 및 부족한 재료 개수 계산
                // System.out.println("12"); // 디버깅용 출력 제거
                List<RecipeIngredientResponseDTO> responseIngredients = calculateIngredientOwnership(
                        requestDTO.getSelectedIngredients(),
                        ingredientVOs
                );
                // System.out.println("13"); // 디버깅용 출력 제거
                recipeDTO.setRequiredIngredients(responseIngredients);
                // System.out.println("14"); // 디버깅용 출력 제거

                processedRecipes.add(recipeDTO);

            } catch (Exception e) {
                System.err.println("개별 레시피 저장 실패 (제목: " + recipeDTO.getTitle() + "): " + e.getMessage());
                e.printStackTrace();
            }
        }

        processedRecipes.sort(Comparator
                .<RecommendedRecipeDTO>comparingDouble(recipe -> {
                    double totalRecipeIngredients = recipe.getRequiredIngredients().size();
                    long matchingIngredients = recipe.getRequiredIngredients().stream()
                            .filter(RecipeIngredientResponseDTO::isOwned)
                            .count();
                    return totalRecipeIngredients > 0 ? (double) matchingIngredients / totalRecipeIngredients : 0.0;
                }).reversed()
                .thenComparingInt(recipe -> (int) recipe.getRequiredIngredients().stream()
                        .filter(ing -> !ing.isOwned())
                        .count())
                .thenComparing(recipe -> {
                    if (requestDTO.getFilterDifficultyCd() != null) {
                        if (requestDTO.getFilterDifficultyCd().equalsIgnoreCase(recipe.getDifficultyCd())) return 0;
                    }
                    if ("EASY".equalsIgnoreCase(recipe.getDifficultyCd())) return 1;
                    if ("NORMAL".equalsIgnoreCase(recipe.getDifficultyCd())) return 2;
                    if ("HARD".equalsIgnoreCase(recipe.getDifficultyCd())) return 3;
                    return 4;
                })
        );

        List<RecommendedRecipeDTO> finalRecommendedRecipes = processedRecipes.stream()
                .limit(3)
                .collect(Collectors.toList());

        logAiRecipeGeneration(requestDTO, prompt, aiResponseJson, finalRecommendedRecipes.size());

        return new RecipeRecommendationResponseDTO(finalRecommendedRecipes, "SUCCESS", "AI 레시피 추천이 완료되었습니다.");
    }

    /**
     * Gemini AI에 전송할 프롬프트를 생성합니다.
     * @param requestDTO 사용자 요청 DTO
     * @return Gemini AI 프롬프트 문자열
     */
    private String createGeminiPrompt(RecipeGenerationRequestDTO requestDTO) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("당신은 요리 전문가 AI 입니다. 사용자가 제공한 재료와 필터 조건에 맞춰 최적의 레시피 3개를 JSON 형식으로 생성해주세요.\n");
        promptBuilder.append("반드시 다음 JSON 형식에 맞춰 생성해야 합니다: [{\"title\":\"레시피1 제목\", \"summary\":\"간단 요약\", \"difficultyCd\":\"EASY\", \"cookTimeMin\":30, \"cuisineStyleCd\":\"KOR\", \"category\":\"rice_dish\", \"requiredIngredients\":[{\"ingredientName\":\"재료1\", \"quantityDesc\":\"수량\"}], \"cookingSteps\":[{\"stepNo\":1, \"stepDesc\":\"단계1 설명\"}]}, ...]\n");

        promptBuilder.append("\n[카테고리 규칙]\n");
        promptBuilder.append("각 레시피마다 'category' 필드를 포함해야 합니다.\n");
        promptBuilder.append("category는 아래 값 중 하나만 사용하세요: [\"rice_dish\",\"noodle\",\"soup_stew\",\"stir_fry\",\"grill_roast\",\"salad\",\"side_dish\",\"dessert_snack\"]\n");


        promptBuilder.append("\n사용자 선택 재료:\n");
        requestDTO.getSelectedIngredients().forEach(ing -> {
            promptBuilder.append("- ").append(ing.getIngredientName());
            if (ing.getUsageType() != null && !ing.getUsageType().isEmpty()) {
                promptBuilder.append(" (사용량: ").append(ing.getUsageType()).append(")");
            }
            if (ing.getAmountHint() != null && !ing.getAmountHint().isEmpty()) {
                promptBuilder.append(" (양 힌트: ").append(ing.getAmountHint()).append(")");
            }
            promptBuilder.append("\n");
        });

        promptBuilder.append("\n필터 조건:\n");
        promptBuilder.append("- 요리 스타일: ").append(requestDTO.getFilterCuisineCd()).append("\n");
        promptBuilder.append("- 난이도: ").append(requestDTO.getFilterDifficultyCd()).append("\n");
        promptBuilder.append("- 조리 시간: ").append(requestDTO.getFilterCookTimeCd()).append("\n");

        promptBuilder.append("\n생성 규칙:\n");
        promptBuilder.append("- 제공된 모든 재료를 최대한 활용해주세요.\n");
        promptBuilder.append("- 레시피 3개를 생성하고, JSON 배열 형태로 반환해주세요.\n");
        promptBuilder.append("- 각 레시피는 제목, 요약, 난이도, 조리시간(분 단위 숫자), 요리 스타일, 카테고리, 필요한 재료 목록, 조리 순서를 포함해야 합니다.\n");
        promptBuilder.append("- 필요한 재료 목록에는 재료명과 수량설명(예: 200g, 1개, 1/2컵)이 포함되어야 합니다.\n");
        promptBuilder.append("- 조리 순서에는 단계 번호, 단계 설명이 포함되어야 합니다.\n");
        promptBuilder.append("- 부족한 재료가 있더라도 사용자가 선택한 재료를 중심으로 맛있고 창의적인 레시피를 제안해주세요.\n");

        return promptBuilder.toString();
    }


    /**
     * Gemini AI의 JSON 응답을 RecommendedRecipeDTO 리스트로 파싱합니다.
     * @param aiResponseJson Gemini AI의 원본 JSON 응답
     * @param requestDTO 요청 DTO (기본값 설정용)
     * @return 파싱된 RecommendedRecipeDTO 리스트
     * @throws Exception JSON 파싱 중 오류 발생 시
     */
    private List<RecommendedRecipeDTO> parseGeminiRecipeResponse(String aiResponseJson, RecipeGenerationRequestDTO requestDTO) throws Exception {
        List<RecommendedRecipeDTO> recipes = objectMapper.readValue(aiResponseJson, new TypeReference<List<RecommendedRecipeDTO>>() {});

        for (RecommendedRecipeDTO recipe : recipes) {
            if (recipe.getCuisineStyleCd() == null || recipe.getCuisineStyleCd().isEmpty()) {
                recipe.setCuisineStyleCd(requestDTO.getFilterCuisineCd());
            }
            if (recipe.getDifficultyCd() == null || recipe.getDifficultyCd().isEmpty()) {
                recipe.setDifficultyCd(requestDTO.getFilterDifficultyCd());
            }
        }
        return recipes;
    }

    /**
     * RecommendedRecipeDTO를 RecipeVO로 매핑합니다.
     * @param dto RecommendedRecipeDTO 객체
     * @param userId 생성자 ID (Long 타입으로 직접 받음)
     * @return 매핑된 RecipeVO 객체
     */
    private RecipeVO mapToRecipeVO(RecommendedRecipeDTO dto, Long userId) { // ⭐ userId 파라미터 타입 Long
        RecipeVO vo = new RecipeVO();
        vo.setOwnerUserId(userId); // ⭐ Long 타입 그대로 사용
        vo.setSourceType("AI_GENERATED");
        vo.setTitle(dto.getTitle());
        vo.setSummary(dto.getSummary());
        vo.setThumbnailUrl(dto.getThumbnailUrl());
        vo.setDifficultyCd(dto.getDifficultyCd());
        vo.setCookTimeMin(dto.getCookTimeMin());
        vo.setCuisineStyleCd(dto.getCuisineStyleCd());
        vo.setCategory(dto.getCategory()); // ⭐ RecipeVO에서 category 필드 제거했으므로 이 라인 제거 필요
        vo.setIsPublic("N");
        vo.setIsDeleted("N");
        vo.setViewCnt(0);
        vo.setLikeCnt(0);
        vo.setReportCnt(0);
        vo.setCreatedId(userId); // ⭐ Long 타입 그대로 사용
        return vo;
    }

    /**
     * RecipeStepResponseDTO 리스트를 RecipeStepVO 리스트로 매핑합니다.
     * @param dtos RecipeStepResponseDTO 리스트
     * @param recipeId 연결할 레시피 ID
     * @param createdId 생성자 ID (Long 타입으로 직접 받음)
     * @return 매핑된 RecipeStepVO 리스트
     */
    private List<RecipeStepVO> mapToRecipeStepVOs(List<RecipeStepResponseDTO> dtos, Long recipeId, Long createdId) { // ⭐ createdId 파라미터 타입 Long
        return dtos.stream().map(dto -> {
            RecipeStepVO vo = new RecipeStepVO();
            vo.setRecipeId(recipeId);
            vo.setStepNo(dto.getStepNo());
            vo.setStepDesc(dto.getStepDesc());
            vo.setImageUrl(dto.getImageUrl());
            vo.setCreatedId(createdId); // ⭐ Long 타입 그대로 사용
            return vo;
        }).collect(Collectors.toList());
    }

    /**
     * RecipeIngredientResponseDTO 리스트를 RecipeIngredientVO 리스트로 매핑합니다.
     * @param dtos RecipeIngredientResponseDTO 리스트
     * @param recipeId 연결할 레시피 ID
     * @param createdId 생성자 ID (Long 타입으로 직접 받음)
     * @return 매핑된 RecipeIngredientVO 리스트
     */
    private List<RecipeIngredientVO> mapToRecipeIngredientVOs(List<RecipeIngredientResponseDTO> dtos, Long recipeId, Long createdId) { // ⭐ createdId 파라미터 타입 Long
        return dtos.stream().map(dto -> {
            RecipeIngredientVO vo = new RecipeIngredientVO();
            vo.setRecipeId(recipeId);
            vo.setIngredientName(dto.getIngredientName());
            vo.setQuantityDesc(dto.getQuantityDesc());
            vo.setIsOwnedDefault("N");
            vo.setCreatedId(createdId); // ⭐ Long 타입 그대로 사용
            return vo;
        }).collect(Collectors.toList());
    }


    /**
     * DB에 저장된 카테고리별 이미지 중 적절한 이미지를 선택하여 URL을 반환합니다.
     * @param cuisineStyleCd 요리 스타일 코드
     * @param recipeTitle 레시피 제목 (검색 키워드로 활용될 수 있음)
     * @return 이미지 URL
     */
    private String getCategoryImage(String cuisineStyleCd, String recipeTitle) {
        // TODO: 실제 DB에서 카테고리별 이미지 조회 로직 구현 필요
        switch (cuisineStyleCd) {
            case "KOR": return "https://moc.cucook.com/images/korean_dish_default.jpg";
            case "CHN": return "https://moc.cucook.com/images/chinese_dish_default.jpg";
            case "JPN": return "https://moc.cucook.com/images/japanese_dish_default.jpg";
            case "WES": return "https://moc.cucook.com/images/western_dish_default.jpg";
            default: return "https://moc.cucook.com/images/default_dish.jpg";
        }
    }

    /**
     * 사용자가 선택한 재료와 레시피에 필요한 재료를 비교하여 보유 여부를 계산하고,
     * RecipeIngredientResponseDTO 리스트로 반환합니다.
     * @param userSelectedIngredients 사용자 선택 재료 DTO 리스트
     * @param recipeRequiredIngredientVOs 레시피에 필요한 재료 VO 리스트 (DB에 저장될 재료 목록)
     * @return 보유 여부가 계산된 RecipeIngredientResponseDTO 리스트
     */
    private List<RecipeIngredientResponseDTO> calculateIngredientOwnership(
            List<SelectedIngredientRequestDTO> userSelectedIngredients,
            List<RecipeIngredientVO> recipeRequiredIngredientVOs) {

        Map<String, SelectedIngredientRequestDTO> userIngredientMap = userSelectedIngredients.stream()
                .collect(Collectors.toMap(
                        SelectedIngredientRequestDTO::getIngredientName,
                        ing -> ing,
                        (existing, replacement) -> existing
                ));

        return recipeRequiredIngredientVOs.stream().map(vo -> {
            RecipeIngredientResponseDTO dto = new RecipeIngredientResponseDTO();
            dto.setIngredientName(vo.getIngredientName());
            dto.setQuantityDesc(vo.getQuantityDesc());
            dto.setOwned(userIngredientMap.containsKey(vo.getIngredientName()));
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * AI 레시피 생성 로그를 저장합니다.
     * @param requestDTO AI 요청 DTO
     * @param prompt Gemini AI에 보낸 프롬프트
     * @param aiResponse Gemini AI로부터 받은 응답
     * @param resultCount 생성된 레시피 수
     */
    private void logAiRecipeGeneration(RecipeGenerationRequestDTO requestDTO, String prompt, String aiResponse, int resultCount) {
        AiRecipeLogVO logVO = new AiRecipeLogVO();

        // requestDTO.getUserId()는 String, logVO.userId는 Long이므로 변환
        logVO.setUserId(requestDTO.getUserId() != null && !requestDTO.getUserId().isEmpty() ? Long.valueOf(requestDTO.getUserId()) : null);

        // requestDTO.getCameraSessionId()는 String, logVO.cameraSessionId는 Long이므로 변환
        logVO.setBaseSourceCd(requestDTO.getCameraSessionId() != null && !requestDTO.getCameraSessionId().isEmpty() ? "CAMERA" : "MANUAL");

        if (requestDTO.getCameraSessionId() != null && !requestDTO.getCameraSessionId().isEmpty()) {
            logVO.setCameraSessionId(Long.valueOf(requestDTO.getCameraSessionId()));
        } else {
            logVO.setCameraSessionId(null);
        }

        logVO.setManualIngredients(requestDTO.getSelectedIngredients().stream()
                .map(SelectedIngredientRequestDTO::getIngredientName)
                .collect(Collectors.joining(",")));
        logVO.setFilterCuisineCd(requestDTO.getFilterCuisineCd());
        logVO.setFilterDiffCd(requestDTO.getFilterDifficultyCd());
        logVO.setFilterTimeCd(requestDTO.getFilterCookTimeCd());
        logVO.setGovApiRaw("N/A_NO_GOV_API");
        logVO.setAiRequest(prompt);
        logVO.setAiResponse(aiResponse);
        logVO.setResultCnt(resultCount);

        // requestDTO.getUserId()는 String, logVO.createdId는 Long이므로 변환
        logVO.setCreatedId(requestDTO.getUserId() != null && !requestDTO.getUserId().isEmpty() ? Long.valueOf(requestDTO.getUserId()) : null);

        aiRecipeLogService.saveAiRecipeLog(logVO);
    }

    /**
     * 특정 레시피의 공개(`is_public`) 상태를 업데이트(토글)합니다.
     * 사용자가 자신의 레시피를 '공유'하거나 '공유 취소'하는 것으로 간주합니다.
     *
     * @param recipeId 상태를 업데이트할 레시피의 ID
     * @param userId 해당 레시피의 소유자 ID (권한 확인용)
     * @param shareStatus 공유 여부 (true: 공개, false: 비공개)
     * @return 업데이트 성공 여부 (true/false)
     * @throws IllegalArgumentException 레시피를 찾을 수 없거나 권한이 없을 경우
     */
    @Override
    @Transactional // 데이터 변경 작업이므로 트랜잭션 적용
    public boolean toggleRecipeShareStatus(Long recipeId, Long userId, boolean shareStatus) {
        // 1. 레시피 존재 여부 확인
        RecipeVO recipe = recipeDAO.selectRecipeById(recipeId);
        if (recipe == null) {
            throw new IllegalArgumentException("레시피 (ID: " + recipeId + ")를 찾을 수 없습니다.");
        }

        // 2. 권한 검사: 레시피 소유자만 공유 상태를 변경할 수 있음
        //    userId는 Long 타입, recipe.getOwnerUserId()도 Long 타입이므로 equals 사용
        if (!recipe.getOwnerUserId().equals(userId)) {
            throw new IllegalArgumentException("이 레시피 (ID: " + recipeId + ")의 공유 상태를 변경할 권한이 없습니다.");
        }

        // 3. is_public 상태를 'Y' 또는 'N'으로 변환
        String isPublicFlag = shareStatus ? "Y" : "N";

        // 4. 현재 상태와 요청 상태가 다를 경우에만 DB 업데이트 수행
        //    equalsIgnoreCase를 사용하여 "Y" / "y" 모두 처리
        if (!recipe.getIsPublic().equalsIgnoreCase(isPublicFlag)) {
            int updatedCount = recipeDAO.updateRecipeIsPublic(recipeId, userId, isPublicFlag); // DAO 호출
            return updatedCount > 0; // 업데이트 성공 여부 반환
        }
        // 현재 상태와 요청 상태가 이미 일치하면 DB 업데이트할 필요 없음 (성공으로 간주)
        return true;
    }

    /**
     * 특정 사용자가 '공유'(공개)한 모든 레시피 목록을 조회합니다.
     * 마이페이지 '공유한 게시글' 탭의 목록 표시용입니다.
     *
     * @param userId 공유한 레시피 목록을 조회할 사용자의 ID
     * @return 해당 사용자가 공유한 레시피 목록과 총 개수를 담은 응답 DTO
     */
    @Override
    @Transactional(readOnly = true)
    public RecipeListResponseDTO getSharedRecipesByUserId(Long userId) {
        // 1. DAO를 통해 공유된 레시피 VO 리스트 조회
        List<RecipeVO> sharedRecipeVOs = recipeDAO.selectSharedRecipesByUserId(userId);

        // 2. VO 리스트 -> RecipeResponseDTO 리스트 변환 (편의 메서드 활용)
        List<RecipeResponseDTO> dtoList = sharedRecipeVOs.stream()
                .map(RecipeResponseDTO::from) // RecipeResponseDTO.from() 사용
                .collect(Collectors.toList());

        // 3. DTO 리스트와 총 개수를 담아 반환
        return new RecipeListResponseDTO(dtoList, dtoList.size()); // ⭐ 이 라인이 문제 없음
    }
    /**
     * 특정 사용자가 '공유'(공개)한 레시피의 총 개수를 조회합니다.
     * 마이페이지 '공유한 게시글' 카드에 표시용입니다.
     * `RecipeService` 인터페이스의 `countSharedRecipesByUserId` 메서드를 구현합니다.
     *
     * @param userId 개수를 조회할 사용자의 ID
     * @return 공유된 레시피의 총 개수
     */
    @Override // ⭐ 인터페이스 구현 명시
    @Transactional(readOnly = true) // 데이터 조회 작업이므로 읽기 전용 트랜잭션 적용
    public int countSharedRecipesByUserId(Long userId) {
        return recipeDAO.countSharedRecipesByUserId(userId);
    }
}
