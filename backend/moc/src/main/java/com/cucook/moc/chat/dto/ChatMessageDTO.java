package com.cucook.moc.chat.dto;

import lombok.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ChatMessageDTO {

    private Long chatRoomId;
    private Long senderUserId;      // 내부 식별용
    private String senderNickname;   // 프론트에 보여줄 닉네임
    private String messageTypeCd;    // TEXT / SYSTEM 등
    private String messageText;
    private Timestamp sentDate;  // 서버에서 세팅
}
