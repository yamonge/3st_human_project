// 파일: src/screens/test_junseo.js

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import axios from 'axios';

const BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8090' : 'http://localhost:8090';

const TestJunseo = () => {
  // 로그인용
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  // 현재 로그인된 유저
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentNickname, setCurrentNickname] = useState(null);

  // 게시글/채팅방 관련
  const [shoppingPostId, setShoppingPostId] = useState(null);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [maxPersonCnt, setMaxPersonCnt] = useState('3');
  const [description, setDescription] =
    useState('테스트 같이 장보기 방입니다.');

  // 채팅 메시지 관련
  const [messageText, setMessageText] = useState('');

  const [log, setLog] = useState('');

  const appendLog = msg => {
    console.log(msg);
    setLog(prev => prev + msg + '\n');
  };

  // =========================
  // 1. 로그인
  // =========================
  const handleLogin = async () => {
    if (!userEmail || !userPassword) {
      appendLog('이메일/비밀번호를 입력하세요.');
      return;
    }

    try {
      appendLog(`로그인 요청 중... (${userEmail})`);
      const body = {
        userEmail,
        userPassword,
      };

      const res = await axios.post(`${BASE_URL}/api/auth/login`, body);
      setCurrentUserId(res.data.userId);
      setCurrentNickname(res.data.userNickname);

      appendLog(
        `✅ 로그인 성공 → userId=${res.data.userId}, nickname=${res.data.userNickname}`,
      );
    } catch (e) {
      appendLog(
        '❌ 로그인 실패: ' +
          (e.response?.data?.message || e.message || '알 수 없는 오류'),
      );
    }
  };

  // =========================
  // 2. (관리자) 게시글 + 채팅방 생성
  // =========================
  const handleCreateShoppingPostAndRoom = async () => {
    if (!currentUserId) {
      appendLog(
        '먼저 로그인해서 currentUserId를 확보하세요. (관리자 계정으로)',
      );
      return;
    }

    try {
      appendLog(
        `같이 장보기 게시글 + 채팅방 생성 요청 중... (writerUserId=${currentUserId})`,
      );

      const now = new Date();
      const meet = new Date(now.getTime() + 60 * 60 * 1000);
      const meetIso = meet.toISOString().slice(0, 19); // "YYYY-MM-DDTHH:mm:ss"

      // body에는 컨트롤러의 ShoppingPostCreateRequestDTO 필드만
      const body = {
        placeId: 1, // 테스트용 place_id (DB에 있는 값으로 맞춰줘)
        meetDatetime: meetIso,
        minPersonCnt: 2,
        maxPersonCnt: parseInt(maxPersonCnt || '3', 10),
        description: description || '테스트 방',
      };

      // userId는 @RequestParam 으로 쿼리스트링에
      const res = await axios.post(`${BASE_URL}/api/shopping-posts`, body, {
        params: {
          userId: currentUserId, // ← 여기!
        },
      });

      setShoppingPostId(res.data.shoppingPostId);
      setChatRoomId(res.data.chatRoomId);

      appendLog(
        `✅ 게시글 + 채팅방 생성 완료 → shoppingPostId=${res.data.shoppingPostId}, chatRoomId=${res.data.chatRoomId}`,
      );
    } catch (e) {
      appendLog(
        '❌ 게시글/채팅방 생성 실패: ' +
          (e.response?.data?.message || e.message || '알 수 없는 오류'),
      );
    }
  };

  // =========================
  // 3. 게시글(=채팅방)에 참여
  // =========================
  const handleJoinShoppingPost = async () => {
    if (!currentUserId || !shoppingPostId) {
      appendLog(
        'currentUserId와 shoppingPostId가 필요합니다. (로그인 + 방 생성부터 진행)',
      );
      return;
    }

    try {
      appendLog(
        `게시글 참여 요청 중... (postId=${shoppingPostId}, userId=${currentUserId})`,
      );

      await axios.post(
        `${BASE_URL}/api/shopping-posts/${shoppingPostId}/join`,
        null,
        {params: {userId: currentUserId}},
      );

      appendLog('✅ 게시글/채팅방 참여 성공');
    } catch (e) {
      appendLog(
        '❌ 게시글 참여 실패: ' +
          (e.response?.data?.message || e.message || '알 수 없는 오류'),
      );
    }
  };

  // =========================
  // 4. 채팅 메시지 전송
  // =========================
  const handleSendMessage = async () => {
    if (!currentUserId || !chatRoomId) {
      appendLog(
        'currentUserId와 chatRoomId가 필요합니다. (로그인 + 방 생성/참여부터 진행)',
      );
      return;
    }
    if (!messageText.trim()) {
      appendLog('보낼 메시지를 입력하세요.');
      return;
    }

    try {
      appendLog(
        `메시지 전송 중... (room=${chatRoomId}, user=${currentUserId}, text="${messageText}")`,
      );

      const body = {
        senderUserId: currentUserId,
        messageText,
      };

      await axios.post(
        `${BASE_URL}/api/chat/rooms/${chatRoomId}/messages`,
        body,
      );

      appendLog('✅ 메시지 전송 성공');
      setMessageText('');
    } catch (e) {
      appendLog(
        '❌ 메시지 전송 실패: ' +
          (e.response?.data?.message || e.message || '알 수 없는 오류'),
      );
    }
  };

  // =========================
  // 5. 채팅 메시지 목록 조회
  // =========================
  const handleLoadMessages = async () => {
    if (!chatRoomId) {
      appendLog('chatRoomId를 먼저 확인하세요.');
      return;
    }

    try {
      appendLog(`메시지 목록 조회 중... (room=${chatRoomId})`);

      const res = await axios.get(
        `${BASE_URL}/api/chat/rooms/${chatRoomId}/messages`,
      );

      appendLog('📨 메시지 목록:');
      res.data.forEach(m => {
        appendLog(
          ` - [${m.sentDate}] user=${m.senderUserId}, text="${m.messageText}"`,
        );
      });
    } catch (e) {
      appendLog(
        '❌ 메시지 조회 실패: ' +
          (e.response?.data?.message || e.message || '알 수 없는 오류'),
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>test_junseo – 로그인 → 채팅 테스트</Text>
      <Text style={styles.baseUrl}>BASE_URL: {BASE_URL}</Text>

      <Text style={styles.info}>
        현재 로그인: userId={currentUserId ?? '없음'} / nickname=
        {currentNickname ?? '없음'}
      </Text>
      <Text style={styles.info}>
        shoppingPostId={shoppingPostId ?? '없음'} / chatRoomId=
        {chatRoomId ?? '없음'}
      </Text>

      {/* 로그인 영역 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. 로그인</Text>
        <TextInput
          style={styles.input}
          placeholder="이메일 (userEmail)"
          value={userEmail}
          onChangeText={setUserEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 (userPassword)"
          value={userPassword}
          onChangeText={setUserPassword}
          secureTextEntry
        />
        <Button title="로그인" onPress={handleLogin} />
      </View>

      {/* 게시글 + 채팅방 생성 (관리자 계정으로) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          2. (관리자) 같이 장보기 게시글 + 채팅방 생성
        </Text>
        <TextInput
          style={styles.input}
          placeholder="최대 인원수 (maxPersonCnt)"
          value={maxPersonCnt}
          onChangeText={setMaxPersonCnt}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="게시글 설명"
          value={description}
          onChangeText={setDescription}
        />
        <Button
          title="게시글 + 채팅방 생성"
          onPress={handleCreateShoppingPostAndRoom}
        />
      </View>

      {/* 게시글(채팅방) 참여 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          3. 현재 로그인 계정으로 게시글(채팅방) 참여
        </Text>
        <Button title="게시글 참여" onPress={handleJoinShoppingPost} />
      </View>

      {/* 채팅 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. 채팅 보내기 / 조회</Text>
        <TextInput
          style={styles.input}
          placeholder="보낼 메시지"
          value={messageText}
          onChangeText={setMessageText}
        />
        <Button title="메시지 전송" onPress={handleSendMessage} />
        <View style={{height: 8}} />
        <Button title="메시지 목록 조회" onPress={handleLoadMessages} />
      </View>

      {/* 로그 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>로그</Text>
        <Text style={styles.log}>{log}</Text>
      </View>
    </ScrollView>
  );
};

export default TestJunseo;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#fff'},
  title: {fontSize: 20, fontWeight: 'bold', marginBottom: 4},
  baseUrl: {fontSize: 12, color: '#666', marginBottom: 8},
  info: {fontSize: 12, color: '#333'},
  section: {
    marginTop: 16,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 8},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  log: {
    minHeight: 120,
    fontSize: 12,
    color: '#333',
    backgroundColor: '#f7f7f7',
    padding: 8,
    borderRadius: 6,
  },
});
