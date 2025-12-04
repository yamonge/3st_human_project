package com.cucook.moc.recipe.dto.response;

import lombok.Data;

@Data
public class IngredientStatusDto {
    private String name;    // 재료명
    private String quantity; // 필요한 양 (예: "200g", "1개")
    private boolean isOwned; // 사용자가 보유한 재료인지 여부 (true: 보유, false: 부족)
    // String unit; // 단위가 필요하다면 추가
}
