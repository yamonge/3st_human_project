import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 기본 URL (백엔드 개발자가 제공하는 주소로 변경 필요)
const BASE_URL = 'http://localhost:8080/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10초
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (Request Interceptor)
// 모든 요청에 토큰을 자동으로 추가
api.interceptors.request.use(
  async config => {
    try {
      // AsyncStorage에서 토큰 가져오기
      const token = await AsyncStorage.getItem('accessToken');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      console.log('API 요청:', config.method?.toUpperCase(), config.url);
      return config;
    } catch (error) {
      console.error('Request Interceptor 에러:', error);
      return config;
    }
  },
  error => {
    console.error('Request 에러:', error);
    return Promise.reject(error);
  },
);

// 응답 인터셉터 (Response Interceptor)
// 에러 처리 및 토큰 갱신 등
api.interceptors.response.use(
  response => {
    console.log('API 응답:', response.status, response.config.url);
    // 응답 데이터만 반환
    return response.data;
  },
  async error => {
    const originalRequest = error.config;

    // 응답이 있는 경우 (서버 에러)
    if (error.response) {
      const {status, data} = error.response;

      console.error(`API 에러 [${status}]:`, data?.message || error.message);

      // 401 에러 (인증 실패) - 토큰 만료 또는 유효하지 않음
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Refresh Token으로 새로운 Access Token 발급
          const refreshToken = await AsyncStorage.getItem('refreshToken');

          if (refreshToken) {
            const response = await axios.post(`${BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const {accessToken} = response.data;

            // 새로운 토큰 저장
            await AsyncStorage.setItem('accessToken', accessToken);

            // 원래 요청 재시도
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh Token도 만료된 경우 → 로그아웃 처리
          console.error('토큰 갱신 실패:', refreshError);
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');

          // TODO: 로그인 화면으로 이동
          // NavigationService.navigate('Login');
        }
      }

      // 403 에러 (권한 없음)
      if (status === 403) {
        console.error('접근 권한이 없습니다.');
        // TODO: 권한 없음 알림 표시
      }

      // 404 에러 (리소스 없음)
      if (status === 404) {
        console.error('요청한 리소스를 찾을 수 없습니다.');
      }

      // 500 에러 (서버 에러)
      if (status === 500) {
        console.error('서버 에러가 발생했습니다.');
        // TODO: 서버 에러 알림 표시
      }
    }
    // 응답이 없는 경우 (네트워크 에러)
    else if (error.request) {
      console.error('네트워크 에러:', error.message);
      // TODO: 네트워크 에러 알림 표시
    }
    // 기타 에러
    else {
      console.error('에러:', error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
