package com.cucook.moc.recipe.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class GeminiApiUtils {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=%s";

    /**
     * ============================================
     *  1) 레시피 생성 API (TEXT ONLY)
     * ============================================
     */
    public String callGeminiApi(String prompt) throws Exception {

        String url = String.format(GEMINI_API_URL, apiKey);

        // 요청 Body 구성
        Map<String, Object> textPart = Map.of(
                "text", prompt
        );

        Map<String, Object> content = Map.of(
                "parts", List.of(textPart)
        );

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(content),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "temperature", 0.7
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response =
                restTemplate.postForEntity(url, request, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Gemini API 호출 실패: " + response.getBody());
        }

        // Gemini 응답 파싱
        JsonNode root = objectMapper.readTree(response.getBody());

        return root
                .path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();
    }

    /**
     * ============================================
     *  2) 영수증 OCR (Vision + Image)
     * ============================================
     */
    public String callGeminiVisionApiForReceipt(byte[] imageBytes, String mimeType) throws Exception {

        String url = String.format(GEMINI_API_URL, apiKey);

        Map<String, Object> imagePart = Map.of(
                "inlineData", Map.of(
                        "mimeType", mimeType,
                        "data", java.util.Base64.getEncoder().encodeToString(imageBytes)
                )
        );

        Map<String, Object> textPart = Map.of(
                "text", RECEIPT_OCR_SYSTEM_PROMPT
        );

        Map<String, Object> content = Map.of(
                "parts", List.of(imagePart, textPart)
        );

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(content),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json"
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response =
                restTemplate.postForEntity(url, request, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Gemini Vision API 호출 실패: " + response.getBody());
        }

        JsonNode root = objectMapper.readTree(response.getBody());

        return root
                .path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();
    }

    /**
     * ============================================
     *  OCR 프롬프트
     * ============================================
     */
    private static final String RECEIPT_OCR_SYSTEM_PROMPT =
            """
            당신은 재료명 추출 전문가입니다. 아래 규칙을 엄격히 따르세요.
            
            사진을 보고 먼저 텍스트를 내부적으로 1차 추출한후 아래 규칙에맞게 2차 가공합니다. 
            
            규칙:
            1. 재료 이름만 추출 (예: 양파, 돼지고기, 우유)
            2. 숫자 절대 포함 금지
            3. 괄호 절대 포함 금지
            4. 단위 절대 포함 금지 (g, kg, ml, 개 등)
            
            입력: "양파 500g(1봉지)"
            출력: "양파"
            
            입력: "돼지고기 목살 1kg"
            출력: "돼지고기"
            
            반드시 재료 이름만 반환하세요.
            출력 형식: {"ingredients": "양파, 대파, 돼지고기"}
            """;
}
