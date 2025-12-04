package com.cucook.moc.recipe.service;

import com.cucook.moc.recipe.dto.response.FoodSafetyResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;

@Service
public class FoodSafetyService {

    @Value("${foodsafety.api.key}")
    private String apiKey;

    private final WebClient webClient;
    private final String BASE_PATH = "/api/{keyId}/COOKRCP01/json";

    public FoodSafetyService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://openapi.foodsafetykorea.go.kr").build();
    }

    /**
     * FoodSafety API에서 특정 재료나 메뉴명으로 레시피를 조회하고 Java 객체로 반환합니다.
     *
     * @param keyword 검색어 (메뉴명 또는 재료명으로 사용)
     * @param searchType 검색할 필드 (예: RCP_NM, RCP_PARTS_DTLS)
     * @param startIdx 시작 인덱스
     * @param endIdx 종료 인덱스
     * @return FoodSafety API 응답 객체 (DTO)
     */
    public FoodSafetyResponse searchRecipes(String keyword, String searchType, int startIdx, int endIdx) {

        // 1. Path Variable 설정 (키, 서비스, 파일타입, 시작/종료 인덱스)
        // 2. 🚨 추가 검색 파라미터를 Path에 직접 추가: URI 구성 시 템플릿 변수가 아닌, 인코딩된 문자열로 Path에 포함
        String pathWithParams = String.format("/%s/%s/%s/%d/%d/%s=%s",
                apiKey,
                "COOKRCP01", // serviceId 고정
                "json",      // dataType 고정
                startIdx,
                endIdx,
                searchType,
                keyword);

        // 2. WebClient 호출
        // BASE_PATH + /{startIdx}/{endIdx} + {pathWithParams}

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api" + pathWithParams)
                        .build(true)) // true를 넣어 인코딩된 경로를 그대로 사용하도록 유도
                .retrieve()
                .bodyToMono(FoodSafetyResponse.class)
                .block();
    }

    /**
     * Gemini가 인식한 재료를 바탕으로 레시피 목록을 검색하는 편리한 메소드
     */
    public List<FoodSafetyResponse.RecipeVO> findRecipesByIngredient(String ingredient) {

        // API 정책에 따라 검색 범위는 적절히 조정
        int searchStart = 1;
        int searchEnd = 20; // 20개까지만 검색하여 존재 여부 확인 및 정보 획득

        FoodSafetyResponse response = searchRecipes(ingredient, "RCP_PARTS_DTLS", searchStart, searchEnd);

        // 응답 검증 및 데이터 추출
        if (response != null &&
                response.getCOOKRCP01() != null &&
                response.getCOOKRCP01().getRow() != null &&
                "INFO-000".equals(response.getCOOKRCP01().getResult().getCODE())) {
            // 'INFO-000'은 성공 응답 코드로 가정하고 확인 필요
            return response.getCOOKRCP01().getRow();
        }

        return List.of(); // 레시피가 없거나 오류 발생 시 빈 리스트 반환
    }
}