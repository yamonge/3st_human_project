# 🔧 채팅 시스템 백엔드 수정 및 추가 체크리스트

> **작성일**: 2025년 12월 16일  
> **상태**: 백엔드 수정 필요 ⚠️

---

## 📊 전체 진행 현황

### ✅ 완료된 항목
- [x] Spring Boot WebSocket 의존성 추가 (build.gradle)
- [x] WebSocketConfig.java 기본 구조
- [x] Controller 3개 (Stomp, Message, Room)
- [x] Service 2개 (Message, Room)
- [x] DAO 3개 (Message, Room, Participant)
- [x] VO 3개 (Entity)
- [x] DTO 3개 (API 응답)
- [x] chatRoomMapper.xml
- [x] chatParticipantMapper.xml

### ⚠️ 수정 필요 항목
- [ ] **chatMessageMapper.xml 생성** (가장 중요!)
- [ ] WebSocket 경로 프론트와 통일
- [ ] DTO 필드 추가/수정
- [ ] 미구현 필드 쿼리 추가

### 🆕 추가 필요 항목
- [ ] 참여자 목록 API
- [ ] 채팅방 삭제 API
- [ ] 채팅방 나가기 API
- [ ] 강퇴 기능 API

---

## 🔴 Phase 1: 필수 수정 (최우선 - 이것만 하면 작동!)

### ✅ 1-1. chatMessageMapper.xml 파일 생성 (가장 중요!)

**파일 위치**: `backend/moc/src/main/resources/mybatis/mappers/chatMessageMapper.xml`

**작업 내용**: 전체 파일 생성

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.cucook.moc.chat.dao.ChatMessageDAO">

    <!-- ResultMap -->
    <resultMap id="ChatMessageResultMap" type="com.cucook.moc.chat.vo.ChatMessageVO">
        <id     property="chatMessageId" column="chat_message_id"/>
        <result property="chatRoomId"    column="chat_room_id"/>
        <result property="senderUserId"  column="sender_user_id"/>
        <result property="messageTypeCd" column="message_type_cd"/>
        <result property="messageText"   column="message_text"/>
        <result property="sentDate"      column="sent_date"/>
    </resultMap>

    <!-- 메시지 저장 -->
    <insert id="insertMessage" parameterType="com.cucook.moc.chat.vo.ChatMessageVO">
        <selectKey keyProperty="chatMessageId" resultType="long" order="BEFORE">
            SELECT seq_tb_shopping_chat_message.NEXTVAL FROM dual
        </selectKey>

        INSERT INTO tb_shopping_chat_message (
            chat_message_id,
            chat_room_id,
            sender_user_id,
            message_type_cd,
            message_text,
            sent_date
        ) VALUES (
            #{chatMessageId},
            #{chatRoomId},
            #{senderUserId},
            #{messageTypeCd},
            #{messageText},
            #{sentDate}
        )
    </insert>

    <!-- 과거 메시지 조회 (최신순, limit 적용) -->
    <resultMap id="ChatMessageDTOMap" type="com.cucook.moc.chat.dto.ChatMessageDTO">
        <result property="chatRoomId"      column="chat_room_id"/>
        <result property="senderUserId"    column="sender_user_id"/>
        <result property="senderNickname"  column="sender_nickname"/>
        <result property="messageTypeCd"   column="message_type_cd"/>
        <result property="messageText"     column="message_text"/>
        <result property="sentDate"        column="sent_date"/>
    </resultMap>

    <select id="selectMessagesByRoom" resultMap="ChatMessageDTOMap">
        SELECT
            m.chat_message_id,
            m.chat_room_id,
            m.sender_user_id,
            u.user_nickname AS sender_nickname,
            m.message_type_cd,
            m.message_text,
            m.sent_date
        FROM tb_shopping_chat_message m
        LEFT JOIN tb_user u
          ON m.sender_user_id = u.user_id
        WHERE m.chat_room_id = #{chatRoomId}
        ORDER BY m.sent_date DESC
        FETCH FIRST #{limit} ROWS ONLY
    </select>

</mapper>
```

**체크 포인트**:
- [ ] 파일 생성 완료
- [ ] namespace 확인: `com.cucook.moc.chat.dao.ChatMessageDAO`
- [ ] 시퀀스명 확인: `seq_tb_shopping_chat_message` (DB에 있는지 확인!)
- [ ] 테이블명 확인: `tb_shopping_chat_message` (DB에 있는지 확인!)
- [ ] LEFT JOIN으로 닉네임 조회
- [ ] ORDER BY 최신순 정렬
- [ ] FETCH FIRST 적용

**DB 확인 필요 (Oracle SQL Developer)**:
```sql
-- 테이블 존재 확인
SELECT * FROM user_tables WHERE table_name = 'TB_SHOPPING_CHAT_MESSAGE';

-- 시퀀스 존재 확인
SELECT * FROM user_sequences WHERE sequence_name = 'SEQ_TB_SHOPPING_CHAT_MESSAGE';

-- 시퀀스 없으면 생성
CREATE SEQUENCE seq_tb_shopping_chat_message START WITH 1 INCREMENT BY 1;

-- 컬럼 확인
DESC tb_shopping_chat_message;
```

---

### ✅ 1-2. WebSocket 경로 프론트와 통일

**수정 이유**: 프론트엔드와 백엔드의 WebSocket 경로가 불일치

| 항목 | 프론트엔드 | 백엔드 현재 | 수정 필요 |
|------|----------|-----------|---------|
| WebSocket URL | `/ws-chat` | `/ws-shopping-chat` | ✅ |
| 구독 prefix | `/topic` | `/sub` | ✅ |
| 발행 prefix | `/app` | `/pub` | ✅ |
| 메시지 전송 | `/app/chat.sendMessage` | `/pub/shopping/chat/message` | ✅ |
| 구독 경로 | `/topic/room/{id}` | `/sub/shopping/chat/room/{id}` | ✅ |

#### **Option A: 백엔드를 프론트에 맞추기 (권장 ⭐)**

**파일**: `backend/moc/src/main/java/com/cucook/moc/config/WebSocketConfig.java`

**수정 전**:
```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws-shopping-chat")   // ❌
            .setAllowedOriginPatterns("*")
            .withSockJS();
}

@Override
public void configureMessageBroker(MessageBrokerRegistry registry) {
    registry.enableSimpleBroker("/sub");        // ❌
    registry.setApplicationDestinationPrefixes("/pub"); // ❌
}
```

**수정 후**:
```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws-chat")            // ✅ 프론트와 일치
            .setAllowedOriginPatterns("*")
            .withSockJS();
}

@Override
public void configureMessageBroker(MessageBrokerRegistry registry) {
    registry.enableSimpleBroker("/topic");      // ✅ 프론트와 일치
    registry.setApplicationDestinationPrefixes("/app"); // ✅ 프론트와 일치
}
```

**체크 포인트**:
- [ ] `/ws-chat` 경로로 변경
- [ ] `/topic` prefix로 변경
- [ ] `/app` prefix로 변경

---

#### **파일**: `backend/moc/src/main/java/com/cucook/moc/chat/controller/ShoppingChatStompController.java`

**수정 전**:
```java
@MessageMapping("/shopping/chat/message")  // ❌ /pub/shopping/chat/message
public void handleChatMessage(ChatMessageDTO dto) {
    shoppingChatMessageService.sendMessage(dto);
}
```

**수정 후**:
```java
@MessageMapping("/chat.sendMessage")       // ✅ /app/chat.sendMessage
public void handleChatMessage(ChatMessageDTO dto) {
    shoppingChatMessageService.sendMessage(dto);
}
```

**체크 포인트**:
- [ ] `/chat.sendMessage` 경로로 변경

---

#### **파일**: `backend/moc/src/main/java/com/cucook/moc/chat/service/ShoppingChatMessageService.java`

**수정 전** (Line 69):
```java
// 4. WebSocket 브로드캐스트
String destination = "/sub/shopping/chat/room/" + dto.getChatRoomId();  // ❌
messagingTemplate.convertAndSend(destination, dto);
```

**수정 후**:
```java
// 4. WebSocket 브로드캐스트
String destination = "/topic/room/" + dto.getChatRoomId();  // ✅ 프론트와 일치
messagingTemplate.convertAndSend(destination, dto);
```

**체크 포인트**:
- [ ] `/topic/room/` 경로로 변경

---

### ✅ 1-3. DTO 필드 추가 및 수정

#### **파일**: `backend/moc/src/main/java/com/cucook/moc/chat/dto/ChatMessageDTO.java`

**수정 전**:
```java
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ChatMessageDTO {
    private Long chatRoomId;
    private Long senderUserId;      
    private String senderNickname;   
    private String messageTypeCd;    
    private String messageText;
    private Timestamp sentDate;  // ❌ 프론트는 createdAt 기대
}
```

**수정 후**:
```java
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ChatMessageDTO {
    private Long messageId;          // ✅ 추가!
    private Long chatRoomId;
    private Long senderUserId;      
    private String senderNickname;   
    private String messageTypeCd;    
    private String messageText;
    private Timestamp sentDate;      // 기존 유지
    private Timestamp createdAt;     // ✅ 추가 (sentDate와 동일 값)
    
    // createdAt을 sentDate로 복사하는 편의 메서드
    public void syncTimestamps() {
        if (sentDate != null && createdAt == null) {
            createdAt = sentDate;
        }
        if (createdAt != null && sentDate == null) {
            sentDate = createdAt;
        }
    }
}
```

**체크 포인트**:
- [ ] `messageId` 필드 추가
- [ ] `createdAt` 필드 추가
- [ ] `syncTimestamps()` 메서드 추가 (선택)

---

#### **파일**: `backend/moc/src/main/java/com/cucook/moc/chat/service/ShoppingChatMessageService.java`

**수정 전** (Line 58-66):
```java
chatMessageDAO.insertMessage(messageVO);

// 3) senderNickname 조회 (UserDAO로)
UserVO sender = userDAO.selectById(dto.getSenderUserId());
String senderNickname = sender != null ? sender.getUserNickname() : "알수없음";

dto.setSenderNickname(senderNickname);
dto.setSentDate(messageVO.getSentDate());
```

**수정 후**:
```java
chatMessageDAO.insertMessage(messageVO);

// 3) senderNickname 조회 (UserDAO로)
UserVO sender = userDAO.selectById(dto.getSenderUserId());
String senderNickname = sender != null ? sender.getUserNickname() : "알수없음";

// ✅ 추가: messageId, sentDate, createdAt 설정
dto.setMessageId(messageVO.getChatMessageId());  // ✅ DB에서 생성된 ID
dto.setSenderNickname(senderNickname);
dto.setSentDate(messageVO.getSentDate());
dto.setCreatedAt(messageVO.getSentDate());       // ✅ 동일 값으로 설정
```

**체크 포인트**:
- [ ] `setMessageId()` 추가
- [ ] `setCreatedAt()` 추가

---

### ✅ 1-4. chatMessageMapper.xml에 messageId 반환 추가

**파일**: `backend/moc/src/main/resources/mybatis/mappers/chatMessageMapper.xml`

**수정 내용**: `selectMessagesByRoom` ResultMap에 messageId 추가

```xml
<resultMap id="ChatMessageDTOMap" type="com.cucook.moc.chat.dto.ChatMessageDTO">
    <result property="messageId"       column="chat_message_id"/>  <!-- ✅ 추가 -->
    <result property="chatRoomId"      column="chat_room_id"/>
    <result property="senderUserId"    column="sender_user_id"/>
    <result property="senderNickname"  column="sender_nickname"/>
    <result property="messageTypeCd"   column="message_type_cd"/>
    <result property="messageText"     column="message_text"/>
    <result property="sentDate"        column="sent_date"/>
    <result property="createdAt"       column="sent_date"/>  <!-- ✅ 추가 (동일 컬럼) -->
</resultMap>
```

**체크 포인트**:
- [ ] `messageId` 매핑 추가
- [ ] `createdAt` 매핑 추가

---

## 🟡 Phase 2: 추가 기능 구현 (선택 - 시간 여유 시)

### ✅ 2-1. lastSenderNickname 쿼리 추가

**파일**: `backend/moc/src/main/resources/mybatis/mappers/chatRoomMapper.xml`

**수정 전** (Line 64-82):
```xml
<select id="selectRoomsByUser" resultMap="ChatRoomSummaryMap">
    SELECT
        r.chat_room_id,
        r.shopping_post_id,
        pl.place_name,
        -- 마지막 메시지 텍스트
        (
          SELECT m.message_text
          FROM tb_shopping_chat_message m
          WHERE m.chat_room_id = r.chat_room_id
          ORDER BY m.sent_date DESC
          FETCH FIRST 1 ROWS ONLY
        ) AS last_message,
        r.status_cd,
        r.updated_date AS updated_at
    FROM tb_shopping_chat_room r
    ...
</select>
```

**수정 후**:
```xml
<select id="selectRoomsByUser" resultMap="ChatRoomSummaryMap">
    SELECT
        r.chat_room_id,
        r.shopping_post_id,
        pl.place_name,
        -- 마지막 메시지 텍스트
        (
          SELECT m.message_text
          FROM tb_shopping_chat_message m
          WHERE m.chat_room_id = r.chat_room_id
          ORDER BY m.sent_date DESC
          FETCH FIRST 1 ROWS ONLY
        ) AS last_message,
        -- ✅ 추가: 마지막 발신자 닉네임
        (
          SELECT u.user_nickname
          FROM tb_shopping_chat_message m
          JOIN tb_user u ON m.sender_user_id = u.user_id
          WHERE m.chat_room_id = r.chat_room_id
          ORDER BY m.sent_date DESC
          FETCH FIRST 1 ROWS ONLY
        ) AS last_sender_nickname,
        r.status_cd,
        r.updated_date AS updated_at
    FROM tb_shopping_chat_room r
    ...
</select>
```

**체크 포인트**:
- [ ] `last_sender_nickname` 서브쿼리 추가
- [ ] ResultMap에 매핑 확인

---

### ✅ 2-2. unreadCount 구현 (복잡 - 선택)

**설명**: 미읽은 메시지 수를 계산하려면 "읽음 상태" 테이블이 필요합니다.

**Option A: 간단 버전 (읽음 상태 테이블 없이)**
- 프론트에서 활성 채팅방을 제외하고 모든 채팅방의 unreadCount = 0으로 처리
- 백엔드는 항상 0 반환

**Option B: 완전 버전 (읽음 상태 테이블 추가)**

#### **1) DB 테이블 생성**
```sql
-- 읽음 상태 테이블
CREATE TABLE tb_chat_read_status (
    read_status_id        NUMBER PRIMARY KEY,
    user_id               NUMBER NOT NULL,
    chat_room_id          NUMBER NOT NULL,
    last_read_message_id  NUMBER,  -- 마지막으로 읽은 메시지 ID
    updated_date          TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_read_user FOREIGN KEY (user_id) REFERENCES tb_user(user_id),
    CONSTRAINT fk_read_room FOREIGN KEY (chat_room_id) REFERENCES tb_shopping_chat_room(chat_room_id)
);

-- 시퀀스 생성
CREATE SEQUENCE seq_tb_chat_read_status START WITH 1 INCREMENT BY 1;

-- 유니크 제약 (user + room 조합)
CREATE UNIQUE INDEX idx_read_status_user_room ON tb_chat_read_status(user_id, chat_room_id);
```

#### **2) VO 생성**
**파일**: `backend/moc/src/main/java/com/cucook/moc/chat/vo/ChatReadStatusVO.java`
```java
package com.cucook.moc.chat.vo;

import lombok.*;
import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ChatReadStatusVO {
    private Long readStatusId;
    private Long userId;
    private Long chatRoomId;
    private Long lastReadMessageId;
    private Timestamp updatedDate;
}
```

#### **3) DAO 추가**
**파일**: `backend/moc/src/main/java/com/cucook/moc/chat/dao/ChatReadStatusDAO.java`
```java
package com.cucook.moc.chat.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ChatReadStatusDAO {
    void upsertReadStatus(@Param("userId") Long userId,
                          @Param("chatRoomId") Long chatRoomId,
                          @Param("lastReadMessageId") Long lastReadMessageId);
    
    Long selectLastReadMessageId(@Param("userId") Long userId,
                                  @Param("chatRoomId") Long chatRoomId);
}
```

#### **4) Mapper XML**
**파일**: `backend/moc/src/main/resources/mybatis/mappers/chatReadStatusMapper.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.cucook.moc.chat.dao.ChatReadStatusDAO">

    <!-- MERGE 문으로 upsert 구현 -->
    <update id="upsertReadStatus">
        MERGE INTO tb_chat_read_status t
        USING (
            SELECT #{userId} AS user_id,
                   #{chatRoomId} AS chat_room_id,
                   #{lastReadMessageId} AS last_read_message_id
            FROM dual
        ) s
        ON (t.user_id = s.user_id AND t.chat_room_id = s.chat_room_id)
        WHEN MATCHED THEN
            UPDATE SET
                t.last_read_message_id = s.last_read_message_id,
                t.updated_date = SYSTIMESTAMP
        WHEN NOT MATCHED THEN
            INSERT (read_status_id, user_id, chat_room_id, last_read_message_id, updated_date)
            VALUES (seq_tb_chat_read_status.NEXTVAL, s.user_id, s.chat_room_id, s.last_read_message_id, SYSTIMESTAMP)
    </update>

    <select id="selectLastReadMessageId" resultType="long">
        SELECT last_read_message_id
        FROM tb_chat_read_status
        WHERE user_id = #{userId}
          AND chat_room_id = #{chatRoomId}
    </select>

</mapper>
```

#### **5) chatRoomMapper.xml에 unreadCount 추가**
```xml
<select id="selectRoomsByUser" resultMap="ChatRoomSummaryMap">
    SELECT
        r.chat_room_id,
        r.shopping_post_id,
        pl.place_name,
        (SELECT m.message_text ...) AS last_message,
        (SELECT u.user_nickname ...) AS last_sender_nickname,
        -- ✅ 미읽은 메시지 수
        (
          SELECT COUNT(*)
          FROM tb_shopping_chat_message m
          WHERE m.chat_room_id = r.chat_room_id
            AND m.chat_message_id > COALESCE(
                (SELECT rs.last_read_message_id
                 FROM tb_chat_read_status rs
                 WHERE rs.user_id = #{userId}
                   AND rs.chat_room_id = r.chat_room_id),
                0
            )
        ) AS unread_count,
        r.status_cd,
        r.updated_date AS updated_at
    FROM tb_shopping_chat_room r
    ...
</select>
```

#### **6) Service에 읽음 처리 로직 추가**
**파일**: `backend/moc/src/main/java/com/cucook/moc/chat/service/ShoppingChatRoomService.java`
```java
@Autowired
private ChatReadStatusDAO chatReadStatusDAO;

/**
 * 채팅방 입장 시 읽음 상태 업데이트
 */
public void markAsRead(Long userId, Long chatRoomId, Long lastMessageId) {
    chatReadStatusDAO.upsertReadStatus(userId, chatRoomId, lastMessageId);
}
```

**체크 포인트**:
- [ ] 읽음 상태 테이블 생성
- [ ] VO, DAO, Mapper 추가
- [ ] unreadCount 쿼리 추가
- [ ] 프론트에서 읽음 처리 API 호출

**⚠️ 주의**: 이 기능은 복잡하므로 Phase 3 이후로 미루는 것을 권장합니다.

---

### ✅ 2-3. 참여자 목록 API 구현

**현재 상태**: DAO와 Mapper는 이미 구현되어 있음 ✅

**파일**: `backend/moc/src/main/java/com/cucook/moc/chat/controller/ShoppingChatRoomController.java`

**추가할 코드**:
```java
@Autowired
private ChatParticipantDAO chatParticipantDAO;

/**
 * 채팅방 참여자 목록 조회
 */
@GetMapping("/{chatRoomId}/participants")
public List<ChatParticipantDTO> getParticipants(@PathVariable Long chatRoomId) {
    return chatParticipantDAO.selectParticipantInfos(chatRoomId);
}
```

**체크 포인트**:
- [ ] `ChatParticipantDAO` 주입
- [ ] `/api/chat/rooms/{chatRoomId}/participants` 엔드포인트 추가
- [ ] 프론트엔드 `ChatRoomScreen.js` 주석 해제 (Line 377-391)

---

### ✅ 2-4. 채팅방 삭제 API 구현

**파일**: `backend/moc/src/main/java/com/cucook/moc/chat/dao/ChatRoomDAO.java`

**추가할 메서드**:
```java
void deleteChatRoom(@Param("chatRoomId") Long chatRoomId);
```

**파일**: `backend/moc/src/main/resources/mybatis/mappers/chatRoomMapper.xml`

**추가할 쿼리**:
```xml
<!-- 채팅방 삭제 (soft delete - status 변경) -->
<update id="deleteChatRoom">
    UPDATE tb_shopping_chat_room
    SET status_cd = 'DELETED',
        updated_date = SYSTIMESTAMP
    WHERE chat_room_id = #{chatRoomId}
</update>

<!-- 또는 hard delete -->
<delete id="deleteChatRoom">
    DELETE FROM tb_shopping_chat_room
    WHERE chat_room_id = #{chatRoomId}
</delete>
```

**파일**: `backend/moc/src/main/java/com/cucook/moc/chat/service/ShoppingChatRoomService.java`

**추가할 메서드**:
```java
@Transactional
public void deleteChatRoom(Long chatRoomId) {
    chatRoomDAO.deleteChatRoom(chatRoomId);
}
```

**파일**: `backend/moc/src/main/java/com/cucook/moc/chat/controller/ShoppingChatRoomController.java`

**추가할 엔드포인트**:
```java
/**
 * 채팅방 삭제
 */
@DeleteMapping("/{chatRoomId}")
public void deleteChatRoom(@PathVariable Long chatRoomId) {
    shoppingChatRoomService.deleteChatRoom(chatRoomId);
}
```

**체크 포인트**:
- [ ] DAO 메서드 추가
- [ ] Mapper 쿼리 추가 (soft 또는 hard delete)
- [ ] Service 메서드 추가
- [ ] Controller 엔드포인트 추가

---

### ✅ 2-5. 채팅방 나가기 API 구현

**파일**: `backend/moc/src/main/java/com/cucook/moc/chat/dao/ChatParticipantDAO.java`

**추가할 메서드**:
```java
void updateLeaveDate(@Param("chatRoomId") Long chatRoomId,
                     @Param("userId") Long userId);

void deleteParticipant(@Param("chatRoomId") Long chatRoomId,
                       @Param("userId") Long userId);
```

**파일**: `backend/moc/src/main/resources/mybatis/mappers/chatParticipantMapper.xml`

**추가할 쿼리**:
```xml
<!-- 나가기 (soft delete - leave_date 설정) -->
<update id="updateLeaveDate">
    UPDATE tb_shopping_participant
    SET leave_date = SYSTIMESTAMP
    WHERE chat_room_id = #{chatRoomId}
      AND user_id = #{userId}
</update>

<!-- 나가기 (hard delete) -->
<delete id="deleteParticipant">
    DELETE FROM tb_shopping_participant
    WHERE chat_room_id = #{chatRoomId}
      AND user_id = #{userId}
</delete>
```

**파일**: `backend/moc/src/main/java/com/cucook/moc/chat/service/ShoppingChatRoomService.java`

**추가할 메서드**:
```java
@Transactional
public void leaveRoom(Long chatRoomId, Long userId) {
    // soft delete 방식
    chatParticipantDAO.updateLeaveDate(chatRoomId, userId);
    
    // 또는 hard delete 방식
    // chatParticipantDAO.deleteParticipant(chatRoomId, userId);
}
```

**파일**: `backend/moc/src/main/java/com/cucook/moc/chat/controller/ShoppingChatRoomController.java`

**추가할 엔드포인트**:
```java
/**
 * 채팅방 나가기
 */
@PostMapping("/{chatRoomId}/leave")
public void leaveChatRoom(
    @PathVariable Long chatRoomId,
    @RequestBody Map<String, Long> body
) {
    Long userId = body.get("userId");
    shoppingChatRoomService.leaveRoom(chatRoomId, userId);
}
```

**체크 포인트**:
- [ ] DAO 메서드 추가
- [ ] Mapper 쿼리 추가
- [ ] Service 메서드 추가
- [ ] Controller 엔드포인트 추가

---

### ✅ 2-6. 강퇴 기능 API 구현

**파일**: `backend/moc/src/main/java/com/cucook/moc/chat/controller/ShoppingChatRoomController.java`

**추가할 엔드포인트**:
```java
/**
 * 참여자 강퇴 (방장 전용)
 */
@PostMapping("/{chatRoomId}/kick")
public void kickParticipant(
    @PathVariable Long chatRoomId,
    @RequestBody Map<String, Long> body
) {
    Long userId = body.get("userId");
    Long kickerId = body.get("kickerId");  // 강퇴하는 사람 (방장)
    
    // TODO: 방장 권한 확인 로직 추가
    // if (!isOwner(chatRoomId, kickerId)) {
    //     throw new UnauthorizedException("방장만 강퇴할 수 있습니다.");
    // }
    
    shoppingChatRoomService.leaveRoom(chatRoomId, userId);
}
```

**체크 포인트**:
- [ ] 방장 권한 확인 로직
- [ ] 강퇴 엔드포인트 추가
- [ ] 강퇴 시 시스템 메시지 전송 (선택)

---

## 🟢 Phase 3: 테스트 및 검증

### ✅ 3-1. 백엔드 서버 시작

```bash
cd backend/moc
./gradlew bootRun
```

**확인 사항**:
- [ ] 서버 정상 시작 (포트 8090)
- [ ] WebSocket 엔드포인트 활성화 확인
- [ ] MyBatis 매퍼 로드 확인 (로그)
- [ ] DB 연결 확인

---

### ✅ 3-2. REST API 테스트 (Postman/Insomnia)

#### **1) 채팅방 목록 조회**
```
GET http://localhost:8090/api/chat/rooms/me?userId=12

Expected Response:
[
  {
    "chatRoomId": 1,
    "placeName": "이마트 쌍용점",
    "lastMessage": "안녕하세요",
    "lastSenderNickname": "둘리",
    "unreadCount": 3,
    "statusCd": "OPEN",
    "updatedAt": "2025-12-16T10:30:00"
  }
]
```

**체크 포인트**:
- [ ] 200 OK 응답
- [ ] placeName 포함
- [ ] lastMessage 포함
- [ ] statusCd 포함

#### **2) 과거 메시지 조회**
```
GET http://localhost:8090/api/chat/messages/1?limit=50

Expected Response:
[
  {
    "messageId": 123,
    "chatRoomId": 1,
    "senderUserId": 12,
    "senderNickname": "둘리",
    "messageText": "안녕하세요",
    "messageTypeCd": "TEXT",
    "sentDate": "2025-12-16T10:30:00",
    "createdAt": "2025-12-16T10:30:00"
  }
]
```

**체크 포인트**:
- [ ] 200 OK 응답
- [ ] messageId 포함 ✅
- [ ] senderNickname 포함
- [ ] createdAt 포함 ✅

#### **3) 참여자 목록 조회** (Phase 2 구현 시)
```
GET http://localhost:8090/api/chat/rooms/1/participants

Expected Response:
[
  {
    "userId": 12,
    "nickname": "둘리",
    "ratingScore": 4.5
  }
]
```

---

### ✅ 3-3. WebSocket 테스트

#### **방법 1: 프론트엔드 앱 실행**
```bash
cd frontend/moc
npm start
npm run android --port 3010
```

**테스트 시나리오**:
1. [ ] 로그인 (userId: 12)
2. [ ] 지도 화면 → 채팅 FAB 클릭
3. [ ] 채팅방 목록 표시 확인
4. [ ] 채팅방 클릭
5. [ ] 과거 메시지 로드 확인
6. [ ] 메시지 입력 → 전송
7. [ ] 실시간 메시지 수신 확인
8. [ ] 다른 기기에서 메시지 전송 → 수신 확인

#### **방법 2: WebSocket 클라이언트 도구 (wscat)**
```bash
npm install -g wscat

# 연결
wscat -c ws://localhost:8090/ws-chat

# 구독 (STOMP 프레임)
CONNECT
accept-version:1.1,1.0
heart-beat:10000,10000

^@

SUBSCRIBE
id:sub-0
destination:/topic/room/1

^@

# 메시지 전송
SEND
destination:/app/chat.sendMessage
content-type:application/json

{"chatRoomId":1,"senderUserId":12,"messageTypeCd":"TEXT","messageText":"테스트"}
^@
```

---

### ✅ 3-4. 에러 확인 및 로그 분석

**체크 포인트**:
- [ ] MyBatis 매퍼 로딩 에러 없음
- [ ] WebSocket 연결 에러 없음
- [ ] DB 쿼리 에러 없음
- [ ] Null Pointer Exception 없음
- [ ] CORS 에러 없음

**주요 로그 위치**:
```
[ShoppingChatMessageService] - 메시지 전송/조회 로그
[StompClient] - WebSocket 연결/구독 로그
[MyBatis] - SQL 쿼리 실행 로그
```

---

## 📋 최종 체크리스트

### ✅ Phase 1: 필수 (반드시 완료)
- [ ] **1-1. chatMessageMapper.xml 생성**
  - [ ] insertMessage 쿼리
  - [ ] selectMessagesByRoom 쿼리
  - [ ] 시퀀스 확인 (seq_tb_shopping_chat_message)
  - [ ] 테이블 확인 (tb_shopping_chat_message)

- [ ] **1-2. WebSocket 경로 통일**
  - [ ] WebSocketConfig.java 수정
    - [ ] `/ws-chat` 엔드포인트
    - [ ] `/topic` prefix
    - [ ] `/app` prefix
  - [ ] ShoppingChatStompController.java 수정
    - [ ] `/chat.sendMessage` 경로
  - [ ] ShoppingChatMessageService.java 수정
    - [ ] `/topic/room/` 구독 경로

- [ ] **1-3. DTO 필드 추가**
  - [ ] ChatMessageDTO에 `messageId` 추가
  - [ ] ChatMessageDTO에 `createdAt` 추가
  - [ ] Service에서 `setMessageId()` 호출
  - [ ] Service에서 `setCreatedAt()` 호출

- [ ] **1-4. chatMessageMapper.xml ResultMap 수정**
  - [ ] `messageId` 매핑 추가
  - [ ] `createdAt` 매핑 추가

### ⚠️ Phase 2: 추가 기능 (선택)
- [ ] 2-1. lastSenderNickname 쿼리 추가
- [ ] 2-2. unreadCount 구현 (복잡 - 미룰 수 있음)
- [ ] 2-3. 참여자 목록 API
- [ ] 2-4. 채팅방 삭제 API
- [ ] 2-5. 채팅방 나가기 API
- [ ] 2-6. 강퇴 기능 API

### ✅ Phase 3: 테스트
- [ ] 3-1. 백엔드 서버 시작
- [ ] 3-2. REST API 테스트
  - [ ] 채팅방 목록 조회
  - [ ] 과거 메시지 조회
- [ ] 3-3. WebSocket 테스트
  - [ ] 프론트엔드 연동
  - [ ] 실시간 메시지 송수신
- [ ] 3-4. 에러 확인

---

## 🚨 자주 발생하는 문제 및 해결

### ❌ 문제 1: MyBatis 매퍼 로딩 실패
```
Error: Invalid bound statement (not found): com.cucook.moc.chat.dao.ChatMessageDAO.insertMessage
```

**원인**: chatMessageMapper.xml 파일이 없거나 namespace가 틀림

**해결**:
1. `backend/moc/src/main/resources/mybatis/mappers/chatMessageMapper.xml` 파일 존재 확인
2. namespace가 `com.cucook.moc.chat.dao.ChatMessageDAO`인지 확인
3. 서버 재시작

---

### ❌ 문제 2: WebSocket 연결 실패
```
WebSocket connection to 'ws://localhost:8090/ws-chat' failed
```

**원인**: 백엔드 서버가 시작되지 않았거나 경로가 틀림

**해결**:
1. 백엔드 서버 실행 확인: `http://localhost:8090`
2. WebSocketConfig에서 `/ws-chat` 엔드포인트 확인
3. CORS 설정 확인 (`.setAllowedOriginPatterns("*")`)

---

### ❌ 문제 3: 메시지 전송 후 응답 없음
```
메시지 전송은 되지만 다른 사용자에게 전송되지 않음
```

**원인**: 구독 경로가 틀리거나 브로드캐스트 경로가 틀림

**해결**:
1. `ShoppingChatMessageService.java`에서 `/topic/room/{chatRoomId}` 확인
2. 프론트엔드 `StompClient.js`에서 `/topic/room/{chatRoomId}` 구독 확인
3. WebSocketConfig에서 `/topic` prefix 확인

---

### ❌ 문제 4: DB 시퀀스가 없음
```
ORA-02289: sequence does not exist
```

**원인**: `seq_tb_shopping_chat_message` 시퀀스가 DB에 없음

**해결**:
```sql
-- Oracle SQL Developer에서 실행
CREATE SEQUENCE seq_tb_shopping_chat_message START WITH 1 INCREMENT BY 1;
```

---

### ❌ 문제 5: 프론트엔드에서 messageId가 undefined
```
console: message.messageId = undefined
```

**원인**: 백엔드 DTO에 `messageId` 필드가 없거나 설정 안 함

**해결**:
1. `ChatMessageDTO.java`에 `private Long messageId;` 추가
2. `ShoppingChatMessageService.java`에서 `dto.setMessageId(messageVO.getChatMessageId());` 추가
3. `chatMessageMapper.xml`에 `<result property="messageId" column="chat_message_id"/>` 추가

---

## 📞 도움말

### 작업 순서 (권장)
1. **chatMessageMapper.xml 생성** (가장 중요!)
2. **WebSocket 경로 통일** (3개 파일 수정)
3. **DTO 필드 추가** (2개 파일 수정)
4. **서버 시작 및 테스트**
5. **프론트엔드 연동 테스트**
6. **추가 기능 구현** (선택)

### 예상 소요 시간
- Phase 1 (필수): **30분 ~ 1시간**
- Phase 2 (추가 기능): **1시간 ~ 2시간**
- Phase 3 (테스트): **30분**

### Git 커밋 전략
```bash
# Phase 1 완료 후
git add .
git commit -m "feat: 채팅 백엔드 필수 기능 구현 (WebSocket, MessageMapper)"

# Phase 2 완료 후
git add .
git commit -m "feat: 채팅 추가 기능 구현 (참여자 목록, 삭제 API)"

# 테스트 완료 후
git add .
git commit -m "test: 채팅 기능 통합 테스트 완료"
```

---

## 🎯 완료 후 확인 사항

✅ **모든 작업 완료 시 다음 확인**:
- [ ] 프론트엔드에서 채팅방 목록 로드됨
- [ ] 과거 메시지 표시됨
- [ ] 메시지 전송 시 실시간으로 수신됨
- [ ] 여러 기기에서 동시 테스트 성공
- [ ] 입장/퇴장 시스템 메시지 표시됨
- [ ] 에러 없이 안정적으로 작동함

🎉 **축하합니다! 채팅 시스템 백엔드 개발 완료!** 🎉

---

**작성일**: 2025년 12월 16일  
**다음 업데이트**: 테스트 결과 반영 후
