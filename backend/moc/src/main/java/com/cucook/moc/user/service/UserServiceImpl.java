package com.cucook.moc.user.service;

import java.security.SecureRandom;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

import com.cucook.moc.user.dao.PasswordResetTokenDAO;
import com.cucook.moc.user.dto.request.*;
import com.cucook.moc.user.vo.PasswordResetTokenVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cucook.moc.user.dao.UserDAO;
import com.cucook.moc.user.dto.response.FindEmailResponseDTO;
import com.cucook.moc.user.dto.response.LoginResponseDTO;
import com.cucook.moc.user.vo.UserVO;
import com.cucook.moc.common.MailService;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserDAO userDAO;
    private final BCryptPasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final PasswordResetTokenDAO passwordResetTokenDAO;

    public UserServiceImpl(UserDAO userDAO,
                           PasswordResetTokenDAO passwordResetTokenDAO,
                           BCryptPasswordEncoder passwordEncoder,
                           MailService mailService) {
        this.userDAO = userDAO;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
        this.passwordResetTokenDAO = passwordResetTokenDAO;
    }

    @Override
    public boolean isDuplicateEmail(String userEmail) {
        return userDAO.countByUserEmail(userEmail) > 0;
    }

    @Override
    public void signup(SignupRequestDTO request) {

        // 1. 비밀번호 확인 체크
        if (!request.getUserPassword().equals(request.getPasswordConfirm())) {
            throw new IllegalArgumentException("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }

        // 2. 이메일 중복 체크
        if (isDuplicateEmail(request.getUserEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 3. DTO → VO 매핑
        UserVO user = UserVO.builder()
                .userEmail(request.getUserEmail())
                .userName(request.getUserName())
                .userNickname(request.getUserNickname())
                .userBirthDate(request.getUserBirthDate())
                .userPassword(passwordEncoder.encode(request.getUserPassword()))
                .userType("USER")
                .userStatus("ACTIVE")
                .reportedCnt(0)
                .shoppingCompletedCnt(0)
                .ratingScore(0.0)
                .trustScore(0.0)
                .createdDate(LocalDateTime.now())
                .build();

        // 4. DB 저장
        userDAO.insertUser(user);
    }

    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {

        // 1. 이메일로 유저 조회
        UserVO user = userDAO.findByUserEmail(request.getUserEmail());
        if (user == null) {
            throw new IllegalArgumentException("가입되지 않은 이메일입니다.");
        }

        // 2. 비밀번호 검증
        if (!passwordEncoder.matches(request.getUserPassword(), user.getUserPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 3. 상태 체크
        if ("SUSPENDED".equalsIgnoreCase(user.getUserStatus())) {
            throw new IllegalStateException("정지된 계정입니다.");
        }

        // 4. 마지막 로그인 시간 업데이트
        userDAO.updateLastLoginDate(user.getUserId());

        // 5. VO → 응답 DTO 매핑
        return LoginResponseDTO.builder()
                .userId(user.getUserId())
                .userEmail(user.getUserEmail())
                .userName(user.getUserName())
                .userNickname(user.getUserNickname())
                .userType(user.getUserType())
                .userStatus(user.getUserStatus())
                .build();
    }

    @Override
    public FindEmailResponseDTO findLoginId(FindEmailRequestDTO request) {

        UserVO user = userDAO.findByNameAndBirthDate(
                request.getUserName(),
                request.getUserBirthDate()
        );

        if (user == null) {
            throw new IllegalArgumentException("일치하는 사용자가 없습니다.");
        }

        return FindEmailResponseDTO.builder()
                .userEmail(user.getUserEmail())
                .build();
    }

    @Override
    public void sendPasswordResetLink(FindPasswordRequestDTO request) {

        // 1) 사용자 검증
        UserVO user = userDAO.findForPasswordReset(
                request.getUserEmail(),
                request.getUserName(),
                request.getUserBirthDate()
        );

        if (user == null) {
            throw new IllegalArgumentException("일치하는 사용자가 없습니다.");
        }

        // 2) 토큰 생성 (원본 토큰은 이메일로 전달)
        String resetToken = createResetToken();

        // 3) 토큰 해시화 후 DB 저장 (유효시간 예: 1시간)
        String hashedToken = hashToken(resetToken);

        PasswordResetTokenVO tokenVO = PasswordResetTokenVO.builder()
                .userId(user.getUserId())
                .resetToken(hashedToken)
                .expireDate(LocalDateTime.now().plusHours(1))
                .usedYn("N")
                .createdDate(LocalDateTime.now())
                .build();

        passwordResetTokenDAO.insertToken(tokenVO);

        // 4) 프론트에서 사용할 URL 생성 (원본 토큰 사용)
        //    예: http://localhost:3010/reset-password?token=xxxx
        String resetUrl = buildResetUrl(resetToken);

        // 5) 메일 발송
        mailService.sendPasswordResetLinkMail(user.getUserEmail(), resetUrl);
    }


    private String createResetToken() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(50);
        for (int i = 0; i < 50; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
    /**
     * 비밀번호 재설정 토큰을 해시(SHA-256)로 변환
     * - 원본 토큰은 이메일 링크에 사용
     * - DB에는 해시값만 저장해서 보안 강화
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encoded = digest.digest(token.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : encoded) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("토큰 해시 처리 중 오류가 발생했습니다.", e);
        }
    }


    // 프론트 URL은 MailServiceImpl에서 @Value 주입해도 됨
    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    // frontend
    private String buildResetUrl(String resetToken) {
        return frontendBaseUrl + "/reset-password?token=" + resetToken;
    }

    @Override
    public void resetPasswordByToken(ResetPasswordConfirmRequestDTO request) {

        // 1) 비밀번호 확인 검증
        if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
            throw new IllegalArgumentException("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }

        // 2) 토큰 조회
        String hashedToken = hashToken(request.getToken());
        PasswordResetTokenVO tokenVO = passwordResetTokenDAO.findByToken(hashedToken);
        if (tokenVO == null) {
            throw new IllegalArgumentException("유효하지 않은 토큰입니다.");
        }

        // 3) 토큰 사용 여부 체크
        if ("Y".equalsIgnoreCase(tokenVO.getUsedYn())) {
            throw new IllegalArgumentException("이미 사용된 토큰입니다.");
        }

        // 4) 토큰 만료시간 체크
        if (tokenVO.getExpireDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("만료된 토큰입니다.");
        }

        // 5) 해당 user_id의 비밀번호 변경
        String encoded = passwordEncoder.encode(request.getNewPassword());
        userDAO.updatePassword(tokenVO.getUserId(), encoded);

        // 6) 토큰 사용 처리
        passwordResetTokenDAO.markTokenUsed(tokenVO.getResetTokenId());
    }

    // FCM Token 업데이트
    @Override
    public void updateFcmToken(UpdateFcmTokenRequestDTO request) {

        if (request.getUserId() == null || request.getFcmToken() == null) {
            throw new IllegalArgumentException("userId와 fcmToken은 필수입니다.");
        }

        userDAO.updateFcmToken(
                request.getUserId(),
                request.getFcmToken(),
                request.getDeviceOs(),
                request.getDeviceVersion()
        );
    }
}
