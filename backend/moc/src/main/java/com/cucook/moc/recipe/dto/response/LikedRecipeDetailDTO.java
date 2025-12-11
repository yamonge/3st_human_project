package com.cucook.moc.recipe.dto.response; // ⭐ recipe 패키지

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LikedRecipeDetailDTO {
    private Long recipeId;
    private String title;
    private String summary;
    private String thumbnailUrl;
    private String difficultyCd;
    private Integer cookTimeMin;
    private String cuisineStyleCd;
    // private String category;
    private Integer viewCnt;
    private Integer likeCnt;
    // private Long ownerUserId;
}