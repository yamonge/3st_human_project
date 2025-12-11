package com.cucook.moc.admin.service;

import com.cucook.moc.admin.dao.AdminUserReportDAO;
import com.cucook.moc.admin.dto.request.AdminUserReportProcessRequestDTO;
import com.cucook.moc.admin.dto.request.AdminUserReportSearchRequestDTO;
import com.cucook.moc.admin.dto.request.AdminUserSuspendRequestDTO;
import com.cucook.moc.admin.dto.response.AdminUserReportListItemResponseDTO;
import com.cucook.moc.admin.vo.AdminUserReportVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * 관리자 유저 신고 관리 비즈니스 로직 구현체
 */
@Service
@RequiredArgsConstructor
public class AdminUserReportServiceImpl implements AdminUserReportService {

    private final AdminUserReportDAO adminUserReportDAO;
    private final AdminUserService adminUserService;

    @Override
    public List<AdminUserReportListItemResponseDTO> getUserReportList(AdminUserReportSearchRequestDTO searchDTO) {

        List<AdminUserReportVO> voList = adminUserReportDAO.selectUserReportList(searchDTO);
        List<AdminUserReportListItemResponseDTO> dtoList = new ArrayList<>();

        for (AdminUserReportVO vo : voList) {
            AdminUserReportListItemResponseDTO dto = new AdminUserReportListItemResponseDTO();
            dto.setUserReportId(vo.getUserReportId());
            dto.setReportReasonCd(vo.getReportReasonCd());
            dto.setProcessingStatusCd(vo.getProcessingStatusCd());
            dto.setCreatedDate(vo.getCreatedDate());
            dto.setReporterUserId(vo.getReporterUserId());
            dto.setReporterNickname(vo.getReporterNickname());
            dto.setReportedUserId(vo.getReportedUserId());
            dto.setReportedNickname(vo.getReportedNickname());
            dto.setReportComment(vo.getReportComment());
            dtoList.add(dto);
        }

        return dtoList;
    }

    @Override
    public void processUserReport(AdminUserReportProcessRequestDTO requestDTO) {

        Timestamp now = new Timestamp(System.currentTimeMillis());

        if ("SUSPEND".equalsIgnoreCase(requestDTO.getActionType())) {
            // 신고 대상 계정 정지
            AdminUserSuspendRequestDTO suspendDTO = new AdminUserSuspendRequestDTO();
            suspendDTO.setUserId(requestDTO.getReportedUserId());
            suspendDTO.setAdminUserId(requestDTO.getAdminUserId());
            suspendDTO.setSuspendType(requestDTO.getSuspendType());
            suspendDTO.setReason("신고 처리에 따른 계정 정지");
            adminUserService.suspendUser(suspendDTO);
        } else if ("WARNING".equalsIgnoreCase(requestDTO.getActionType())) {
            // 경고 발송 로직은 추후 푸시/알림 시스템 연동
        } else if ("REJECT".equalsIgnoreCase(requestDTO.getActionType())) {
            // 반려는 상태 변경만
        }

        // 신고 상태를 PROCESSED 로 변경
        adminUserReportDAO.updateUserReportStatus(
                requestDTO.getUserReportId(),
                "PROCESSED",
                requestDTO.getAdminUserId(),
                now
        );
    }
}
