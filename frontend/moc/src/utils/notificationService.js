import notifee, {TriggerType, AndroidImportance} from '@notifee/react-native';
import {Platform, PermissionsAndroid} from 'react-native';
import {differenceInMinutes, parseISO} from 'date-fns';

/**
 * Notifee 알림 서비스
 * - 로컬 알림 초기화 및 관리
 * - 약속 30분 전 알림 스케줄링
 */

/**
 * 알림 채널 생성 (Android 전용)
 */
const createNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'shopping-reminder',
      name: '장보기 알림',
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
  }
};

/**
 * 알림 권한 요청
 * @returns {Promise<boolean>} 권한 허용 여부
 */
export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      // Android 13 (API 33) 이상에서만 권한 필요
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // Android 12 이하는 권한 불필요
    } else {
      // iOS
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus >= 1; // 1 = Authorized
    }
  } catch (error) {
    console.error('[알림 권한 요청 실패]', error);
    return false;
  }
};

/**
 * Notifee 초기화
 */
export const initNotification = async () => {
  try {
    await createNotificationChannel();
    console.log('[Notifee 초기화 완료]');
  } catch (error) {
    console.error('[Notifee 초기화 실패]', error);
  }
};

/**
 * 약속 30분 전 알림 스케줄링
 * @param {string} postId - 게시물 ID
 * @param {string} storeName - 마트명
 * @param {string} meetTimeString - 약속 시간 문자열 (예: "오늘 오후 12:35")
 * @param {Date} meetTimeDate - 약속 시간 Date 객체
 * @returns {Promise<string|null>} 알림 ID (취소 시 사용)
 */
export const scheduleMeetingNotification = async (
  postId,
  storeName,
  meetTimeString,
  meetTimeDate,
) => {
  try {
    // 30분 전 시간 계산
    const notificationTime = new Date(meetTimeDate.getTime() - 30 * 60 * 1000);
    const now = new Date();

    // 이미 지난 시간인지 체크
    if (notificationTime <= now) {
      console.warn('[알림 시간 지남] 알림을 예약할 수 없습니다.');
      return null;
    }

    // 알림 생성
    const notificationId = await notifee.createTriggerNotification(
      {
        id: `meeting-${postId}`, // 고유 ID (취소 시 사용)
        title: '🛒 장보기 30분 전!',
        body: `${storeName}에서 ${meetTimeString}에 만나요!`,
        android: {
          channelId: 'shopping-reminder',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: notificationTime.getTime(),
      },
    );

    console.log('[알림 예약 완료]', {
      notificationId,
      scheduledTime: notificationTime.toISOString(),
    });

    return notificationId;
  } catch (error) {
    console.error('[알림 예약 실패]', error);
    return null;
  }
};

/**
 * 특정 게시물의 알림 취소 (채팅방 나가기 시 사용)
 * @param {string} postId - 게시물 ID
 */
export const cancelMeetingNotification = async postId => {
  try {
    const notificationId = `meeting-${postId}`;
    await notifee.cancelNotification(notificationId);
    console.log('[알림 취소 완료]', notificationId);
  } catch (error) {
    console.error('[알림 취소 실패]', error);
  }
};
