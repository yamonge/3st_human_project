package com.cucook.moc.admin.service.impl;

import com.cucook.moc.admin.service.AdminRecipeReportService;
import com.cucook.moc.recipe.dao.RecipeReportDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminRecipeReportServiceImpl implements AdminRecipeReportService {

    private final RecipeReportDAO recipeReportDAO;

    @Override
    @Transactional
    public void processRecipeReport(Long recipeReportId, Long adminUserId) {
        recipeReportDAO.updateRecipeReportStatus(recipeReportId, "PROCESSED");
    }
}
