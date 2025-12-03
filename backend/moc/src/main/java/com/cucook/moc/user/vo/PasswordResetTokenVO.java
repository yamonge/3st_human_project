package com.cucook.moc.user.vo;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PasswordResetTokenVO {

    private Long resetTokenId;
    private Long userId;
    private String resetToken;
    private LocalDateTime expireDate;
    private String usedYn;        // 'N' or 'Y'
    private LocalDateTime createdDate;
    private LocalDateTime usedDate;
}
