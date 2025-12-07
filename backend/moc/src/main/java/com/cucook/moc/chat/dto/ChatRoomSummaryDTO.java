package com.cucook.moc.chat.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ChatRoomSummaryDTO {

    private Long chatRoomId;
    private Long shoppingPostId;
    private String placeName;        // 게시글/장소 이름

    private String lastMessage;      // 마지막 메시지
    private String lastSenderNickname; // 마지막 보낸 사람 닉네임
    private Integer unreadCount;     // 안 읽은 메시지 수 (선택)
    private String statusCd;         // OPEN / DONE / CANCELED
    private LocalDateTime updatedAt; // 마지막 활동 시간
}
