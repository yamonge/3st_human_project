package com.cucook.moc.admin.service;

import com.cucook.moc.admin.dao.AdminUserReportDAO;
import com.cucook.moc.admin.dto.request.AdminUserReportProcessRequestDTO;
import com.cucook.moc.admin.dto.request.AdminUserReportSearchRequestDTO;
import com.cucook.moc.admin.dto.response.AdminUserReportListItemResponseDTO;
import com.cucook.moc.admin.vo.AdminUserReportVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminUserReportServiceImpl implements AdminUserReportService {

    @Autowired
    private AdminUserReportDAO adminUserReportDAO;

    @Override
    public List<AdminUserReportListItemResponseDTO> getUserReportList(AdminUserReportSearchRequestDTO searchDTO) {
        if (searchDTO == null) {
            searchDTO = new AdminUserReportSearchRequestDTO();
        }

        // 기본값 보정 (DTO 주석 기준: statusCd는 PENDING/PROCESSED/ALL)【turn25file12†L24-L31】
        if (searchDTO.getStatusCd() == null || searchDTO.getStatusCd().trim().isEmpty()) {
            searchDTO.setStatusCd("ALL");
        }
        if (searchDTO.getLimit() == null || searchDTO.getLimit() <= 0) {
            searchDTO.setLimit(50);
        }

        List<AdminUserReportVO> voList = adminUserReportDAO.selectUserReportList(searchDTO);

        List<AdminUserReportListItemResponseDTO> result = new ArrayList<>();
        if (voList == null) return result;

        for (AdminUserReportVO vo : voList) {
            // response interceptor가 response.data만 반환하므로 프론트는 이 DTO 배열을 그대로 받게 됨
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
    public void processUserReport(Long userReportId, AdminUserReportProcessRequestDTO requestDTO) {
        if (userReportId == null) {
            throw new IllegalArgumentException("userReportId는 필수입니다.");
        }
        if (requestDTO == null) {
            throw new IllegalArgumentException("requestDTO는 필수입니다.");
        }
        if (requestDTO.getAdminUserId() == null) {
            throw new IllegalArgumentException("adminUserId는 필수입니다.");
        }
        if (requestDTO.getActionType() == null || requestDTO.getActionType().trim().isEmpty()) {
            throw new IllegalArgumentException("actionType은 필수입니다.");
        }

        // 현재 검색 DTO 주석은 statusCd를 PENDING/PROCESSED/ALL로 정의하고 있으므로【turn25file12†L24-L31】
        // 처리 결과는 일단 PROCESSED로 통일 (REJECT를 별도 코드로 쓰려면 DDL/상수/필터를 확장해야 함)
        String statusCd = "PROCESSED";

        Timestamp now = new Timestamp(System.currentTimeMillis());
        int updated = adminUserReportDAO.updateUserReportStatus(
                userReportId,
                statusCd,
                requestDTO.getAdminUserId(),
                now
        );

        if (updated <= 0) {
            throw new IllegalStateException("신고 처리 상태 업데이트 실패 (존재하지 않는 userReportId일 수 있음): " + userReportId);
        }

        // WARNING / SUSPEND의 실제 동작(FCM 발송, 정지 적용)은 프론트에서 각각 수행 후
        // 여기서는 “처리완료” 마킹만 담당하도록 두는 것이 기존 모듈(정지 API) 재사용에 유리합니다.
    }
}
