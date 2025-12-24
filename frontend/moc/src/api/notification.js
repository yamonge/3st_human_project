import api from './axiosConfig';
import {Platform} from 'react-native';
import {format} from 'date-fns';

const toDateText = ts => {
  if (!ts) return '';
  const d = new Date(ts);
  return isNaN(d.getTime()) ? '' : format(d, 'yyyy.MM.dd');
};

/**
 * 이미지 URL 변환 (Android 에뮬레이터 localhost 보정)
 */
const normalizeImageUrl = imageUrl => {
  if (!imageUrl) return imageUrl;
  
  // Android 에뮬레이터에서 localhost를 실제 서버 IP로 변환
  if (Platform.OS === 'android' && imageUrl.startsWith('http://localhost:8090')) {
    return imageUrl.replace('http://localhost:8090', 'http://192.168.50.117:8090');
  }
  
  return imageUrl;
};

/**
 * 공지사항 관련 API
 */

const mapListItem = dto => ({
  id: dto.noticeId,
  title: dto.title,
  imageUrl: normalizeImageUrl(dto.imageUrl), // 이미지 URL 변환 추가
  isPinned: !!dto.pinned,
  createdAt: toDateText(dto.createdDate),
});

const mapDetail = dto => ({
  id: dto.noticeId,
  title: dto.title,
  content: dto.content,
  imageUrl: normalizeImageUrl(dto.imageUrl), // 이미지 URL 변환 추가
  isPinned: !!dto.pinned,
  createdAt: toDateText(dto.createdDate),
});


  /**
   * 공지사항 목록 조회
   * 백엔드: GET /api/notifications
   */
  export const notificationAPI = {
  async getNotifications(params = {}) {
    const list = await api.get('/notifications', {params}); // ✅ 여기서 list는 이미 data
    return Array.isArray(list) ? list.map(mapListItem) : [];
  },

  /**
   * 공지사항 상세 조회
   * 백엔드: GET /api/notifications/:id
   */
  async getNotificationDetail(noticeId) {
    const dto = await api.get(`/notifications/${noticeId}`); // ✅ dto는 이미 data
    return mapDetail(dto);
  },
};
