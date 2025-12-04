package com.cucook.moc.recipe.vo;

import lombok.Data;

@Data
public class RecipeVO {

    private long recipeId;
    private long ownerUserId;
    private String sourceType;
    private String externalRefId;
    private String title;
    private String summary;
    private String thumbnailUrl;
    private String difficultyCd;
    private Integer cookTimeMin;
    private String cuisineStyleCd;
    private boolean isPublic;
    private boolean isDeleted;
    private int viewCnt;
    private int likeCnt;
    private int reportCnt;
    private long createdId;
}