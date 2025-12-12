package com.cucook.moc.user.service;

import java.security.SecureRandom;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.util.List;

import com.cucook.moc.chat.dao.ChatParticipantDAO;
import com.cucook.moc.common.EmailMaskingUtil;
import com.cucook.moc.shopping.vo.ShoppingPostVO;
import com.cucook.moc.user.dao.PasswordResetTokenDAO;
import com.cucook.moc.user.dao.UserReviewDAO;
import com.cucook.moc.user.dto.PublicProfileDTO;
import com.cucook.moc.user.dto.UserProfileDTO;
import com.cucook.moc.user.dto.UserReviewDTO;
import com.cucook.moc.user.dto.request.*;
import com.cucook.moc.user.vo.PasswordResetTokenVO;
import com.cucook.moc.user.vo.UserReviewVO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cucook.moc.user.dao.UserDAO;
import com.cucook.moc.user.dto.response.FindEmailResponseDTO;
import com.cucook.moc.user.dto.response.LoginResponseDTO;
import com.cucook.moc.user.vo.UserVO;
import com.cucook.moc.common.MailService;
import com.cucook.moc.shopping.dao.ShoppingPostDAO;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserDAO userDAO;
    private final BCryptPasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final PasswordResetTokenDAO passwordResetTokenDAO;
    private final UserReviewDAO userReviewDAO;
    private final ShoppingPostDAO shoppingPostDAO;
    private final ChatParticipantDAO chatParticipantDAO;

    public UserServiceImpl(UserDAO userDAO,
                           PasswordResetTokenDAO passwordResetTokenDAO,
                           BCryptPasswordEncoder passwordEncoder,
                           MailService mailService,
                           UserReviewDAO userReviewDAO,
                           ShoppingPostDAO shoppingPostDAO,
                           ChatParticipantDAO chatParticipantDAO) {
        this.userDAO = userDAO;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
        this.passwordResetTokenDAO = passwordResetTokenDAO;

        this.userReviewDAO = userReviewDAO;
        this.shoppingPostDAO = shoppingPostDAO;
        this.chatParticipantDAO = chatParticipantDAO;
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
                .userType("N")
                .userStatus("ACTIVE")
                .reportedCnt(0)
                .shoppingCompletedCnt(0)
                .ratingScore(0.0)
                .trustScore(0.0)
                .createdDate(new Timestamp(System.currentTimeMillis()))
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

        // 이메일 마스킹 적용
        String maskedEmail = EmailMaskingUtil.maskEmail(user.getUserEmail());

        return FindEmailResponseDTO.builder()
                // DTO 필드명이 userEmail이라도, 값은 마스킹된 문자열을 내려주면 됨
                .userEmail(maskedEmail)
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
        long now = System.currentTimeMillis();

        PasswordResetTokenVO tokenVO = PasswordResetTokenVO.builder()
                .userId(user.getUserId())
                .resetToken(hashedToken)
                .createdDate(new Timestamp(now))
                .usedYn("N")
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
        if (tokenVO.getExpireDate().before(new Timestamp(System.currentTimeMillis()))) {
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
    // 유저 프로필 정보
    @Transactional(readOnly = true)
    public UserProfileDTO getMyProfile(Long userId) {
        UserVO user = userDAO.selectById(userId);

        if (user == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        UserProfileDTO dto = new UserProfileDTO();
        dto.setUserId(user.getUserId());
        dto.setUserEmail(user.getUserEmail());         // 전체 이메일
        dto.setUserNickname(user.getUserNickname());   // 닉네임
        dto.setUserProfileImageUrl(user.getUserProfileImageUrl()); //유저 프로필

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public PublicProfileDTO getPublicProfile(Long targetUserId) {

        // 1) 유저 조회
        UserVO user = userDAO.selectById(targetUserId);
        if (user == null) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }

        // 2) 공개용 프로필 DTO 구성 (닉네임 + 평점 + 장보기 완료 횟수)
        return PublicProfileDTO.builder()
                .userId(user.getUserId())
                .userNickname(user.getUserNickname())
                .ratingScore(user.getRatingScore())
                .shoppingCompletedCnt(user.getShoppingCompletedCnt())
                .build();
    }

    // 같이 장보기 유저 리뷰
    @Override
    public void writeReview(Long writerUserId, Long targetUserId, UserReviewCreateRequestDTO request) {

    // 1) 게시글 상태 DONE인지 확인
    ShoppingPostVO post = shoppingPostDAO.selectById(request.getShoppingPostId());
    if (!"DONE".equalsIgnoreCase(post.getStatusCd())) {
        throw new IllegalStateException("완료된 장보기에만 리뷰 작성 가능합니다.");
    }

    // 2) 참여자 여부 확인
    boolean participated = chatParticipantDAO.existsByPostAndUser(request.getShoppingPostId(), writerUserId);
    if (!participated) {
        throw new IllegalStateException("참여하지 않은 장보기에 리뷰 작성 불가");
    }

    // 3) 중복 리뷰 여부
    int exists = userReviewDAO.countExisting(request.getShoppingPostId(), writerUserId, targetUserId);
    if (exists > 0) {
        throw new IllegalStateException("이미 리뷰를 작성했습니다.");
    }

    // 4) INSERT
    UserReviewVO vo = UserReviewVO.builder()
            .targetUserId(targetUserId)
            .writerUserId(writerUserId)
            .shoppingPostId(request.getShoppingPostId())
            .rating(request.getRating())
            .userReviewComment(request.getComment())
            .build();
    userReviewDAO.insertUserReview(vo);

    // 5) 평점 업데이트
    userDAO.updateRatingScoreByAvg(targetUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserReviewDTO> getUserReviews(Long targetUserId) {
        return userReviewDAO.selectReviewsForUser(targetUserId);
    }
}