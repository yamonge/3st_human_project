package com.cucook.moc.chat.service;

import com.cucook.moc.chat.dao.ChatMessageDAO;
import com.cucook.moc.chat.dao.ChatParticipantDAO;
import com.cucook.moc.chat.dto.ChatMessageDTO;
import com.cucook.moc.chat.vo.ChatMessageVO;
import com.cucook.moc.user.dao.UserDAO;
import com.cucook.moc.user.vo.UserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShoppingChatMessageService {

    @Autowired
    private ChatMessageDAO chatMessageDAO;

    @Autowired
    private ChatParticipantDAO chatParticipantDAO;

    @Autowired
    private UserDAO userDAO;  // 닉네임 조회용 (이메일 X)

//    @Autowired
//    private SimpMessagingTemplate messagingTemplate;

    /**
     * 채팅 메시지 전송
     * - 참여자 검증
     * - DB 저장
     * - STOMP 브로드캐스트
     */
    public void sendMessage(ChatMessageDTO dto) {

        // 1) 참여자 검증
        boolean isParticipant = chatParticipantDAO.existsByRoomAndUser(
                dto.getChatRoomId(),
                dto.getSenderUserId()
        );
        if (!isParticipant) {
            throw new IllegalStateException("채팅방 참여자가 아닙니다.");
        }

        // 2) DB 저장
        ChatMessageVO messageVO = new ChatMessageVO();
        messageVO.setChatRoomId(dto.getChatRoomId());
        messageVO.setSenderUserId(dto.getSenderUserId());
        messageVO.setMessageTypeCd(dto.getMessageTypeCd());
        messageVO.setMessageText(dto.getMessageText());
        messageVO.setSentDate(new Timestamp(System.currentTimeMillis()));

        chatMessageDAO.insertMessage(messageVO);

        // 3) senderNickname 조회 (UserDAO로)
        UserVO sender = userDAO.selectById(dto.getSenderUserId());
        String senderNickname = sender != null ? sender.getUserNickname() : "알수없음";

        dto.setSenderNickname(senderNickname);
        dto.setSentDate(messageVO.getSentDate());

//        messagingTemplate.convertAndSend(
//                "/sub/shopping/chat/room/" + dto.getChatRoomId(),
//                dto
//        );
    }
    
    // 과거 메시지 조회
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getRecentMessages(Long roomId, int limit) {
        return chatMessageDAO.selectMessagesByRoom(roomId, limit);
    }
}
