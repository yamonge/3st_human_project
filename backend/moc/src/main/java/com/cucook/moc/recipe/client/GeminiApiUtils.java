package com.cucook.moc.recipe.client;

import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.Blob;
import com.google.cloud.vertexai.api.Content;
import com.google.cloud.vertexai.api.GenerationConfig;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.api.Part;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.protobuf.ByteString;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class GeminiApiUtils {

    @Value("${vertexai.project-id}")
    private String projectId;

    @Value("${vertexai.location}")
    private String location;

    public GeminiApiUtils(@Value("${gemini.api.key}") String apiKey) {
    }

    /**
     * ============================================
     *  레시피 추천 프롬프트
     * ============================================
     */
    private static final String RECIPE_SYSTEM_PROMPT =
            """
            당신은 세계 최고의 요리 전문가 AI입니다.
            당신의 목표는 아래 재료 목록과 사용자가 선택한 조건(카테고리, 난이도, 조리시간)을 기반으로 
            정확하고 먹기 좋은 레시피를 JSON 형식으로 제공하는 것입니다.

            출력 규칙 (절대 어기지 마세요)
            - 반드시 "application/json" 형식으로만 출력하세요.
            - JSON 이외의 설명, 말머리, 문장 금지.
            - 레시피는 반드시 3개 생성.
            - 모든 필드는 null 없이 반드시 값 채울 것.

            JSON 스키마
            {
              "recipes": [
                {
                  "title": "레시피 이름",
                  "category": "한식 | 중식 | 양식 | 일식 | 기타",
                  "difficulty": "쉬움 | 보통 | 어려움",
                  "time": "10분 | 20분 | 30분 | ...",
                  "ingredients": ["재료1", "재료2", ...],
                  "steps": ["1단계 설명", "2단계 설명", ...],
                  "tip": "추가 팁 또는 주의사항"
                }
              ]
            }

            입력 정보:
            - 사용 가능한 재료 목록: {{INGREDIENT_LIST}}
            - 사용자 선택 카테고리: {{CATEGORY}}
            - 난이도: {{DIFFICULTY}}
            - 조리 시간: {{COOKING_TIME}}

            위 조건을 바탕으로 가장 맛있고 실제로 만들 수 있는 레시피 3개를 만들어 주세요.
            """;

    /**
     * ============================================
     *  영수증 OCR 프롬프트 (최고 정확도 버전)
     * ============================================
     */
    private static final String RECEIPT_OCR_SYSTEM_PROMPT =
            """
            당신은 영수증 이미지 전문 분석 AI입니다.
            당신의 역할은 영수증 이미지에서 "식재료 이름"만 정확히 추출하여 JSON으로 반환하는 것입니다.

            중요한 규칙:
            - 반드시 "application/json" 형식으로만 출력하세요.
            - 출력 외에 설명, 문장, 말머리 절대 금지.

            JSON 스키마
            {
              "ingredients": "재료1, 재료2, 재료3"
            }

            추출 규칙:
            - 브랜드명 제거 (예: CJ, 오뚜기, 해태 등)
            - 단위 제거 (g, kg, ml, L, 봉지, 개, 박스 등)
            - 수량 제거 (1개, 2봉, 3팩 등)
            - 가격 제거 (₩, 원, 할인, 합계 등)
            - 숫자 제거 (0~9)
            - 비식재료 제거 (일회용품, 봉투, 포인트 등)
            - 중복 제거 및 정제
            - 오타 보정 적용

            최종 출력:
            - "ingredients" 값에 식재료명만 콤마로 구분하여 넣으세요.
            - 예: {"ingredients": "양파, 대파, 돼지고기, 고추장"}

            이제 이미지를 분석하고 위 JSON 형태로 결과만 제공하세요.
            """;

    /**
     * ============================================
     *  1) 레시피 생성 API
     * ============================================
     */
    public String callGeminiApi(String prompt) throws Exception {
        try (VertexAI vertexAI = new VertexAI(projectId, location)) {

            GenerationConfig config = GenerationConfig.newBuilder()
                    .setResponseMimeType("application/json")
                    .build();

            GenerativeModel model = new GenerativeModel("gemini-2.5-flash", vertexAI)
                    .withGenerationConfig(config);

            // 완성된 시스템 프롬프트 + 사용자 프롬프트 조합
            String finalPrompt = RECIPE_SYSTEM_PROMPT + "\n" + prompt;

            Content content = Content.newBuilder()
                    .addParts(Part.newBuilder().setText(finalPrompt).build())
                    .build();

            GenerateContentResponse response = model.generateContent(content);

            return response.getCandidates(0).getContent().getParts(0).getText();
        }
    }

    /**
     * ============================================
     *  2) 영수증 OCR Vision API
     * ============================================
     */
    public String callGeminiVisionApiForReceipt(byte[] imageBytes, String mimeType) throws Exception {
        try (VertexAI vertexAI = new VertexAI(projectId, location)) {

            GenerationConfig config = GenerationConfig.newBuilder()
                    .setResponseMimeType("application/json")
                    .build();

            GenerativeModel model = new GenerativeModel("gemini-2.5-flash", vertexAI)
                    .withGenerationConfig(config);

            Blob imageBlob = Blob.newBuilder()
                    .setData(ByteString.copyFrom(imageBytes))
                    .setMimeType(mimeType)
                    .build();

            Part imagePart = Part.newBuilder()
                    .setInlineData(imageBlob)
                    .build();

            Content content = Content.newBuilder()
                    .addParts(imagePart)
                    .addParts(Part.newBuilder().setText(RECEIPT_OCR_SYSTEM_PROMPT).build())
                    .build();

            GenerateContentResponse response = model.generateContent(content);

            return response.getCandidates(0).getContent().getParts(0).getText();
        }
    }
}
