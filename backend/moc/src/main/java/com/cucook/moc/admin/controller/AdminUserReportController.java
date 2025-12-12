package com.cucook.moc.admin.controller;

import com.cucook.moc.admin.dto.request.AdminUserReportProcessRequestDTO;
import com.cucook.moc.admin.dto.request.AdminUserReportSearchRequestDTO;
import com.cucook.moc.admin.dto.response.AdminUserReportListItemResponseDTO;
import com.cucook.moc.admin.service.AdminUserReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 유저 신고 관리 API 컨트롤러
 */
@RestController
@RequestMapping("/api/admin/reports/users")
@RequiredArgsConstructor
public class AdminUserReportController {

    private final AdminUserReportService adminUserReportService;

    /**
     * 유저 신고 목록 조회 (cursor 기반)
     */
    @GetMapping
    public List<AdminUserReportListItemResponseDTO> getUserReportList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String reportReasonCd,
            @RequestParam(defaultValue = "PENDING") String statusCd,
            @RequestParam(required = false) Long lastUserReportId,
            @RequestParam(defaultValue = "20") Integer limit
    ) {
        AdminUserReportSearchRequestDTO searchDTO = new AdminUserReportSearchRequestDTO();
        searchDTO.setKeyword(keyword);
        searchDTO.setReasonCd(reportReasonCd);
        searchDTO.setStatusCd(statusCd);
        searchDTO.setLastUserReportId(lastUserReportId);
        searchDTO.setLimit(limit);

        return adminUserReportService.getUserReportList(searchDTO);
    }

    /**
     * 신고 처리(경고/계정정지/반려)
     */
    @PostMapping("/{userReportId}/process")
    public void processUserReport(
            @PathVariable Long userReportId,
            @RequestBody AdminUserReportProcessRequestDTO requestDTO
    ) {
        requestDTO.setUserReportId(userReportId);
        adminUserReportService.processUserReport(requestDTO);
    }
}
