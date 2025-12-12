package com.cucook.moc.receipt.service.impl;

import com.cucook.moc.recipe.client.GeminiApiUtils;
import com.cucook.moc.user.service.UserIngredientService;
import com.cucook.moc.receipt.service.ReceiptRecognitionService;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReceiptRecognitionServiceImpl implements ReceiptRecognitionService {

    private final GeminiApiUtils geminiApiUtils;
    private final UserIngredientService userIngredientService;
    private final ObjectMapper objectMapper;

    @Autowired
    public ReceiptRecognitionServiceImpl(GeminiApiUtils geminiApiUtils,
                                         UserIngredientService userIngredientService,
                                         ObjectMapper objectMapper) {
        this.geminiApiUtils = geminiApiUtils;
        this.userIngredientService = userIngredientService;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public List<String> processReceiptImageAndAddIngredients(byte[] imageBytes, String mimeType, Long userId) throws Exception {

        // 🔹 1) Gemini Vision API 호출
        String aiText = geminiApiUtils.callGeminiVisionApiForReceipt(imageBytes, mimeType);
        if (aiText == null || aiText.isBlank()) {
            throw new IllegalArgumentException("AI가 빈 응답을 반환했습니다.");
        }

        List<String> ingredientNames = extractIngredientNames(aiText);

        if (ingredientNames.isEmpty()) {
            throw new IllegalArgumentException("영수증 이미지에서 재료를 인식하지 못했습니다.");
        }

        // 🔹 3) DB 저장
        userIngredientService.addIngredientsFromRecognizedReceipt(
                userId,
                ingredientNames,
                userId
        );

        return ingredientNames;
    }

    /**
     * 🔍 Gemini Vision 응답에서 재료명 뽑아내기
     * Gemini가 JSON 또는 단순 텍스트 둘 다 줄 수 있으므로 합리적으로 파싱
     */
    private List<String> extractIngredientNames(String aiText) {

        // ▼ 1) JSON 형태로 왔을 가능성 체크 {"ingredients": "당근, 양파"}
        try {
            if (aiText.trim().startsWith("{")) {
                JsonNode node = objectMapper.readTree(aiText);
                if (node.has("ingredients")) {
                    String value = node.get("ingredients").asText();
                    return splitIngredients(value);
                }
            }
        } catch (Exception ignore) {
            // JSON이 아니면 무시하고 텍스트 파싱으로 넘어감
        }

        // ▼ 2) 텍스트 파싱 (예: "당근, 양파, 계란")
        return splitIngredients(aiText);
    }

    /**
     * "당근, 양파, 계란" → ["당근", "양파", "계란"]
     */
    private List<String> splitIngredients(String text) {
        return Arrays.stream(text.split("[,\\n]"))  // 콤마, 줄바꿈 모두 허용
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .collect(Collectors.toList());
    }
}
