import api from './axiosConfig';

/**
 * 공지사항 관련 API
 * 백엔드 개발자가 제공하는 API 엔드포인트에 맞춰 수정 필요
 */
export const notificationAPI = {
  /**
   * 공지사항 목록 조회
   * 백엔드: GET /api/notifications
   * Response: [{ id, title, content, createdAt, isPinned, isRead }]
   */
  getNotifications: async () => {
    try {
      // const response = await api.get('/notifications');
      // return response.data;

      // 임시 더미 데이터 (백엔드 연동 전)
      return [
        {
          id: 1,
          title: '서비스 이용약관 개정 안내',
          content: '서비스 이용약관이 개정되었습니다.',
          createdAt: '2025.11.28',
          isPinned: true,
          isRead: false,
        },
        {
          id: 2,
          title: '12월 정기 점검 안내',
          content: '12월 정기 점검 일정을 안내드립니다.',
          createdAt: '2025.11.27',
          isPinned: true,
          isRead: false,
        },
        {
          id: 3,
          title: '신규 기능 업데이트 안내',
          content: '새로운 기능이 추가되었습니다.',
          createdAt: '2025.11.25',
          isPinned: false,
          isRead: false,
        },
        {
          id: 4,
          title: '개인정보 처리방침 변경 안내',
          content: '개인정보 처리방침이 변경되었습니다.',
          createdAt: '2025.11.20',
          isPinned: false,
          isRead: false,
        },
        {
          id: 5,
          title: '추석 연휴 고객센터 운영 안내',
          content: '추석 연휴 고객센터 운영 시간 안내입니다.',
          createdAt: '2025.11.15',
          isPinned: false,
          isRead: false,
        },
        {
          id: 6,
          title: '서비스 안정화 업데이트 완료',
          content: '서비스 안정화 업데이트가 완료되었습니다.',
          createdAt: '2025.11.10',
          isPinned: false,
          isRead: false,
        },
      ];
    } catch (error) {
      console.error('공지사항 목록 조회 실패:', error);
      throw error;
    }
  },

  /**
   * 공지사항 상세 조회
   * 백엔드: GET /api/notifications/:id
   * Response: { id, title, content, createdAt, isPinned, isRead, imageUrl }
   */
  getNotificationDetail: async id => {
    try {
      // const response = await api.get(`/notifications/${id}`);
      // return response.data;

      // 임시 더미 데이터 (백엔드 연동 전)
      return {
        id: id,
        title: '서비스 이용약관 개정 안내',
        content:
          '안녕하세요. 서비스 이용약관이 개정되어 안내드립니다.\n\n개정된 약관은 2025년 12월 1일부터 적용되며, 주요 변경사항은 다음과 같습니다.\n\n1. 개인정보 처리방침 강화\n2. 서비스 이용 범위 명확화\n3. 회원 탈퇴 절차 개선\n\n자세한 내용은 앱 내 설정 > 약관 및 정책에서 확인하실 수 있습니다.\n\n감사합니다.',
        createdAt: '2025.11.28',
        isPinned: true,
        isRead: false,
        imageUrl:
          'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800', // 예시 이미지 (선택적)
      };
    } catch (error) {
      console.error('공지사항 상세 조회 실패:', error);
      throw error;
    }
  },
};
