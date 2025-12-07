package com.cucook.moc.chat.vo;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ChatParticipantVO {
    private Long shoppingParticipantId;
    private Long chatRoomId;
    private Long userId;
    private LocalDateTime joinDate;
    private LocalDateTime leaveDate;
}

