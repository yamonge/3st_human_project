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
    const response = await api.get('/users/me', {
      meta: {requiresUserId: true},
    });

    return response;
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error);
    throw error;
  }
};

// /**
//  * 관리자 권한 확인
//  * @returns {Promise<boolean>}
//  */
// export const checkAdminStatus = async () => {
//   try {
//     const response = await api.get('/users/check-admin');
//     return response.isAdmin;
//   } catch (error) {
//     console.error('관리자 권한 확인 실패:', error);
//     return false;
//   }
// };

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
    const response = await api.put('/users/profile', profileData, {
      meta: {requiresUserId: true},
    });

    return response;
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
    const response = await api.put('/users/password', passwordData, {
      meta: {requiresUserId: true},
    });
    return response;
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
    const response = await api.delete('/users/withdraw', {
      meta: {requiresUserId: true},
    });

    // AsyncStorage 로그인 정보 정리
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'userId',
      'userName',
      'userNickname',
      'userEmail',
      'profileImage',
      'userRole',
    ]);

    return response;
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
