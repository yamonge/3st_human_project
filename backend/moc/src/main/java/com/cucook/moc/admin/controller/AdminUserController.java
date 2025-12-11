package com.cucook.moc.admin.controller;

import com.cucook.moc.admin.dto.request.*;
import com.cucook.moc.admin.dto.response.AdminUserListItemResponseDTO;
import com.cucook.moc.admin.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 회원 관리 API 컨트롤러
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    /**
     * 회원 목록 조회 (cursor 기반)
     */
    @GetMapping
    public List<AdminUserListItemResponseDTO> getUserList(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(required = false) Long lastUserId,
            @RequestParam(defaultValue = "20") Integer limit
    ) {
        AdminUserSearchRequestDTO searchDTO = new AdminUserSearchRequestDTO();
        searchDTO.setKeyword(keyword);
        searchDTO.setStatus(status);
        searchDTO.setLastUserId(lastUserId);
        searchDTO.setLimit(limit);

        return adminUserService.getAdminUserList(searchDTO);
    }

    /**
     * 계정 정지
     */
    @PostMapping("/{userId}/suspend")
    public void suspendUser(
            @PathVariable Long userId,
            @RequestBody AdminUserSuspendRequestDTO requestDTO
    ) {
        requestDTO.setUserId(userId);
        adminUserService.suspendUser(requestDTO);
    }

    /**
     * 계정 정지 해제(활성화)
     */
    @PostMapping("/{userId}/activate")
    public void activateUser(
            @PathVariable Long userId,
            @RequestBody AdminUserActivateRequestDTO requestDTO
    ) {
        requestDTO.setUserId(userId);
        adminUserService.activateUser(requestDTO);
    }

    /**
     * 회원 탈퇴 처리
     */
    @PostMapping("/{userId}/withdraw")
    public void withdrawUser(
            @PathVariable Long userId,
            @RequestBody AdminUserWithdrawRequestDTO requestDTO
    ) {
        requestDTO.setUserId(userId);
        adminUserService.withdrawUser(requestDTO);
    }
}
