import api from './axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
/**
 * 관리자 API
 * 관리자 전용 기능 API
 */
// 날짜 포맷
const formatDateYYYYMMDD = value => {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  } catch (e) {
    return '';
  }
};

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
  if (duration === 1) return 'ONE_DAY';
  if (duration === 3) return 'THREE_DAYS';
  if (duration === 7) return 'SEVEN_DAYS';
  if (duration === 'permanent') return 'PERMANENT';
  // 혹시 화면에서 999999 같은 값 쓰면 여기에 흡수
  if (duration === 999999) return 'PERMANENT';
  return null;
};

// 화면 상태/사유 -> 백엔드 검색값 매핑
const mapStatusToStatusCd = status => {
  if (!status || status === 'all') return 'ALL';
  if (status === 'pending') return 'PENDING';
  return 'PROCESSED'; // resolved
};

// 신고 유형 -> reasonCd 매핑 (noshow/abuse/fake -> NOSHOW/ABUSE/FAKE)
const mapTypeToReasonCd = type => {
  if (!type || type === 'all') return '';
  return String(type).toUpperCase();
};

// ===== 관리자 통계 =====

/**
 * 관리자 통계 조회
 * @returns {Promise<Object>} 전체 회원 수, 미처리 신고 수 등
 */
export const getAdminStats = async () => {
  try {
    // ✅ userId 자동 첨부되도록 meta 적용
    const response = await api.get('/admin/stats', withAdminMeta());
    return response; // axiosConfig가 response.data만 리턴
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
export const getReportList = async (params = {}) => {
  try {
    // ✅ 현재 백엔드는 "유저 신고"만 있으므로,
    // reportType이 'post'인 경우는 일단 빈 배열 반환(추후 게시물 신고 API 추가 시 확장)
    const reportType = params.reportType;
    if (reportType && reportType !== 'user') {
      return {reports: []};
    }

    const mappedParams = {
      keyword: params.search ? String(params.search).trim() : '',
      reasonCd: mapTypeToReasonCd(params.type),
      statusCd: mapStatusToStatusCd(params.status),
      // cursor 기반 확장 여지
      lastUserReportId: params.lastUserReportId ?? null,
      limit: params.limit ?? 50,
    };

    const list = await api.get(
      '/admin/reports/users',
      withAdminMeta({params: mappedParams}),
    );

    // 백엔드 DTO -> 화면 모델 매핑
    const reports = (list || []).map(dto => ({
      id: dto.userReportId,
      reportType: 'user',
      // tb_user_report에 출처 컬럼이 없다면, UI 표시용으로 고정
      source: 'shopping_together',
      type: String(dto.reportReasonCd || '').toLowerCase(),
      status: dto.processingStatusCd === 'PENDING' ? 'pending' : 'resolved',
      date: formatDateYYYYMMDD(dto.createdDate),
      reporter: dto.reporterNickname,
      reported: dto.reportedNickname,
      reportedUserId: dto.reportedUserId,
      description: dto.reportComment,
      details: dto.reportComment,
    }));

    return {reports};
  } catch (error) {
    console.error('신고 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 경고 발송
 * - 실제 FCM 발송은 추후
 * - 지금은 "신고 처리완료 마킹"으로만 연결
 *
 * 백엔드:
 * POST /api/admin/reports/users/{userReportId}/process
 * Body: { userReportId, reportedUserId, actionType:'WARNING', adminUserId }
 */
export const sendWarning = async (reportId, data) => {
  try {
    const adminUserId = await getMyUserId();

    const payload = {
      userReportId: reportId,
      reportedUserId: data?.userId ?? null,
      actionType: 'WARNING',
      adminUserId,
    };

    return api.post(
      `/admin/reports/users/${reportId}/process`,
      payload,
      withAdminMeta(),
    );
  } catch (error) {
    console.error('경고 발송 실패:', error);
    throw error;
  }
};

/**
 * 신고를 통한 계정 정지
 * - 기존 "회원 정지 API"를 그대로 재사용 (매핑 유지)
 * - 이후 신고 처리완료 마킹(process) 호출
 *
 * 화면에서 전달하는 data:
 * { userId, duration(1|3|7|'permanent'|999999), reason }
 *
 * 처리 순서:
 * 1) suspendUser(targetUserId, {duration, reason})  // 기존 구현 유지
 * 2) POST /api/admin/reports/users/{reportId}/process  // 처리완료 마킹
 */
export const suspendUserByReport = async (reportId, data) => {
  try {
    // 1) 기존 정지 API 그대로 사용 (회원관리 화면과 완전히 동일한 매핑)
    await suspendUser(data?.userId, {
      duration: data?.duration,
      reason: data?.reason,
    });

    // 2) 신고 처리완료 마킹
    const adminUserId = await getMyUserId();

    const payload = {
      userReportId: reportId,
      reportedUserId: data?.userId ?? null,
      actionType: 'SUSPEND',
      suspendType: mapDurationToSuspendType(data?.duration), // 기록용
      adminUserId,
    };

    return api.post(
      `/admin/reports/users/${reportId}/process`,
      payload,
      withAdminMeta(),
    );
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
    const response = await api.get('/admin/posts', withAdminMeta({params}));
    return response;
  } catch (error) {
    console.error('게시글 목록 조회 실패:', error);
    throw error;
  }
};

// 게시글 삭제(소프트 삭제)
export const deletePost = async postId => {
  try {
    const response = await api.delete(
      `/admin/posts/${postId}`,
      withAdminMeta(),
    );
    return response;
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    throw error;
  }
};

// 게시글 숨김/복원
export const togglePostVisibility = async (postId, hidden) => {
  try {
    const response = await api.patch(
      `/admin/posts/${postId}/visibility`,
      {hidden},
      withAdminMeta(),
    );
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
