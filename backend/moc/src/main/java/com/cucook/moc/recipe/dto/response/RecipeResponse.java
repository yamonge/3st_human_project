package com.cucook.moc.recipe.dto.response;

import lombok.Builder; // 💡 Lombok Builder 임포트
import lombok.Getter;

@Getter
@Builder // 💡 이 어노테이션이 있어야 .builder() 메서드가 생성됩니다.
public class RecipeResponse {
    private String recipeJson; // Gemini가 생성한 JSON 텍스트
    private String imageUrl;   // Gemini가 생성한 이미지 URL
}