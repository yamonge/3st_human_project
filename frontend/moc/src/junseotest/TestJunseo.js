// TestJunseo.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';

//  - Android 에뮬레이터: 10.0.2.2
//  - iOS 시뮬레이터: localhost
//  - 실제 폰: PC의 IP 주소 (예: 192.168.0.10)
// 상황에 맞게 이 부분만 바꿔서 쓰면 돼.
const BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8090' : 'http://localhost:8090';

export default function TestJunseo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 로그인 API 호출
  const handleLoginTest = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: email,
          userPassword: password,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.log('Login error response:', errorText);
        Alert.alert('로그인 실패', `HTTP ${res.status}: ${errorText}`);
        return;
      }

      const data = await res.json();
      console.log('Login success:', data);

      // data 안에는 LoginResponseDTO 구조가 올 거야
      // { userId, userEmail, userName, userNickname, userType, userStatus }
      Alert.alert(
        '로그인 성공',
        `userId: ${data.userId}\n닉네임: ${data.userNickname || ''}`,
      );

      // TODO: 여기서 userId, 토큰 등을 전역 상태/AsyncStorage에 저장하면 됨
      // 예) setUser(data), AsyncStorage.setItem('userId', String(data.userId)) 등
    } catch (e) {
      console.error(e);
      Alert.alert(
        '에러',
        '서버에 연결할 수 없습니다.\n콘솔 로그를 확인해 주세요.',
      );
    }
  };

  // (옵션) FCM 토큰 전송 테스트용 더미 함수 예시
  // 실제 FCM 토큰을 얻어서 userId와 함께 보내면 됨.
  const handleSendFcmTokenTest = async () => {
    const dummyUserId = 1; // 테스트용: 실제로는 로그인 응답에서 받은 userId 사용
    const dummyToken = 'DUMMY_FCM_TOKEN_123';
    const deviceOs = Platform.OS;
    const deviceVersion = String(Platform.Version);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: dummyUserId,
          fcmToken: dummyToken,
          deviceOs,
          deviceVersion,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.log('FCM token error response:', errorText);
        Alert.alert('FCM 토큰 전송 실패', `HTTP ${res.status}: ${errorText}`);
        return;
      }

      Alert.alert('성공', 'FCM 토큰 전송 테스트 완료!');
    } catch (e) {
      console.error(e);
      Alert.alert(
        '에러',
        '서버에 연결할 수 없습니다.\n콘솔 로그를 확인해 주세요.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Junseo 테스트 화면</Text>

      <Text style={styles.label}>이메일 (user_email)</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일을 입력하세요"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>비밀번호</Text>
      <TextInput
        style={styles.input}
        placeholder="비밀번호를 입력하세요"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.buttonWrapper}>
        <Button title="로그인 API 테스트" onPress={handleLoginTest} />
      </View>

      <View style={styles.buttonWrapper}>
        <Button
          title="FCM 토큰 전송 테스트(더미)"
          onPress={handleSendFcmTokenTest}
        />
      </View>

      <Text style={styles.helperText}>
        ※ 에뮬레이터/실기기 환경에 따라 BASE_URL만 맞게 바꿔서 쓰면 돼.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonWrapper: {
    marginTop: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 24,
  },
});
