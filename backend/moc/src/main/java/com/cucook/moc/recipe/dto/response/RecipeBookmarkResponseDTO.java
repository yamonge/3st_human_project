package com.cucook.moc.recipe.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.sql.Timestamp;
import java.time.LocalDateTime; // UI 표시용
import java.time.format.DateTimeFormatter; // 날짜 포맷팅용

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeBookmarkResponseDTO {
    private Long bookmarkId;      // 북마크 ID (tb_recipe_bookmark.recipe_bookmark_id)
    private Long userId;          // 사용자 ID (tb_recipe_bookmark.user_id)
    private Long recipeId;        // 레시피 ID (tb_recipe_bookmark.recipe_id)
    private Timestamp createdDate; // ⭐ DDL의 created_date, VO의 createdDate와 매핑. (DB에서 저장된 일시)
    private String savedDateFormatted; // ⭐ UI 표시용: "YYYY-MM-DD HH:mm:ss" 포맷

    private BookmarkedRecipeDetailDTO recipe;

    public static RecipeBookmarkResponseDTO from(
            com.cucook.moc.recipe.vo.RecipeBookmarkVO bookmarkVO,
            com.cucook.moc.recipe.vo.RecipeVO recipeVO) { // RecipeVO도 함께 받아야 RecipeDetailDTO를 만들 수 있음

        RecipeBookmarkResponseDTO dto = new RecipeBookmarkResponseDTO();
        dto.setBookmarkId(bookmarkVO.getBookmarkId());
        dto.setUserId(bookmarkVO.getUserId());
        dto.setRecipeId(bookmarkVO.getRecipeId());
        dto.setCreatedDate(bookmarkVO.getCreatedDate());

        if (bookmarkVO.getCreatedDate() != null) {
            LocalDateTime dateTime = bookmarkVO.getCreatedDate().toLocalDateTime();
            dto.setSavedDateFormatted(dateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        } else {
            dto.setSavedDateFormatted(null);
        }
        if (recipeVO != null) {
            BookmarkedRecipeDetailDTO recipeDetail = new BookmarkedRecipeDetailDTO();
            recipeDetail.setRecipeId(recipeVO.getRecipeId());
            recipeDetail.setTitle(recipeVO.getTitle());
            recipeDetail.setSummary(recipeVO.getSummary());
            recipeDetail.setThumbnailUrl(recipeVO.getThumbnailUrl());
            recipeDetail.setDifficultyCd(recipeVO.getDifficultyCd());
            recipeDetail.setCookTimeMin(recipeVO.getCookTimeMin());
            recipeDetail.setCuisineStyleCd(recipeVO.getCuisineStyleCd());
            recipeDetail.setViewCnt(recipeVO.getViewCnt());
            recipeDetail.setLikeCnt(recipeVO.getLikeCnt());
            dto.setRecipe(recipeDetail);
        }
        return dto;
    }
}