package com.cucook.moc.user.controller;

import com.cucook.moc.user.dto.request.ChangePasswordRequestDTO;
import com.cucook.moc.user.dto.request.UpdateProfileRequestDTO;
import com.cucook.moc.user.dto.response.UserSettingsInfoResponseDTO;
import com.cucook.moc.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserSettingsController {

    private final UserService userService;

    public UserSettingsController(UserService userService) {
        this.userService = userService;
    }

    /**
     * ✅ [추가] 설정/프로필수정 공용: 내 정보 조회
     * - axiosConfig가 ?userId= 를 자동으로 붙여줌
     */
    @GetMapping("/me")
    public ResponseEntity<UserSettingsInfoResponseDTO> getMe(@RequestParam("userId") Long userId) {
        return ResponseEntity.ok(userService.getSettingsUserInfo(userId));
    }

    /**
     * ✅ [추가] 프로필 수정
     */
    @PutMapping("/profile")
    public ResponseEntity<UserSettingsInfoResponseDTO> updateProfile(
            @RequestParam("userId") Long userId,
            @RequestBody UpdateProfileRequestDTO request
    ) {
        return ResponseEntity.ok(userService.updateMyProfile(userId, request));
    }

    /**
     * ✅ [추가] 비밀번호 변경 (현재 비밀번호 검증)
     */
    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @RequestParam("userId") Long userId,
            @RequestBody ChangePasswordRequestDTO request
    ) {
        userService.changePassword(userId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * ✅ [추가] 회원탈퇴 (tb_user.user_status = WITHDRAW)
     */
    @DeleteMapping("/withdraw")
    public ResponseEntity<Void> withdraw(@RequestParam("userId") Long userId) {
        userService.withdrawUser(userId);
        return ResponseEntity.ok().build();
    }
}
