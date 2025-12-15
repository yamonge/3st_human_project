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

        // ✅ 2. loginUserId NULL 방어 (Oracle + MyBatis 핵심 포인트)
        Long safeLoginUserId = (loginUserId == null ? -1L : loginUserId);

        // ✅ 3. 정렬 기본값 보정
        String safeSort = (sort == null || sort.isBlank()) ? "LATEST" : sort;

        // ✅ 4. 게시판 목록 조회
        List<RecipeBoardListItemVO> items = recipeBoardDAO.selectPublicRecipes(
                safeLoginUserId,
                search,
                cuisineStyleCd,
                difficultyCd,
                maxCookTimeMin,
                safeSort,
                offset,
                safeSize
        );

        // ✅ 5. 전체 개수 조회 (페이징용)
        int total = recipeBoardDAO.countPublicRecipes(
                search,
                cuisineStyleCd,
                difficultyCd,
                maxCookTimeMin
        );

        // ✅ 6. 응답 DTO 반환
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
