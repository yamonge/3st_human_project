package com.cucook.moc.user.service.impl;

import com.cucook.moc.user.dao.MyPageDAO;
import com.cucook.moc.user.dto.response.MyPageCountResponseDTO;
import com.cucook.moc.user.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MyPageServiceImpl implements MyPageService {

    private final MyPageDAO myPageDAO;

    @Override
    public MyPageCountResponseDTO getMyPageCounts(Long userId) {

        return new MyPageCountResponseDTO(
                myPageDAO.countUserIngredients(userId),
                myPageDAO.countSavedRecipes(userId),
                myPageDAO.countSharedRecipes(userId),
                myPageDAO.countReceivedReviews(userId),
                myPageDAO.countMyReports(userId)
        );
    }
}
