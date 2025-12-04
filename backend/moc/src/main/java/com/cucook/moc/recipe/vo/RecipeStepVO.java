package com.cucook.moc.recipe.vo;

import lombok.Data;

@Data
public class RecipeStepVO {

    private long recipeStepId;
    private long recipeId;
    private int stepNo;
    private String stepDesc;
    private String imageUrl;
    private long createdId;
}