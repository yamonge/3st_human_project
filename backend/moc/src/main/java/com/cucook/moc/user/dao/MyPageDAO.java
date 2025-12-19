package com.cucook.moc.user.dao;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MyPageDAO {

    int countUserIngredients(Long userId);

    int countSavedRecipes(Long userId);

    int countSharedRecipes(Long userId);

    int countReceivedReviews(Long userId);

    int countMyReports(Long userId);
}
