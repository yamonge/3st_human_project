import api from './axiosConfig';

/**
 * 마이페이지 관련 API
 */

// ==================== 재료 관리 ====================

/**
 * 저장된 재료 목록 조회
 * @returns {Promise} 재료 목록
 */
export const getIngredients = async () => {
  try {
    const response = await api.get('/mypage/ingredients');
    return response.data;
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
export const addIngredient = async (name, category = 'meat') => {
  try {
    const response = await api.post('/mypage/ingredients', {
      name,
      category,
    });
    return response.data;
  } catch (error) {
    console.error('재료 추가 실패:', error);
    throw error;
  }
};

/**
 * 재료 삭제
 * @param {number} ingredientId - 재료 ID
 * @returns {Promise}
 */
export const deleteIngredient = async ingredientId => {
  try {
    const response = await api.delete(`/mypage/ingredients/${ingredientId}`);
    return response.data;
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
 * @returns {Promise} 레시피 목록 및 총 개수
 * @returns {Object} response.recipes - 레시피 목록
 * @returns {number} response.totalCount - 전체 개수
 */
export const getSavedRecipes = async () => {
  try {
    const response = await api.get('/mypage/recipes/saved');
    return response.data;
  } catch (error) {
    console.error('저장된 레시피 조회 실패:', error);
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
