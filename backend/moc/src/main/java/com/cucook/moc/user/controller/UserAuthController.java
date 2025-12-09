package com.cucook.moc.user.controller;

import com.cucook.moc.user.dto.PublicProfileDTO;
import com.cucook.moc.user.dto.UserProfileDTO;
import com.cucook.moc.user.dto.UserReviewDTO;
import com.cucook.moc.user.dto.request.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.cucook.moc.user.dto.response.FindEmailResponseDTO;
import com.cucook.moc.user.dto.response.LoginResponseDTO;
import com.cucook.moc.user.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class UserAuthController {

    private final UserService userService;

    public UserAuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam("email") String email) {
        boolean duplicate = userService.isDuplicateEmail(email);
        return ResponseEntity.ok(duplicate);
    }

    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@RequestBody SignupRequestDTO request) {
        userService.signup(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        LoginResponseDTO response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/find-email")
    public ResponseEntity<FindEmailResponseDTO> findEmail(@RequestBody FindEmailRequestDTO request) {
        FindEmailResponseDTO response = userService.findLoginId(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/find-password")
    public ResponseEntity<Void> sendPasswordResetLink(
            @RequestBody FindPasswordRequestDTO request) {

        userService.sendPasswordResetLink(request);
        return ResponseEntity.ok().build();
    }
    
    /*
    * 프론트에서 /reset-password?token=xxxx 페이지에서
    * 새 비밀번호 입력받고, 이 엔드포인트로 전송
    * */
    // @PostMapping("/reset-password")
    // public ResponseEntity<Void> resetPassword(
    //         @RequestBody ResetPasswordConfirmRequestDTO request) {

    //     userService.resetPasswordByToken(request);
    //     return ResponseEntity.ok().build();
    // }

    @PostMapping("/fcm-token")
    public ResponseEntity<Void> updateFcmToken(
        @RequestBody UpdateFcmTokenRequestDTO request) {

    userService.updateFcmToken(request);
    return ResponseEntity.ok().build();
    }
    /**
     * 내 계정 정보 보기
     * 지금은 userId를 파라미터로 받지만, 나중에 인증 붙이면 토큰에서 꺼내면 됨
     */
    @GetMapping("/me")
    public UserProfileDTO getMyProfile(@RequestParam("userId") Long userId) {
        return userService.getMyProfile(userId);
    }
    /**   
     *  같이 장보기 리뷰에 대한 엔드포인트
     *
     */
    @PostMapping("/{targetUserId}/reviews")
    public void writeReview(
            @PathVariable Long targetUserId,
            @RequestParam Long writerUserId,
            @RequestBody UserReviewCreateRequestDTO request) {

        userService.writeReview(writerUserId, targetUserId, request);
    }

    @GetMapping("/{userId}/reviews")
    public List<UserReviewDTO> getReviews(@PathVariable Long userId) {
        return userService.getUserReviews(userId);
    }

    @GetMapping("/{userId}/public-profile")
    public PublicProfileDTO getPublicProfile(@PathVariable Long userId) {
        return userService.getPublicProfile(userId);
    }
}
