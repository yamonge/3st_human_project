package com.cucook.moc.admin.service;

import com.cucook.moc.admin.dto.request.AdminRecipeSearchRequestDTO;
import com.cucook.moc.admin.dto.response.AdminRecipeListItemResponseDTO;

import java.util.List;

/**
 * 관리자 레시피(게시글) 관리 비즈니스 로직 인터페이스
 */
public interface AdminRecipeService {

    List<AdminRecipeListItemResponseDTO> getRecipeList(AdminRecipeSearchRequestDTO searchDTO);

    void hideRecipe(Long recipeId);

    void showRecipe(Long recipeId);

    void deleteRecipe(Long recipeId);
}
