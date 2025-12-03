import {StyleSheet} from 'react-native';
import {colors, typography, spacing, borderRadius, shadows} from './common';

/**
 * 메인 홈 화면 전용 스타일
 */
export const homeStyles = StyleSheet.create({
  // 컨테이너
  container: {
    flex: 1,
    backgroundColor: colors.bgWhite,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 120, // 하단 네비게이션 공간
  },

  content: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.horizontalPadding,
  },

  // 헤더
  headerContainer: {
    marginBottom: spacing.md,
  },

  greeting: {
    ...typography.largeTitle,
    color: '#12175E',
    marginBottom: spacing.xs,
  },

  subGreeting: {
    ...typography.caption,
    fontSize: 14,
    color: '#575757',
    marginBottom: spacing.lg,
  },

  // 섹션 타이틀
  sectionTitle: {
    ...typography.title,
    color: '#12175E',
    marginBottom: spacing.md,
  },

  // 메뉴 그리드
  menuSection: {
    marginBottom: spacing.xl,
  },

  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },

  menuRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  // 메뉴 카드
  menuCard: {
    flex: 1,
    height: 116,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    justifyContent: 'space-between',
    overflow: 'visible', // 3D 이미지가 밖으로 나갈 수 있도록
    ...shadows.cardMedium,
  },

  menuCardTitle: {
    ...typography.button,
    color: colors.textWhite,
    marginBottom: spacing.xs,
  },

  menuCardSubtitle: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textWhite,
  },

  menuCardTitleDark: {
    color: '#12175E',
  },

  menuCardSubtitleDark: {
    color: '#12175E',
    fontSize: 11,
  },

  menuCard3DImage: {
    position: 'absolute',
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },

  // 냉장고 털기 카드 (청록색)
  fridgeCard: {
    backgroundColor: '#7DC8E7',
  },

  fridgeImage: {
    top: -30,
    left: -15,
    transform: [{rotate: '15deg'}],
  },

  // 레시피 찾기 카드 (보라색)
  recipeSearchCard: {
    backgroundColor: '#8B7DD8',
  },

  recipeSearchImage: {
    top: -20,
    right: -10,
  },

  // 레시피 게시판 카드 (핑크색)
  recipeBoardCard: {
    backgroundColor: '#F19DB5',
  },

  recipeBoardImage: {
    bottom: -15,
    left: -10,
    width: 100,
    height: 100,
  },

  // 같이 장보기 카드 (연두색)
  shoppingCard: {
    backgroundColor: '#B5E7A0',
  },

  shoppingImage: {
    top: -20,
    right: -15,
  },

  // 화살표 아이콘
  arrowIcon: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },

  // 인기 레시피 섹션
  popularSection: {
    marginBottom: spacing.xl,
  },

  popularHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  moreButton: {
    paddingVertical: spacing.xs,
  },

  moreButtonText: {
    ...typography.caption,
    color: '#393F93',
  },

  // 인기 레시피 카드
  popularRecipeCard: {
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    ...shadows.cardSmall,
  },

  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.bgGray,
  },

  recipeInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  recipeTitle: {
    ...typography.button,
    color: colors.textDark,
    marginBottom: spacing.xs,
    marginLeft: 23, // 배지 공간 확보
  },

  recipeAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  recipeAuthorText: {
    ...typography.caption,
    color: colors.textLight,
    marginLeft: spacing.xs,
  },

  recipeMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  recipeTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  recipeDifficulty: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  recipeMetadataText: {
    ...typography.caption,
    color: '#4A5565',
    marginLeft: spacing.xs,
  },

  difficultyText: {
    ...typography.caption,
    color: '#00A63E',
  },

  // 재료 태그
  ingredientTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },

  ingredientTag: {
    backgroundColor: '#FFF1F6',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 16,
  },

  ingredientTagText: {
    ...typography.caption,
    color: colors.primary,
  },

  moreIngredientsTag: {
    backgroundColor: colors.bgGray,
  },

  moreIngredientsText: {
    ...typography.caption,
    color: '#4A5565',
  },

  // 좋아요 영역
  likeSection: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  likeButton: {
    padding: spacing.xs,
  },

  likeCount: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },

  // 순위 배지
  rankBadge: {
    position: 'absolute',
    left: -3,
    top: -2,
    width: 28,
    height: 28,
  },
});

export default homeStyles;
