import api from './axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
/**
 * 관리자 API
 * 관리자 전용 기능 API
 */

const withAdminMeta = (config = {}) => ({
  ...config,
  meta: {...(config.meta || {}), requiresUserId: true},
});

/** ✅ 로그인한 내 userId를 adminUserId로 사용(업데이트 updated_id 용도) */
const getMyUserId = async () => {
  const raw = await AsyncStorage.getItem('userId');
  return raw ? Number(raw) : null;
};

/** ✅ 프론트 필터값 -> 백엔드 상태값 매핑 */
const mapFilterToStatus = filter => {
  if (!filter || filter === 'all') return 'ALL';
  if (filter === 'active') return 'ACTIVE';
  if (filter === 'suspended') return 'SUSPENDED';
  return 'ALL';
};

/** ✅ duration -> suspendType 매핑(백엔드 DTO 기준) */
const mapDurationToSuspendType = duration => {
  if (duration === 'permanent') return 'PERMANENT';
  if (duration === 1) return 'ONE_DAY';
  if (duration === 3) return 'THREE_DAYS';
  if (duration === 7) return 'SEVEN_DAYS';
  return null;
};

// ===== 관리자 통계 =====

/**
 * 관리자 통계 조회
 * @returns {Promise<Object>} 전체 회원 수, 미처리 신고 수 등
 */
export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response;
  } catch (error) {
    console.error('관리자 통계 조회 실패:', error);
    throw error;
  }
};

// ===== 회원 관리 =====

/** 회원 목록 조회
 * GET /api/admin/users?userId=관리자ID&status=all|active|suspended&search=...
 */
export const getUserList = async (params = {}) => {
  try {
    const mappedParams = {
      // 백엔드 DTO/Mapper: status
      status: mapFilterToStatus(params.status),

      // 백엔드 DTO/Mapper: keyword (프론트는 search로 쓰고 있어 변환)
      keyword: params.search ? String(params.search).trim() : '',

      // cursor 기반(선택 사항)
      lastUserId: params.lastUserId ?? null,
      limit: params.limit ?? null,
    };

    return api.get('/admin/users', withAdminMeta({params: mappedParams}));
  } catch (error) {
    console.error('회원 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * ✅ 회원 정지
 * 백엔드: POST /api/admin/users/{userId}/suspend
 * Body: { suspendType, reason, adminUserId }
 *
 * 사용 예:
 * suspendUser(targetUserId, { duration: 1|3|7|'permanent', reason: '사유' })
 */
export const suspendUser = async (userId, data) => {
  try {
    const adminUserId = await getMyUserId();

    const payload = {
      suspendType: mapDurationToSuspendType(data?.duration),
      reason: data?.reason ?? null,
      adminUserId,
    };

    return api.post(`/admin/users/${userId}/suspend`, payload, withAdminMeta());
  } catch (error) {
    console.error('계정 정지 실패:', error);
    throw error;
  }
};

/**
 * ✅ 회원 정지 해제(활성화)
 * 백엔드: POST /api/admin/users/{userId}/activate
 * Body: { adminUserId }
 *
 * 사용 예:
 * unsuspendUser(targetUserId)
 */
export const unsuspendUser = async userId => {
  try {
    const adminUserId = await getMyUserId();
    const payload = {adminUserId};

    return api.post(
      `/admin/users/${userId}/activate`,
      payload,
      withAdminMeta(),
    );
  } catch (error) {
    console.error('회원 정지 해제 실패:', error);
    throw error;
  }
};

// ===== 신고 관리 =====

/**
 * 신고 목록 조회
 * @param {Object} params - { type, status, search }
 * @returns {Promise<Object>}
 */
export const getReportList = async params => {
  try {
    const response = await api.get('/admin/reports', {params});
    return response;
  } catch (error) {
    console.error('신고 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 경고 발송
 * @param {number} reportId - 신고 ID
 * @param {Object} data - { userId, reason }
 * @returns {Promise<Object>}
 */
export const sendWarning = async (reportId, data) => {
  try {
    const response = await api.post(`/admin/reports/${reportId}/warning`, data);
    return response;
  } catch (error) {
    console.error('경고 발송 실패:', error);
    throw error;
  }
};

/**
 * 신고를 통한 계정 정지
 * @param {number} reportId - 신고 ID
 * @param {Object} data - { userId, duration, reason }
 * @returns {Promise<Object>}
 */
export const suspendUserByReport = async (reportId, data) => {
  try {
    const response = await api.post(`/admin/reports/${reportId}/suspend`, data);
    return response;
  } catch (error) {
    console.error('계정 정지 실패:', error);
    throw error;
  }
};

// ===== 게시글 관리 =====

/**
 * 게시글 목록 조회 (관리자용)
 * @param {Object} params - { page, size, search, status }
 * @returns {Promise<Object>} 게시글 목록
 */
export const getPostList = async params => {
  try {
    const response = await api.get('/admin/posts', {params});
    return response;
  } catch (error) {
    console.error('게시글 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 게시글 삭제
 * @param {number} postId - 게시글 ID
 * @returns {Promise<Object>}
 */
export const deletePost = async postId => {
  try {
    const response = await api.delete(`/admin/posts/${postId}`);
    return response;
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    throw error;
  }
};

/**
 * 게시글 숨김/복원
 * @param {number} postId - 게시글 ID
 * @param {boolean} hidden - 숨김 여부
 * @returns {Promise<Object>}
 */
export const togglePostVisibility = async (postId, hidden) => {
  try {
    const response = await api.patch(`/admin/posts/${postId}/visibility`, {
      hidden,
    });
    return response;
  } catch (error) {
    console.error('게시글 숨김/복원 실패:', error);
    throw error;
  }
};

// ===== 공지사항 관리 =====

/**
 * 공지사항 목록 조회
 * @param {Object} params - { page, size }
 * @returns {Promise<Object>} 공지사항 목록
 */
export const getNoticeList = async (params = {}) => {
  try {
    const response = await api.get('/admin/notices', {params});
    return response;
  } catch (error) {
    console.error('공지사항 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 공지사항 상세 조회
 * @param {number} noticeId - 공지사항 ID
 * @returns {Promise<Object>}
 */
export const getNoticeDetail = async noticeId => {
  try {
    const response = await api.get(`/admin/notices/${noticeId}`);
    return response;
  } catch (error) {
    console.error('공지사항 상세 조회 실패:', error);
    throw error;
  }
};

/**
 * 공지사항 작성
 * @param {Object} data - { title, content, important }
 * @returns {Promise<Object>}
 */
export const createNotice = async data => {
  try {
    const response = await api.post('/admin/notices', data);
    return response;
  } catch (error) {
    console.error('공지사항 작성 실패:', error);
    throw error;
  }
};

/**
 * 공지사항 수정
 * @param {number} noticeId - 공지사항 ID
 * @param {Object} data - { title, content, important }
 * @returns {Promise<Object>}
 */
export const updateNotice = async (noticeId, data) => {
  try {
    const response = await api.put(`/admin/notices/${noticeId}`, data);
    return response;
  } catch (error) {
    console.error('공지사항 수정 실패:', error);
    throw error;
  }
};

/**
 * 공지사항 삭제
 * @param {number} noticeId - 공지사항 ID
 * @returns {Promise<Object>}
 */
export const deleteNotice = async noticeId => {
  try {
    const response = await api.delete(`/admin/notices/${noticeId}`);
    return response;
  } catch (error) {
    console.error('공지사항 삭제 실패:', error);
    throw error;
  }
};

/**
 * 공지사항 고정 토글
 * @param {number} noticeId - 공지사항 ID
 * @returns {Promise<Object>}
 */
export const toggleNoticePin = async noticeId => {
  try {
    const response = await api.patch(`/admin/notices/${noticeId}/pin`);
    return response;
  } catch (error) {
    console.error('공지사항 고정 토글 실패:', error);
    throw error;
  }
};

// ===== 회원 탈퇴 (관리자) =====

/**
 * ✅ 회원 탈퇴(소프트 삭제)
 * 백엔드: POST /api/admin/users/{userId}/withdraw
 * Body: { adminUserId, reason }
 *
 * 사용 예:
 * deleteUser(targetUserId, { reason: '탈퇴 처리 사유' })
 */
export const deleteUser = async (userId, data = {}) => {
  try {
    const adminUserId = await getMyUserId();

    const payload = {
      adminUserId,
      reason: data?.reason ?? null,
    };

    return api.post(
      `/admin/users/${userId}/withdraw`,
      payload,
      withAdminMeta(),
    );
  } catch (error) {
    console.error('회원 탈퇴 실패:', error);
    throw error;
  }
};
