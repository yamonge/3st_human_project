//package com.cucook.moc.recipe.dao;
//
//import com.cucook.moc.recipe.vo.RecipeVO;
//import org.apache.ibatis.annotations.Mapper;
//
//import java.util.List;
//
//@Mapper
//public interface RecipeDAO {
//
//    /**
//     * 레시피의 메인 정보를 데이터베이스에 저장합니다.
//     *
//     * @param vo 저장할 RecipeVO 객체
//     * @return 삽입된 레코드 수
//     */
//    int insertRecipe(RecipeVO vo);
//
//    /**
//     * 특정 레시피 ID를 통해 단일 레시피의 상세 정보를 조회합니다.
//     *
//     * @param recipeId 조회할 레시피의 ID
//     * @return 해당 레시피의 RecipeVO 객체 또는 null
//     */
//    RecipeVO selectRecipeById(Long recipeId);
//
//    /**
//     * 다양한 검색 조건에 따라 레시피 목록을 조회합니다.
//     *
//     * @param vo 검색 조건을 담은 RecipeVO 객체
//     * @return 검색 조건에 맞는 RecipeVO 리스트
//     */
//    List<RecipeVO> selectRecipesByCriteria(RecipeVO vo);
//}