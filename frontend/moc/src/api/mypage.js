import api from './axiosConfig';
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
    return response.data;
  } catch (error) {
    console.error('프로필 정보 조회 실패:', error);
    throw error;
  }
};

/**
 * 마이페이지 메뉴 카운트 조회
 * @returns {Promise} 메뉴별 카운트 정보
 */
export const getMenuCounts = async () => {
  try {
    const response = await api.get('/mypage/counts');
    return response.data;
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
export const getReceivedReviews = async () => {
  try {
    const response = await api.get('/mypage/reviews/received');
    return response.data;
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

    const data = await api.get(
      `/v1/users/${userId}/bookmarks`
    );

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
export const getLikedPosts = async () => {
  try {
    const response = await api.get('/mypage/posts/liked');
    return response.data;
  } catch (error) {
    console.error('좋아요한 게시물 조회 실패:', error);
    throw error;
  }
};

// ==================== 공유한 레시피 ====================

/**
 * 공유한 레시피 목록 조회
 * @returns {Promise} 레시피 목록 및 총 개수
 * @returns {Object} response.recipes - 레시피 목록
 * @returns {number} response.totalCount - 전체 개수
 */
export const getSharedRecipes = async () => {
  try {
    const response = await api.get('/mypage/recipes/shared');
    return response.data;
  } catch (error) {
    console.error('공유한 레시피 조회 실패:', error);
    throw error;
  }
};

// ==================== 신고 내역 ====================

/**
 * 신고 내역 목록 조회
 * @returns {Promise} 신고 내역 목록 및 총 개수
 * @returns {Object} response.reports - 신고 내역 목록
 * @returns {number} response.totalCount - 전체 개수
 */
export const getReportHistory = async () => {
  try {
    const response = await api.get('/mypage/reports');
    return response.data;
  } catch (error) {
    console.error('신고 내역 조회 실패:', error);
    throw error;
  }
};
