import axios from 'axios';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 기본 URL (백엔드 개발자가 제공하는 주소로 변경 필요)
const BASE_URL =
  Platform.OS === 'android'
    ? 'http://192.168.50.117:8090/api'
    : 'http://localhost:8090/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10초
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ userId 가져오기 헬퍼
const getUserIdOrThrow = async () => {
  const raw = await AsyncStorage.getItem('userId');
  if (!raw) throw new Error('userId가 없습니다. 로그인 정보를 확인해주세요.');
  const userId = Number(raw);
  if (Number.isNaN(userId)) throw new Error('userId 형식이 올바르지 않습니다.');
  return userId;
};

// 요청 인터셉터 (Request Interceptor)
api.interceptors.request.use(
  async config => {
    try {
      // 요청 시작 시간 기록
      config.metadata = {startTime: new Date()};

      // (선택) 토큰 있으면 헤더에 추가
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // ✅ A안: 필요한 요청에만 userId 자동 첨부
      if (config.meta?.requiresUserId) {
        const userId = await getUserIdOrThrow();
        config.params = {...(config.params || {}), userId};
      }

      // 🌐 상세한 요청 로그
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🌐 API 요청');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 Method: ${config.method?.toUpperCase()}`);
      console.log(`📍 URL: ${config.baseURL}${config.url}`);

      if (config.params && Object.keys(config.params).length > 0) {
        console.log('📤 Query Params:', JSON.stringify(config.params, null, 2));
      }

      if (config.data) {
        console.log('📤 Request Body:', JSON.stringify(config.data, null, 2));
      }

      if (config.headers) {
        const headers = {...config.headers};
        if (headers.Authorization) {
          headers.Authorization = 'Bearer ***';
        }
        console.log('📋 Headers:', JSON.stringify(headers, null, 2));
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      return config;
    } catch (error) {
      console.error('❌ Request Interceptor 에러:', error);
      return Promise.reject(error);
    }
  },
  error => Promise.reject(error),
);

// 응답 인터셉터 (Response Interceptor)
// 에러 처리 및 토큰 갱신 등
api.interceptors.response.use(
  response => {
    // 응답 시간 계산
    const duration = response.config.metadata?.startTime
      ? new Date() - response.config.metadata.startTime
      : 0;

    // 📥 상세한 응답 로그
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ API 응답 성공');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Method: ${response.config.method?.toUpperCase()}`);
    const fullUrl = response.config.url?.startsWith('http')
      ? response.config.url
      : `${response.config.baseURL}${response.config.url}`;
    console.log(`📍 URL: ${fullUrl}`);
    console.log(`📊 Status: ${response.status} ${response.statusText || 'OK'}`);
    console.log(`⏱️  Duration: ${duration}ms`);

    if (response.headers) {
      console.log(
        '📋 Response Headers:',
        JSON.stringify(response.headers, null, 2),
      );
    }

    console.log('📥 Response Data:', JSON.stringify(response, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 응답 데이터만 반환
    return response.data; // ✅ 주의: 이제 호출부는 res.data가 아니라 res 자체가 data
  },
  async error => {
    // 응답 시간 계산
    const duration = error.config?.metadata?.startTime
      ? new Date() - error.config.metadata.startTime
      : 0;

    // 응답이 있는 경우 (서버 에러)
    if (error.response) {
      const {status, data} = error.response;

      // ❌ 상세한 에러 로그
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ API 에러 응답');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 Method: ${error.config?.method?.toUpperCase()}`);
      const fullUrl = error.config?.url?.startsWith('http')
        ? error.config.url
        : `${error.config?.baseURL}${error.config?.url}`;
      console.log(`📍 URL: ${fullUrl}`);
      console.log(`📊 Status: ${status}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log('📥 Error Data:', JSON.stringify(data, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // 401 에러 (인증 실패)
      if (status === 401) {
        console.error('🔒 인증 실패: 다시 로그인해주세요.');
        // 사용자 정보 삭제
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('userNickname');
        await AsyncStorage.removeItem('userName');
        // 로그인 화면으로 이동
        // NavigationService.navigate('Login');
      }

      // 403 에러 (권한 없음)
      if (status === 403) {
        console.error('🚫 접근 권한이 없습니다.');
        // 권한 없음 알림 표시
      }

      // 404 에러 (리소스 없음)
      if (status === 404) {
        console.error('🔍 요청한 리소스를 찾을 수 없습니다.');
      }

      // 500 에러 (서버 에러)
      if (status === 500) {
        console.error('💥 서버 에러가 발생했습니다.');
        // 서버 에러 알림 표시
      }
    }
    // 응답이 없는 경우 (네트워크 에러)
    else if (error.request) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ 네트워크 에러');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 Method: ${error.config?.method?.toUpperCase()}`);
      const fullUrl = error.config?.url?.startsWith('http')
        ? error.config.url
        : `${error.config?.baseURL}${error.config?.url}`;
      console.log(`📍 URL: ${fullUrl}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log('📛 Error:', error.message);
      console.log('💡 Tip: 서버가 실행 중인지, 네트워크 연결을 확인하세요.');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      // 네트워크 에러 알림 표시
    }
    // 기타 에러
    else {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ 에러');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📛 Error:', error.message);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    return Promise.reject(error);
  },
);
export {getUserIdOrThrow};
export default api;
