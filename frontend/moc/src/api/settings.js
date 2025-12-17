import api from './axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 설정 관련 API
 */

/**
 * 사용자 정보 조회
 * @returns {Promise<{name: string, nickname: string, email: string, role: string, profileImage: string}>}
 */
export const getUserInfo = async () => {
  try {
    // TODO: 백엔드 API 연동 시 주석 해제
    // const response = await api.get('/users/me');
    // return response.data;

    // 임시: AsyncStorage에서 가져오기
    const name = await AsyncStorage.getItem('userName');
    const nickname = await AsyncStorage.getItem('userNickname');
    const email = await AsyncStorage.getItem('userEmail');
    const role = await AsyncStorage.getItem('userRole');
    const profileImage = await AsyncStorage.getItem('profileImage');

    return {
      name: name || '홍길동',
      nickname: nickname || '사용자',
      email: email || 'user@example.com',
      role: role || 'user',
      profileImage: profileImage || null,
    };
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    throw error;
  }
};

/**
 * 관리자 권한 확인
 * @returns {Promise<boolean>}
 */
export const checkAdminStatus = async () => {
  try {
    // TODO: 백엔드 API 연동 시 주석 해제
    // const response = await api.get('/users/check-admin');
    // return response.data.isAdmin;

    // 임시: AsyncStorage에서 가져오기
    const userRole = await AsyncStorage.getItem('userRole');
    return userRole === 'admin';
  } catch (error) {
    console.error('관리자 권한 확인 실패:', error);
    return false;
  }
};

/**
 * 프로필 수정
 * @param {Object} profileData - 수정할 프로필 데이터
 * @param {string} profileData.name - 이름
 * @param {string} profileData.nickname - 닉네임
 * @param {string} profileData.profileImage - 프로필 이미지 URL 또는 Base64
 * @returns {Promise<Object>}
 */
export const updateProfile = async profileData => {
  try {
    // TODO: 백엔드 API 연동 시 주석 해제
    // const response = await api.put('/users/profile', profileData);
    // return response.data;

    // 임시: AsyncStorage에 저장
    if (profileData.name) {
      await AsyncStorage.setItem('userName', profileData.name);
    }
    if (profileData.nickname) {
      await AsyncStorage.setItem('userNickname', profileData.nickname);
    }
    if (profileData.profileImage) {
      await AsyncStorage.setItem('profileImage', profileData.profileImage);
    }

    return {success: true};
  } catch (error) {
    console.error('프로필 수정 실패:', error);
    throw error;
  }
};

/**
 * 비밀번호 변경
 * @param {Object} passwordData - 비밀번호 데이터
 * @param {string} passwordData.currentPassword - 현재 비밀번호
 * @param {string} passwordData.newPassword - 새 비밀번호
 * @returns {Promise<Object>}
 */
export const changePassword = async passwordData => {
  try {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('비밀번호 변경 실패:', error);
    throw error;
  }
};

/**
 * 알림 설정 조회
 * @returns {Promise<Object>}
 */
export const getNotificationSettings = async () => {
  try {
    const response = await api.get('/users/notification-settings');
    return response.data;
  } catch (error) {
    console.error('알림 설정 조회 실패:', error);
    throw error;
  }
};

/**
 * 알림 설정 업데이트
 * @param {Object} settings - 알림 설정 데이터
 * @returns {Promise<Object>}
 */
export const updateNotificationSettings = async settings => {
  try {
    const response = await api.put('/users/notification-settings', settings);
    return response.data;
  } catch (error) {
    console.error('알림 설정 업데이트 실패:', error);
    throw error;
  }
};

/**
 * 회원탈퇴
 * @returns {Promise<void>}
 */
export const withdrawUser = async () => {
  try {
    const response = await api.delete('/users/withdraw');

    // AsyncStorage 데이터 삭제
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'userNickname',
      'userEmail',
      'profileImage',
      'userRole',
    ]);

    return response.data;
  } catch (error) {
    console.error('회원탈퇴 실패:', error);
    throw error;
  }
};

/**
 * 앱 버전 정보 조회
 * @returns {Promise<{version: string, latestVersion: string, updateRequired: boolean}>}
 */
export const getAppVersion = async () => {
  try {
    // TODO: 백엔드 API 연동 시 주석 해제
    // const response = await api.get('/app/version');
    // return response.data;

    // 임시 데이터
    return {
      version: '1.0.0',
      latestVersion: '1.0.0',
      updateRequired: false,
    };
  } catch (error) {
    console.error('앱 버전 정보 조회 실패:', error);
    return {
      version: '1.0.0',
      latestVersion: '1.0.0',
      updateRequired: false,
    };
  }
};
