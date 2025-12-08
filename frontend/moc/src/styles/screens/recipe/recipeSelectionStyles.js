import {StyleSheet} from 'react-native';
import {colors} from '../../common';

/**
 * 레시피 추천 방식 선택 화면 스타일
 */
export const styles = StyleSheet.create({
  // 컨테이너
  container: {
    flex: 1,
  },

  // 상단 헤더
  header: {
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 12,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textWhite,
    fontFamily: 'Noto Sans KR',
  },

  titleIcon: {
    width: 28,
    height: 28,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Noto Sans KR',
    lineHeight: 21,
  },

  // 카드 영역
  cardsContainer: {
    paddingHorizontal: 24,
    marginTop: 40,
    gap: 20,
  },

  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },

  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  iconContainerGreen: {
    backgroundColor: '#10B981',
  },

  cardTextContainer: {
    flex: 1,
    gap: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Noto Sans KR',
    lineHeight: 27,
  },

  cardDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Noto Sans KR',
    lineHeight: 19.5,
  },

  // 데코레이션 원형
  decorationCircle1: {
    position: 'absolute',
    top: 70,
    left: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  decorationCircle2: {
    position: 'absolute',
    top: 200,
    right: 30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 240, 133, 0.3)',
    opacity: 0.5,
  },

  decorationCircle3: {
    position: 'absolute',
    top: 390,
    left: 60,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(253, 165, 213, 0.2)',
  },

  // 하단 추가 데코레이션
  decorationCircle4: {
    position: 'absolute',
    bottom: 150,
    right: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(165, 180, 252, 0.3)',
  },

  decorationCircle5: {
    position: 'absolute',
    bottom: 200,
    left: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(196, 181, 253, 0.25)',
  },

  decorationCircle6: {
    position: 'absolute',
    bottom: 120,
    left: '50%',
    marginLeft: -35,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(254, 202, 202, 0.3)',
  },
});
