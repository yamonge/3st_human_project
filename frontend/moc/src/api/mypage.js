import api from './axiosConfig';

// ✅ 레시피 공통 정규화 함수 (여기 딱 1번만)
const normalizeRecipe = recipe => {
  if (!recipe) return recipe;

  const r = {...recipe};

  // 안드로이드 에뮬레이터 localhost 보정
  if (r.thumbnailUrl?.startsWith('http://localhost:8090')) {
    r.thumbnailUrl = r.thumbnailUrl.replace(
      'http://localhost:8090',
      'http://10.0.2.2:8090',
    );
  }

  // 난이도 한글화
  r.difficultyText =
    r.difficultyCd === 'EASY'
      ? '쉬움'
      : r.difficultyCd === 'NORMAL'
      ? '보통'
      : r.difficultyCd === 'HARD'
      ? '어려움'
      : r.difficultyCd;

  return r;
};

/**
 * 마이페이지 관련 API
 */

// ==================== 재료 관리 ====================

/**
 * 저장된 재료 목록 조회
 * @returns {Promise} 재료 목록
 */
export const getIngredients = async userId => {
  try {
    const response = await api.get(`/v1/users/${userId}/ingredients`);
    console.log('저장된 재료 목록 조회 결과:', response);
    return response;
  } catch (error) {
    console.error('재료 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 재료 추가
 * @param {string} name - 재료명
 * @param {string} category - 카테고리 (meat, dairy, vegetable, fruit)
 * @returns {Promise} 추가된 재료 정보
 */
export const addIngredient = async (
  userId,
  ingredientName,
  categoryCd = 'MEAT',
  quantityDesc = '1개',
) => {
  try {
    const response = await api.post(`/v1/users/${userId}/ingredients`, {
      ingredientName,
      categoryCd,
      quantityDesc,
      usedFlag: 'N',
      memo: null,
    });
    return response.data;
  } catch (error) {
    console.error('재료 추가 실패:', error);
    throw error;
  }
};

/**
 * 재료 삭제
 * @param {number|string} userId - 사용자 ID
 * @param {number} userIngredientId - 사용자 재료 ID
 * @returns {Promise<void>}
 */
export const deleteIngredient = async (userId, userIngredientId) => {
  try {
    if (!userId || !userIngredientId) {
      throw new Error('userId 또는 userIngredientId 없음');
    }

    console.log('🗑️ 재료 삭제 요청', {
      userId,
      userIngredientId,
    });

    await api.delete(`/v1/users/${userId}/ingredients/${userIngredientId}`);

    return;
  } catch (error) {
    console.error('재료 삭제 실패:', error);
    throw error;
  }
};

// ==================== 프로필 정보 ====================

/**
 * 사용자 프로필 정보 조회
 * @returns {Promise} 프로필 정보 (nickname, email, profileImage)
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get('/mypage/profile');
    return response;
  } catch (error) {
    console.error('프로필 정보 조회 실패:', error);
    throw error;
  }
};

/**
 * 마이페이지 메뉴 카운트 조회
 * @returns {Promise} 메뉴별 카운트 정보
 */
export const getMenuCounts = async userId => {
  try {
    const data = await api.get(`/v1/users/${userId}/mypage/counts`);
    return data;
  } catch (error) {
    console.error('메뉴 카운트 조회 실패:', error);
    throw error;
  }
};

// ==================== 받은 후기 ====================

/**
 * 받은 후기 목록 조회
 * @returns {Promise} 후기 목록 및 통계 정보
 * @returns {Object} response.reviews - 후기 목록
 * @returns {number} response.totalCount - 전체 후기 개수
 * @returns {number} response.averageRating - 평균 별점
 */
export const getReceivedReviews = async userId => {
  try {
    const data = await api.get(`/v1/users/${userId}/reviews/received`);
    if (!data || data === '') {
      return {
        receivedReviews: [],
        totalCount: 0,
        averageRating: 0,
      };
    }
    return data;
  } catch (error) {
    console.error('받은 후기 조회 실패:', error);
    throw error;
  }
};

// ==================== 저장된 레시피 ====================

/**
 * 저장한 레시피 목록 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise}
 */
/**
 * 저장한 레시피 목록 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise}
 */
export const getSavedRecipes = async userId => {
  try {
    if (!userId) {
      throw new Error('userId 없음');
    }

    console.log('📡 getSavedRecipes 호출, userId:', userId);

    const data = await api.get(`/v1/users/${userId}/bookmarks`);

    console.log('✅ 저장된 레시피 응답:', data);

    return data;
  } catch (error) {
    console.error('❌ 저장된 레시피 조회 실패:', error);
    throw error;
  }
};

/**
 * 좋아요한 게시물 목록 조회
 * @returns {Promise} 게시물 목록 및 총 개수
 * @returns {Object} response.posts - 게시물 목록
 * @returns {number} response.totalCount - 전체 개수
 */
export const getLikedPosts = async userId => {
  try {
    const data = await api.get(`/v1/users/${userId}/likes`);
    console.log('🔥 [API getLikedPosts] raw data:', data);

    return data ?? {likedRecipes: [], totalCount: 0};
  } catch (error) {
    console.error('getLikedPosts 실패:', error);
    return {likedRecipes: [], totalCount: 0};
  }
};
// ==================== 공유한 레시피 ====================

/**
 * 공유한 레시피 목록 조회
 * @returns {Promise} 레시피 목록 및 총 개수
 * @returns {Object} response.recipes - 레시피 목록
 * @returns {number} response.totalCount - 전체 개수
 */
export const getSharedRecipes = async userId => {
  try {
    const response = await api.get(`/v1/users/${userId}/bookmarks/my-public`);

    return response ?? {bookmarkedRecipes: [], totalCount: 0};
  } catch (error) {
    console.error('공유한 레시피 조회 실패:', error);
    return {bookmarkedRecipes: [], totalCount: 0};
  }
};

// ==================== 신고 내역 ====================

/**
 * 마이페이지 - 내가 한 신고 내역 조회
 */
export const getReportHistory = async userId => {
  try {
    if (!userId) {
      throw new Error('userId 없음');
    }
    console.log('🟡 [getReportHistory] 요청 userId:', userId);

    const data = await api.get(`/v1/users/${userId}/my-page/reports`);

    console.log('🟢 [getReportHistory] raw response:', data);
    console.log('🟢 [getReportHistory] Array 여부:', Array.isArray(data));
    console.log(
      '🟢 [getReportHistory] length:',
      Array.isArray(data) ? data.length : 'N/A',
    );

    // axios interceptor 때문에 data가 곧 응답 body
    return data ?? [];
  } catch (error) {
    console.error('신고 내역 조회 실패:', error);
    return [];
  }
};
