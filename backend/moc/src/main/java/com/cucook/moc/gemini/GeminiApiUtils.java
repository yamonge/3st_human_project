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
                .apiKey(apiKey) // API 키를 직접 전달
                .build();
    }

    private static final String SYSTEM_INSTRUCTION_RECIPE = """
            당신은 세계 최고의 요리 분석 AI입니다.
            사용자가 제공한 재료 목록(ingredients)과 필터(filters)를 분석하여, 
            해당 조건을 만족하는 레시피 1개를 JSON 형식으로만 생성해 주세요.
            
            [JSON 형식 규칙]
            - 반드시 이 구조를 지키세요. 다른 설명이나 텍스트는 포함하지 마세요.
            - 'recipeName', 'difficulty', 'cookTimeMinutes', 'ingredients', 'steps' 필드를 포함해야 합니다.
            - 'ingredients'와 'steps'는 배열(Array) 형태입니다.
            - 난이도는 "쉬움", "보통", "어려움" 중 하나를 사용하세요.
            - 조리시간은 'cookTimeMinutes'에 분(minute) 단위 정수만 넣어주세요.
            
            JSON 예시:
            {
              "recipeName": "김치볶음밥",
              "difficulty": "쉬움",
              "cookTimeMinutes": 15,
              "ingredients": ["김치 200g", "밥 1공기", "계란 1개"],
              "steps": ["김치를 볶습니다.", "밥과 양념을 넣고 섞습니다.", "계란 후라이를 올려 완성합니다."]
            }
            """;

    /**
     * [4단계] Gemini AI에게 JSON 형식의 레시피 텍스트를 생성 요청
     *
     * @param fullPrompt 재료 목록 + 필터 조건이 결합된 최종 프롬프트
     * @return JSON 형식의 레시피 텍스트
     */
    public String generateRecipeJson(String fullPrompt) {

        try {
            Part systemPart = Part.builder().text(SYSTEM_INSTRUCTION_RECIPE).build();
            Content systemContent = Content.builder().parts(List.of(systemPart)).build();

            // 1. 시스템 인스트럭션을 Content 객체로 전달 및 JSON Mode 설정
            GenerateContentConfig params = GenerateContentConfig.builder()
                    .systemInstruction(systemContent) // Content 객체 전달
                    .responseMimeType("application/json") // JSON Mode 활성화
                    .build();

            // 2. finalPrompt는 순수하게 사용자 입력 데이터만 포함
            String finalPrompt = "[입력된 데이터]\n" + fullPrompt;

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-2.5-flash",
                            finalPrompt,
                            params);

            return response.text();

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"레시피 생성 중 오류 발생: " + e.getMessage() + "\"}";
        }
    }

    public Optional<String> generateRecipeImage(String recipeName) {
        return null;
    }
}