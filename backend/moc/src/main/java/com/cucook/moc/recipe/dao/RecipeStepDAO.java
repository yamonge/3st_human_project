package com.cucook.moc.recipe.dao;

import com.cucook.moc.recipe.vo.RecipeVO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface RecipeStepDAO {
    int insertRecipeStep(RecipeVO stepVO);

}