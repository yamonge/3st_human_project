package com.cucook.moc.recipe.vo;

import lombok.Data;

@Data
public class AiRecipeLogVO {

    private long aiRecipeLogId;
    private long userId;
    private String baseSourceCd;
    private String cameraSessionId;
    private String manualIngredients;
    private String filterCuisineCd;
    private String filterDiffCd;
    private String filterTimeCd;
    private String govApiRaw;
    private String aiRequest;
    private String aiResponse;
    private int resultCnt;
    private long createdId;
}