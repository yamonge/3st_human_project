package com.cucook.moc.recipe.dto.request;

import lombok.Data;

@Data
public class IngredientInputDto {
    private String name; // 재료명
    private String usagePreference; // 사용량 선호도 (예: "ALL", "SOME")
    private String quantityPreference; // 양 선호도 (예: "LITTLE", "MEDIUM", "LOT")
}
