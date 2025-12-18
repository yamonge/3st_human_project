package com.cucook.moc.admin.service;

import com.cucook.moc.admin.dao.AdminUserReportDAO;
import com.cucook.moc.admin.dto.request.AdminUserReportProcessRequestDTO;
import com.cucook.moc.admin.dto.request.AdminUserReportSearchRequestDTO;
import com.cucook.moc.admin.dto.response.AdminUserReportListItemResponseDTO;
import com.cucook.moc.admin.vo.AdminUserReportVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserReportServiceImpl implements AdminUserReportService {

    private final AdminUserReportDAO adminUserReportDAO;

    @Override
    public List<AdminUserReportListItemResponseDTO> getUserReportList(AdminUserReportSearchRequestDTO searchDTO) {
        if (searchDTO == null) {
            searchDTO = new AdminUserReportSearchRequestDTO();
        }

        if (searchDTO.getStatusCd() == null || searchDTO.getStatusCd().trim().isEmpty()) {
            searchDTO.setStatusCd("ALL");
        }
        if (searchDTO.getLimit() == null || searchDTO.getLimit() <= 0) {
            searchDTO.setLimit(50);
        }

        List<AdminUserReportVO> list = adminUserReportDAO.selectUserReportList(searchDTO);

        List<AdminUserReportListItemResponseDTO> result = new ArrayList<>();
        if (list == null) return result;

        for (AdminUserReportVO vo : list) {
            AdminUserReportListItemResponseDTO dto = new AdminUserReportListItemResponseDTO(
                    vo.getUserReportId(),
                    vo.getReportReasonCd(),
                    vo.getProcessingStatusCd(),
                    vo.getCreatedDate(),
                    vo.getReporterUserId(),
                    vo.getReporterNickname(),
                    vo.getReportedUserId(),
                    vo.getReportedNickname(),
                    vo.getReportComment()
            );
            result.add(dto);
        }

        return result;
    }

    @Override
    public void processUserReport(AdminUserReportProcessRequestDTO requestDTO) {
        if (requestDTO.getUserReportId() == null) {
            throw new IllegalArgumentException("userReportId는 필수입니다.");
        }
        if (requestDTO.getAdminUserId() == null) {
            throw new IllegalArgumentException("adminUserId는 필수입니다.");
        }
        if (requestDTO.getActionType() == null || requestDTO.getActionType().trim().isEmpty()) {
            throw new IllegalArgumentException("actionType은 필수입니다.");
        }

        // 처리상태는 필터/리스트에 쓰기 좋게 PROCESSED로 통일
        String statusCd = "PROCESSED";
        Timestamp now = new Timestamp(System.currentTimeMillis());

        int updated = adminUserReportDAO.updateUserReportStatus(
                requestDTO.getUserReportId(),
                statusCd,
                requestDTO.getAdminUserId(),
                now
        );

        if (updated <= 0) {
            throw new IllegalStateException("신고 처리 상태 업데이트 실패: " + requestDTO.getUserReportId());
        }
    }
}
