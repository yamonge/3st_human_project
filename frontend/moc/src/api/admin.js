import axiosInstance from './axiosConfig';

/**
 * 관리자 API
 * 관리자 전용 기능 API
 */

// ===== 관리자 통계 =====

/**
 * 관리자 통계 조회
 * @returns {Promise<Object>} 전체 회원 수, 미처리 신고 수 등
 */
export const getAdminStats = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/stats');
    return response.data;
  } catch (error) {
    console.error('관리자 통계 조회 실패:', error);
    throw error;
  }
};

// ===== 회원 관리 =====

/**
 * 회원 목록 조회
 * @param {Object} params - { page, size, search, status }
 * @returns {Promise<Object>} 회원 목록
 */
export const getUserList = async params => {
  try {
    const response = await axiosInstance.get('/api/admin/users', {params});
    return response.data;
  } catch (error) {
    console.error('회원 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 회원 정지
 * @param {number} userId - 회원 ID
 * @param {Object} data - { reason, duration }
 * @returns {Promise<Object>}
 */
export const suspendUser = async (userId, data) => {
  try {
    const response = await axiosInstance.post(
      `/api/admin/users/${userId}/suspend`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error('회원 정지 실패:', error);
    throw error;
  }
};

/**
 * 회원 정지 해제
 * @param {number} userId - 회원 ID
 * @returns {Promise<Object>}
 */
export const unsuspendUser = async userId => {
  try {
    const response = await axiosInstance.post(
      `/api/admin/users/${userId}/unsuspend`,
    );
    return response.data;
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
    const response = await axiosInstance.get('/api/admin/reports', {params});
    return response.data;
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
    const response = await axiosInstance.post(
      `/api/admin/reports/${reportId}/warning`,
      data,
    );
    return response.data;
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
    const response = await axiosInstance.post(
      `/api/admin/reports/${reportId}/suspend`,
      data,
    );
    return response.data;
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
    const response = await axiosInstance.get('/api/admin/posts', {params});
    return response.data;
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
    const response = await axiosInstance.delete(`/api/admin/posts/${postId}`);
    return response.data;
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
    const response = await axiosInstance.patch(
      `/api/admin/posts/${postId}/visibility`,
      {hidden},
    );
    return response.data;
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
export const getNoticeList = async params => {
  try {
    const response = await axiosInstance.get('/api/admin/notices', {params});
    return response.data;
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
    const response = await axiosInstance.get(`/api/admin/notices/${noticeId}`);
    return response.data;
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
    const response = await axiosInstance.post('/api/admin/notices', data);
    return response.data;
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
    const response = await axiosInstance.put(
      `/api/admin/notices/${noticeId}`,
      data,
    );
    return response.data;
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
    const response = await axiosInstance.delete(
      `/api/admin/notices/${noticeId}`,
    );
    return response.data;
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
    const response = await axiosInstance.patch(
      `/api/admin/notices/${noticeId}/pin`,
    );
    return response.data;
  } catch (error) {
    console.error('공지사항 고정 토글 실패:', error);
    throw error;
  }
};

// ===== 회원 탈퇴 (관리자) =====

/**
 * 회원 강제 탈퇴
 * @param {number} userId - 회원 ID
 * @param {Object} data - { reason }
 * @returns {Promise<Object>}
 */
export const deleteUser = async (userId, data) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/users/${userId}`, {
      data,
    });
    return response.data;
  } catch (error) {
    console.error('회원 탈퇴 실패:', error);
    throw error;
  }
};
