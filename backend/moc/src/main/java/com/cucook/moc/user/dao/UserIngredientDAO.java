package com.cucook.moc.user.dao;

import com.cucook.moc.user.vo.UserIngredientVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface UserIngredientDAO {

    int insertUserIngredient(UserIngredientVO vo);

    List<UserIngredientVO> selectUserIngredientsByUserId(Long userId);

    UserIngredientVO selectUserIngredientById(Long userIngredientId);

    int updateUserIngredient(UserIngredientVO vo);

    int deleteUserIngredient(Long userIngredientId);
}