package com.cucook.moc.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailServiceImpl implements MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress; // 발신자 이메일 (설정에서 가져옴)

    // 프론트엔드 주소 (예: http://localhost:3010)
    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    public MailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }


    @Override
    public void sendPasswordResetLinkMail(String to, String resetUrl) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(fromAddress);
        message.setSubject("[MyOwnChef] 비밀번호 재설정 안내");
        message.setText(buildResetMailText(resetUrl));

        mailSender.send(message);
    }

    private String buildResetMailText(String resetUrl) {
        StringBuilder sb = new StringBuilder();
        sb.append("안녕하세요.\n\n");
        sb.append("비밀번호 재설정을 위한 링크를 안내드립니다.\n");
        sb.append("아래 링크를 클릭하여 새 비밀번호를 설정해 주세요.\n\n");
        sb.append(resetUrl).append("\n\n");
        sb.append("본 메일은 일정 시간 후 만료될 수 있습니다.\n");
        sb.append("감사합니다.");
        return sb.toString();
    }
}
