package com.cucook.moc.recipe.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeSaveRequestDTO {

    private String title;
    private String summary;

    private String difficultyCd;
    private Integer cookTimeMin;
    private String cuisineStyleCd;
    private String category;

    private boolean share; // 🔥 게시글 공개 여부

    private List<RecipeIngredientSaveDTO> ingredients;
    private List<RecipeStepSaveDTO> steps;
}
