import api from './axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 인증 관련 API
 * 백엔드 개발자가 제공하는 API 엔드포인트에 맞춰 수정 필요
 */
export const authAPI = {
  /**
   * 일반 로그인 (이메일 + 비밀번호)
   * @param {string} email - 사용자 이메일
   * @param {string} password - 비밀번호
   * @returns {Promise} 로그인 결과 (토큰 포함)
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      // 토큰 저장
      if (response.accessToken) {
        await AsyncStorage.setItem('accessToken', response.accessToken);
      }
      if (response.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.refreshToken);
      }
      // 사용자 정보 저장 (선택사항)
      if (response.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('로그인 에러:', error);
      throw error;
    }
  },

  /**
   * 구글 소셜 로그인
   * @param {string} idToken - 구글에서 받은 ID 토큰
   * @returns {Promise} 로그인 결과
   */
  googleLogin: async idToken => {
    try {
      const response = await api.post('/auth/google', {
        idToken,
      });

      // 토큰 저장
      if (response.accessToken) {
        await AsyncStorage.setItem('accessToken', response.accessToken);
      }
      if (response.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.refreshToken);
      }
      if (response.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('구글 로그인 에러:', error);
      throw error;
    }
  },

  /**
   * 페이스북 소셜 로그인
   * @param {string} accessToken - 페이스북에서 받은 액세스 토큰
   * @returns {Promise} 로그인 결과
   */
  facebookLogin: async accessToken => {
    try {
      const response = await api.post('/auth/facebook', {
        accessToken,
      });

      // 토큰 저장
      if (response.accessToken) {
        await AsyncStorage.setItem('accessToken', response.accessToken);
      }
      if (response.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.refreshToken);
      }
      if (response.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('페이스북 로그인 에러:', error);
      throw error;
    }
  },

  /**
   * 카카오 소셜 로그인
   * @param {string} accessToken - 카카오에서 받은 액세스 토큰
   * @returns {Promise} 로그인 결과
   */
  kakaoLogin: async accessToken => {
    try {
      const response = await api.post('/auth/kakao', {
        accessToken,
      });

      // 토큰 저장
      if (response.accessToken) {
        await AsyncStorage.setItem('accessToken', response.accessToken);
      }
      if (response.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.refreshToken);
      }
      if (response.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('카카오 로그인 에러:', error);
      throw error;
    }
  },

  /**
   * 로그아웃
   * @returns {Promise} 로그아웃 결과
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');

      // 로컬 저장소에서 토큰 삭제
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');

      return {success: true};
    } catch (error) {
      console.error('로그아웃 에러:', error);
      // 에러가 발생해도 로컬 토큰은 삭제
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      throw error;
    }
  },

  /**
   * 토큰 갱신
   * @returns {Promise} 새로운 액세스 토큰
   */
  refreshToken: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('Refresh Token이 없습니다.');
      }

      const response = await api.post('/auth/refresh', {
        refreshToken,
      });

      // 새로운 토큰 저장
      if (response.accessToken) {
        await AsyncStorage.setItem('accessToken', response.accessToken);
      }

      return response;
    } catch (error) {
      console.error('토큰 갱신 에러:', error);
      throw error;
    }
  },

  /**
   * 현재 로그인한 사용자 정보 가져오기
   * @returns {Promise} 사용자 정보
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');

      // 사용자 정보 저장
      if (response.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('사용자 정보 조회 에러:', error);
      throw error;
    }
  },

  /**
   * 회원가입
   * @param {Object} userData - 사용자 정보 (email, password, nickname 등)
   * @returns {Promise} 회원가입 결과
   */
  signup: async userData => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response;
    } catch (error) {
      console.error('회원가입 에러:', error);
      throw error;
    }
  },

  /**
   * 이메일 중복 체크
   * @param {string} email - 확인할 이메일
   * @returns {Promise<boolean>} 사용 가능 여부 (true: 사용 가능, false: 중복)
   */
  checkEmail: async email => {
    try {
      const response = await api.post('/auth/check-email', {email});
      return response; // { available: true/false }
    } catch (error) {
      console.error('이메일 중복 체크 에러:', error);
      throw error;
    }
  },

  /**
   * 닉네임 중복 체크
   * @param {string} nickname - 확인할 닉네임
   * @returns {Promise<boolean>} 사용 가능 여부 (true: 사용 가능, false: 중복)
   */
  checkNickname: async nickname => {
    try {
      const response = await api.post('/auth/check-nickname', {nickname});
      return response; // { available: true/false }
    } catch (error) {
      console.error('닉네임 중복 체크 에러:', error);
      throw error;
    }
  },

  /**
   * 아이디 찾기 (이름 + 생년월일)
   * @param {string} name - 사용자 이름
   * @param {string} birthDate - 생년월일 (YYYY-MM-DD)
   * @returns {Promise} 마스킹된 이메일 정보
   */
  findId: async (name, birthDate) => {
    try {
      const response = await api.post('/auth/find-id', {
        name,
        birthDate,
      });
      return response; // { maskedEmail: 'abc***@example.com', registeredDate: '2024-01-01' }
    } catch (error) {
      console.error('아이디 찾기 에러:', error);
      throw error;
    }
  },

  /**
   * 임시 비밀번호 발송 (이메일 + 이름 + 생년월일)
   * @param {string} email - 사용자 이메일
   * @param {string} name - 사용자 이름
   * @param {string} birthDate - 생년월일 (YYYY-MM-DD)
   * @returns {Promise} 발송 결과
   */
  sendTemporaryPassword: async (email, name, birthDate) => {
    try {
      const response = await api.post('/auth/send-temp-password', {
        email,
        name,
        birthDate,
      });
      return response; // { success: true, message: '임시 비밀번호가 발송되었습니다.' }
    } catch (error) {
      console.error('임시 비밀번호 발송 에러:', error);
      throw error;
    }
  },
};

export default authAPI;
