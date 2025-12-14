package com.cucook.moc.recipe.service.impl;

import com.cucook.moc.recipe.dao.RecipeBoardDAO;
import com.cucook.moc.recipe.dto.response.RecipeBoardListResponseDTO;
import com.cucook.moc.recipe.service.RecipeBoardService;
import com.cucook.moc.recipe.vo.RecipeBoardListItemVO;
import com.cucook.moc.recipe.vo.RecipeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecipeBoardServiceImpl implements RecipeBoardService {

    private final RecipeBoardDAO recipeBoardDAO;

    @Override
    @Transactional(readOnly = true)
    public RecipeBoardListResponseDTO getPublicRecipes(
            Long loginUserId,
            String search,
            String cuisineStyleCd,
            String difficultyCd,
            Integer maxCookTimeMin,
            String sort,
            int page,
            int size
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        int offset = safePage * safeSize;

        List<RecipeBoardListItemVO> items = recipeBoardDAO.selectPublicRecipes(
                loginUserId,
                search,
                cuisineStyleCd,
                difficultyCd,
                maxCookTimeMin,
                (sort == null || sort.isBlank()) ? "LATEST" : sort,
                offset,
                safeSize
        );

        int total = recipeBoardDAO.countPublicRecipes(search, cuisineStyleCd, difficultyCd, maxCookTimeMin);

        return new RecipeBoardListResponseDTO(items, total, safePage, safeSize);
    }

    @Override
    @Transactional(readOnly = true)
    public RecipeVO getPublicRecipeDetail(Long recipeId) {
        RecipeVO vo = recipeBoardDAO.selectPublicRecipeById(recipeId);
        if (vo == null) {
            throw new IllegalArgumentException("레시피를 찾을 수 없습니다.");
        }
        return vo;
    }
}
