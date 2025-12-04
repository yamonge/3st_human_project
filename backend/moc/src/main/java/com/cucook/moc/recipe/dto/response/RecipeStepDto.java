package com.cucook.moc.recipe.dto.response;

import lombok.Data;

@Data
public class RecipeStepDto {
    private int stepNo;     // 단계 번호
    private String stepDesc; // 단계 설명
    private String imageUrl; // 단계별 이미지 URL
}
