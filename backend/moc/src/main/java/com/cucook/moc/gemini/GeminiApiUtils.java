package com.cucook.moc.gemini;

import com.google.genai.Client;
import com.google.genai.types.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
public class GeminiApiUtils {

    private final Client client;

    public GeminiApiUtils(@Value("${gemini.api.key}") String apiKey) {
        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    private static final String SYSTEM_INSTRUCTION_GENERAL_CHEF_AI = """
            당신은 세계 최고의 요리 전문가 AI입니다. 사용자의 요청에 정확하고 친절하게 응답해주세요.
            """;

    /**
     * Gemini AI에게 레시피 생성을 요청하고 JSON 형식의 응답을 받습니다.
     * RecipeServiceImpl에서 이 메서드를 `callGeminiApi` 이름으로 호출하므로,
     * 메서드명을 통일시킵니다.
     *
     * @param fullPrompt 재료 목록 + 필터 조건 및 상세 JSON 형식 규칙이 포함된 최종 프롬프트
     * @return JSON 형식의 레시피 텍스트
     * @throws Exception Gemini API 호출 또는 응답 처리 중 발생할 수 있는 예외
     */
    public String callGeminiApi(String fullPrompt) throws Exception {
        try {
            Part systemPart = Part.builder().text(SYSTEM_INSTRUCTION_GENERAL_CHEF_AI).build();
            Content systemContent = Content.builder().parts(List.of(systemPart)).build();

            // JSON 응답을 명시적으로 요청
            GenerateContentConfig params = GenerateContentConfig.builder()
                    .systemInstruction(systemContent)
                    .responseMimeType("application/json")
                    .build();

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-2.5-flash",
                            fullPrompt,         // RecipeServiceImpl에서 완전하게 구성된 프롬프트 전달
                            params);

            // Gemini API 응답에서 텍스트 부분을 가져옵니다.
            return response.text();

        } catch (Exception e) {
            // API 호출 중 발생한 예외를 ServiceImpl에서 처리할 수 있도록 다시 던집니다.
            throw new Exception("Gemini API 호출 중 오류 발생: " + e.getMessage(), e);
        }
    }

    /**
     * 레시피 이미지 생성은 워크플로우에서 DB에서 카테고리별로 가져오는 방식으로 변경되었습니다.
     * 이 메서드는 현재 사용되지 않으며, 빈 Optional을 반환합니다.
     *
     * @param recipeName 레시피 이름 (사용되지 않음)
     * @return 항상 빈 Optional<String>
     */
    public Optional<String> generateRecipeImage(String recipeName) {
        return Optional.empty(); // 더 이상 이미지 API 호출을 하지 않음
    }
}