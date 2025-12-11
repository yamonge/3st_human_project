package com.cucook.moc.admin.service;

import com.cucook.moc.admin.dao.AdminUserDAO;
import com.cucook.moc.admin.dto.request.*;
import com.cucook.moc.admin.dto.response.AdminUserListItemResponseDTO;
import com.cucook.moc.admin.vo.AdminUserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * 관리자 회원 관리 비즈니스 로직 구현체
 */
@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final AdminUserDAO adminUserDAO;

    @Override
    public List<AdminUserListItemResponseDTO> getAdminUserList(AdminUserSearchRequestDTO searchDTO) {

        List<AdminUserVO> voList = adminUserDAO.selectAdminUserList(searchDTO);
        List<AdminUserListItemResponseDTO> dtoList = new ArrayList<>();

        for (AdminUserVO vo : voList) {
            AdminUserListItemResponseDTO dto = new AdminUserListItemResponseDTO();
            dto.setUserId(vo.getUserId());
            dto.setUserEmail(vo.getUserEmail());
            dto.setUserName(vo.getUserName());
            dto.setUserNickname(vo.getUserNickname());
            dto.setUserStatus(vo.getUserStatus());
            dto.setReportedCnt(vo.getReportedCnt());
            dto.setSuspendedUntil(vo.getSuspendedUntil());
            dto.setCreatedDate(vo.getCreatedDate());
            dtoList.add(dto);
        }

        return dtoList;
    }

    @Override
    public void suspendUser(AdminUserSuspendRequestDTO requestDTO) {
        validateAdminUser(requestDTO.getAdminUserId());

        Timestamp now = new Timestamp(System.currentTimeMillis());
        Timestamp suspendedUntil = calcSuspendedUntil(now, requestDTO.getSuspendType());

        adminUserDAO.updateUserStatus(
                requestDTO.getUserId(),
                "SUSPENDED",
                suspendedUntil,
                requestDTO.getReason(),
                requestDTO.getAdminUserId()
        );
    }

    @Override
    public void activateUser(AdminUserActivateRequestDTO requestDTO) {
        validateAdminUser(requestDTO.getAdminUserId());

        adminUserDAO.updateUserStatus(
                requestDTO.getUserId(),
                "ACTIVE",
                null,
                null,
                requestDTO.getAdminUserId()
        );
    }

    @Override
    public void withdrawUser(AdminUserWithdrawRequestDTO requestDTO) {
        validateAdminUser(requestDTO.getAdminUserId());

        adminUserDAO.updateUserStatus(
                requestDTO.getUserId(),
                "WITHDRAW",
                null,
                requestDTO.getReason(),
                requestDTO.getAdminUserId()
        );
    }

    /**
     * 정지 기간 타입에 따른 종료일 계산
     * PERMANENT 는 null 로 저장하여 영구 정지로 간주
     */
    private Timestamp calcSuspendedUntil(Timestamp base, String suspendType) {
        if (suspendType == null) {
            return null;
        }

        long baseMillis = base.getTime();
        long oneDayMillis = 24L * 60L * 60L * 1000L;

        if ("ONE_DAY".equals(suspendType)) {
            return new Timestamp(baseMillis + oneDayMillis);
        } else if ("THREE_DAYS".equals(suspendType)) {
            return new Timestamp(baseMillis + oneDayMillis * 3L);
        } else if ("SEVEN_DAYS".equals(suspendType)) {
            return new Timestamp(baseMillis + oneDayMillis * 7L);
        } else if ("PERMANENT".equals(suspendType)) {
            return null;
        } else {
            return null;
        }
    }

    /**
     * adminUserId 가 관리자(user_type='Y') 인지 검증
     */
    private void validateAdminUser(Long adminUserId) {
        if (adminUserId == null || !adminUserDAO.isAdminUser(adminUserId)) {
            throw new IllegalStateException("관리자 권한이 없는 사용자입니다.");
        }
    }
}
