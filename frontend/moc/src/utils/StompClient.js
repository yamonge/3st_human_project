import {Client} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {Platform} from 'react-native';

/**
 * WebSocket STOMP 클라이언트 (싱글톤)
 *
 * 사용법:
 * 1. 연결: StompClient.connect(userId, onConnected, onError)
 * 2. 구독: StompClient.subscribe(chatRoomId, callback)
 * 3. 전송: StompClient.sendMessage(messageData)
 * 4. 종료: StompClient.disconnect()
 */
class StompClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map(); // 구독 관리 (roomId -> subscription)
    this.messageQueue = []; // 연결 전 메시지 큐
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3초
  }

  /**
   * WebSocket 서버 URL 가져오기
   */
  getWebSocketUrl() {
    const BASE_URL =
      Platform.OS === 'android'
        ? 'http://192.168.50.117:8090' // Android 에뮬레이터 → PC
        : 'http://localhost:8090'; // iOS 시뮬레이터 / 웹

    return `${BASE_URL}/ws-chat`; // WebSocket 엔드포인트
  }

  /**
   * WebSocket 연결
   * @param {number} userId - 현재 사용자 ID
   * @param {function} onConnected - 연결 성공 콜백
   * @param {function} onError - 연결 실패 콜백
   */
  connect(userId, onConnected, onError) {
    if (this.isConnected) {
      console.log('✅ 이미 WebSocket에 연결되어 있습니다.');
      if (onConnected) onConnected();
      return;
    }

    console.log('🔌 WebSocket 연결 시작...', {
      url: this.getWebSocketUrl(),
      userId,
    });

    try {
      // SockJS 소켓 생성 (fallback 지원)
      const socket = new SockJS(this.getWebSocketUrl());

      // STOMP 클라이언트 생성
      this.client = new Client({
        webSocketFactory: () => socket,

        // 재연결 설정
        reconnectDelay: this.reconnectDelay,

        // 하트비트 설정 (연결 유지)
        heartbeatIncoming: 4000, // 4초마다 서버 → 클라이언트
        heartbeatOutgoing: 4000, // 4초마다 클라이언트 → 서버

        // 디버그 로그
        debug: str => {
          console.log('🐛 STOMP Debug:', str);
        },

        // 연결 성공 핸들러
        onConnect: frame => {
          console.log('✅ WebSocket 연결 성공!', frame);
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // 큐에 쌓인 메시지 전송
          this.flushMessageQueue();

          if (onConnected) onConnected();
        },

        // 연결 해제 핸들러
        onDisconnect: () => {
          console.log('❌ WebSocket 연결 해제');
          this.isConnected = false;
        },

        // WebSocket 에러 핸들러
        onWebSocketError: error => {
          console.error('💥 WebSocket 에러:', error);
          if (onError) onError(error);
        },

        // STOMP 에러 핸들러
        onStompError: frame => {
          console.error('💥 STOMP 에러:', frame.headers['message']);
          console.error('상세:', frame.body);
          if (onError) onError(frame);
        },

        // 연결 종료 시 재연결 시도
        onWebSocketClose: event => {
          console.log('🔌 WebSocket 연결 종료:', event.reason);
          this.isConnected = false;

          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(
              `🔄 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`,
            );
          } else {
            console.error('❌ 최대 재연결 시도 횟수 초과');
          }
        },
      });

      // 연결 활성화
      this.client.activate();
    } catch (error) {
      console.error('💥 WebSocket 연결 실패:', error);
      if (onError) onError(error);
    }
  }

  /**
   * 채팅방 구독 (실시간 메시지 수신)
   * @param {number} chatRoomId - 채팅방 ID
   * @param {function} callback - 메시지 수신 콜백
   * @returns {object} subscription 객체 (unsubscribe 가능)
   */
  subscribe(chatRoomId, callback) {
    if (!this.client || !this.isConnected) {
      console.error(
        '❌ WebSocket이 연결되지 않았습니다. 먼저 connect()를 호출하세요.',
      );
      return null;
    }

    // 이미 구독 중인지 확인
    if (this.subscriptions.has(chatRoomId)) {
      console.log(`⚠️ 채팅방 ${chatRoomId}는 이미 구독 중입니다.`);
      return this.subscriptions.get(chatRoomId);
    }

    console.log(`📡 채팅방 구독 시작: /topic/room/${chatRoomId}`);

    // 구독
    const subscription = this.client.subscribe(
      `/topic/room/${chatRoomId}`,
      message => {
        try {
          const data = JSON.parse(message.body);
          console.log('📨 메시지 수신:', data);
          callback(data);
        } catch (error) {
          console.error('💥 메시지 파싱 실패:', error);
        }
      },
    );

    // 구독 저장
    this.subscriptions.set(chatRoomId, subscription);

    return subscription;
  }

  /**
   * 채팅방 구독 해제
   * @param {number} chatRoomId - 채팅방 ID
   */
  unsubscribe(chatRoomId) {
    const subscription = this.subscriptions.get(chatRoomId);

    if (subscription) {
      console.log(`📡 채팅방 구독 해제: /topic/room/${chatRoomId}`);
      subscription.unsubscribe();
      this.subscriptions.delete(chatRoomId);
    }
  }

  /**
   * 모든 구독 해제
   */
  unsubscribeAll() {
    console.log('📡 모든 채팅방 구독 해제');
    this.subscriptions.forEach((subscription, chatRoomId) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  /**
   * 메시지 전송
   * @param {object} messageData - { chatRoomId, senderUserId, senderNickname, messageText }
   */
  sendMessage(messageData) {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️ WebSocket 연결 대기 중... 메시지를 큐에 추가합니다.');
      this.messageQueue.push(messageData);
      return;
    }

    console.log('📤 메시지 전송:', messageData);

    try {
      this.client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          chatRoomId: messageData.chatRoomId,
          senderUserId: messageData.senderUserId,
          senderNickname: messageData.senderNickname,
          messageTypeCd: messageData.messageTypeCd || 'TEXT',
          messageText: messageData.messageText,
        }),
      });
    } catch (error) {
      console.error('💥 메시지 전송 실패:', error);
    }
  }

  /**
   * 사용자 입장 알림
   * @param {number} chatRoomId - 채팅방 ID
   * @param {number} senderUserId - 사용자 ID
   * @param {string} senderNickname - 사용자 닉네임
   */
  sendJoinMessage(chatRoomId, senderUserId, senderNickname) {
    if (!this.client || !this.isConnected) {
      console.error('❌ WebSocket이 연결되지 않았습니다.');
      return;
    }

    console.log('🚪 입장 알림 전송:', {chatRoomId, senderNickname});

    try {
      this.client.publish({
        destination: '/app/chat.join',
        body: JSON.stringify({
          chatRoomId,
          senderUserId,
          senderNickname,
          messageTypeCd: 'SYSTEM',
        }),
      });
    } catch (error) {
      console.error('💥 입장 알림 전송 실패:', error);
    }
  }

  /**
   * 사용자 퇴장 알림
   * @param {number} chatRoomId - 채팅방 ID
   * @param {number} senderUserId - 사용자 ID
   * @param {string} senderNickname - 사용자 닉네임
   */
  sendLeaveMessage(chatRoomId, senderUserId, senderNickname) {
    if (!this.client || !this.isConnected) {
      console.error('❌ WebSocket이 연결되지 않았습니다.');
      return;
    }

    console.log('🚪 퇴장 알림 전송:', {chatRoomId, senderNickname});

    try {
      this.client.publish({
        destination: '/app/chat.leave',
        body: JSON.stringify({
          chatRoomId,
          senderUserId,
          senderNickname,
          messageTypeCd: 'SYSTEM',
        }),
      });
    } catch (error) {
      console.error('💥 퇴장 알림 전송 실패:', error);
    }
  }

  /**
   * 큐에 쌓인 메시지 전송 (연결 후)
   */
  flushMessageQueue() {
    if (this.messageQueue.length === 0) return;

    console.log(`📤 큐에 쌓인 메시지 ${this.messageQueue.length}개 전송`);

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  /**
   * WebSocket 연결 종료
   */
  disconnect() {
    if (!this.client) {
      console.log('⚠️ WebSocket이 이미 종료되었습니다.');
      return;
    }

    console.log('🔌 WebSocket 연결 종료...');

    // 모든 구독 해제
    this.unsubscribeAll();

    // 연결 종료
    this.client.deactivate();
    this.client = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;

    console.log('✅ WebSocket 연결 종료 완료');
  }

  /**
   * 연결 상태 확인
   * @returns {boolean} 연결 여부
   */
  isActive() {
    return this.isConnected && this.client?.connected;
  }

  /**
   * 현재 구독 중인 채팅방 목록
   * @returns {Array<number>} 채팅방 ID 배열
   */
  getSubscribedRooms() {
    return Array.from(this.subscriptions.keys());
  }
}

// 싱글톤 인스턴스 생성 및 export
export default new StompClient();
