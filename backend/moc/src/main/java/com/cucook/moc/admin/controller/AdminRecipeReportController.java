package com.cucook.moc.admin.controller;

import com.cucook.moc.admin.service.AdminRecipeReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/reports/recipes")
public class AdminRecipeReportController {

    private final AdminRecipeReportService adminRecipeReportService;

    /**
     * 레시피 신고 처리완료 마킹
     * POST /api/admin/reports/recipes/{recipeReportId}/process
     */
    @PostMapping("/{recipeReportId}/process")
    public void processRecipeReport(
            @PathVariable Long recipeReportId,
            @RequestParam(value = "userId", required = false) Long adminUserId
    ) {
        adminRecipeReportService.processRecipeReport(recipeReportId, adminUserId);
    }
}
