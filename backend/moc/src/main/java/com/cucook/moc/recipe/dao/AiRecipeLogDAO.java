package com.cucook.moc.recipe.dao;

import com.cucook.moc.recipe.vo.AiRecipeLogVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface AiRecipeLogDAO {

    /**
     * tb_ai_recipe_log 테이블에 AI 레시피 생성 로그를 저장합니다.
     * @param aiRecipeLogVO 저장할 로그 정보
     * @return 영향받은 행 수
     */
    int insertAiRecipeLog(AiRecipeLogVO aiRecipeLogVO);

    /**
     * 사용자의 식재료 입력 및 기타 필터 조건에 따라 AI 레시피 생성 로그를 조회합니다.
     * @param searchCriteria 검색 조건이 담긴 AiRecipeLogVO
     * @return 조건에 맞는 AiRecipeLogVO 리스트
     */
    List<AiRecipeLogVO> searchAiRecipeLogs(AiRecipeLogVO searchCriteria);
}