package com.cucook.moc.recipe.service;

import com.cucook.moc.gemini.GeminiApiUtils;
import com.cucook.moc.recipe.vo.FoodSafetyResponse; // 💡 FoodSafety DTO 임포트
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RecipeService {

    @Autowired
    private GeminiApiUtils geminiApiUtils;

    // 💡 FoodSafetyService 주입
    @Autowired
    private FoodSafetyService foodSafetyService;

    // 최종 결과 JSON 객체 (레시피 텍스트 + 이미지 URL) 반환
    // 💡 메서드 인자를 워크플로우에 맞게 변경 (재료 목록을 받도록)
    public String generateAndFormatRecipe(List<String> recognizedIngredients) {

        // 1. [1-2단계] GeminiApiUtils로 인식된 재료 목록이 이미 있다고 가정
        //    (현재는 인자로 List<String> recognizedIngredients를 받는 것으로 가정합니다.)

        // 2. [3단계] FoodSafety API 조회 (재료를 기반으로 레시피 존재 여부 확인)
        String searchKeyword = recognizedIngredients.get(0); // 단순화를 위해 첫 번째 재료로 검색

        List<FoodSafetyResponse.RecipeVO> allApiRecipes = foodSafetyService.findRecipesByIngredient(searchKeyword);

        List<FoodSafetyResponse.RecipeVO> top3Recipes = allApiRecipes.stream()
                .limit(3)
                .collect(Collectors.toList());

        // 3. [4단계] 프롬프트 구성 및 Gemini 호출
        String fullPrompt = buildGeminiPrompt(recognizedIngredients, top3Recipes);
        String recipeJsonText = geminiApiUtils.generateRecipeJson(fullPrompt);

        // 4. [5단계] 이미지 생성
        // ... (recipeJsonText를 파싱하여 레시피 이름 추출 로직 필요) ...
        String recipeName = "임시 레시피 이름";

        Optional<String> imageUrl = geminiApiUtils.generateRecipeImage(recipeName);

        // 5. 최종 응답 JSON 구성
        return "{\"recipeJson\": " + recipeJsonText + ", \"imageUrl\": \"" + imageUrl.orElse("") + "\"}";
    }

    /**
     * FoodSafety API 조회 결과에 따라 Gemini에게 전달할 프롬프트를 구성합니다.
     */
    private String buildGeminiPrompt(List<String> recognizedIngredients,
                                     List<FoodSafetyResponse.RecipeVO> apiRecipes) {

        StringBuilder promptBuilder = new StringBuilder();

        if (!apiRecipes.isEmpty()) {
            // FoodSafety DB에 레시피가 존재하는 경우: 해당 레시피 정보를 기반으로 응답하도록 유도
            promptBuilder.append("다음은 한국 식품 안전처 API에서 조회한 관련 레시피 정보입니다. 이 정보를 활용하여 사용자가 인식한 재료 (");
            promptBuilder.append(String.join(", ", recognizedIngredients));
            promptBuilder.append(")를 활용하는 레시피를 JSON 형식으로 제공해 주세요.\n\n");

            // 💡 주의: apiRecipes 객체를 JSON/XML 문자열로 변환하여 프롬프트에 삽입해야 합니다.
            // (여기서는 임시로 toString()을 사용하거나, 별도의 유틸리티로 JSON 변환이 필요합니다.)
            promptBuilder.append("--- API 레시피 데이터 ---\n");
            promptBuilder.append(apiRecipes.toString());
            promptBuilder.append("\n------------------------\n");

        } else {
            // FoodSafety DB에 레시피가 없는 경우: 창의적인 레시피 생성 유도
            promptBuilder.append("사용자가 인식한 재료 (");
            promptBuilder.append(String.join(", ", recognizedIngredients));
            promptBuilder.append(")만 사용하여 새로운 창의적인 레시피를 JSON 형식으로 생성해 주세요. 외부 데이터베이스에 일치하는 레시피가 없었습니다.");
        }

        return promptBuilder.toString();
    }
}