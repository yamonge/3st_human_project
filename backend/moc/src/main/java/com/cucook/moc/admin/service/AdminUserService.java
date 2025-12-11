package com.cucook.moc.admin.service;

import com.cucook.moc.admin.dto.request.*;
import com.cucook.moc.admin.dto.response.AdminUserListItemResponseDTO;

import java.util.List;

/**
 * 관리자 회원 관리 비즈니스 로직 인터페이스
 */
public interface AdminUserService {

    List<AdminUserListItemResponseDTO> getAdminUserList(AdminUserSearchRequestDTO searchDTO);

    void suspendUser(AdminUserSuspendRequestDTO requestDTO);

    void activateUser(AdminUserActivateRequestDTO requestDTO);

    void withdrawUser(AdminUserWithdrawRequestDTO requestDTO);
}
