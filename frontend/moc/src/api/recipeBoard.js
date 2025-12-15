import api from './axiosConfig';

/**
 * 레시피 목록 조회 API
 *
 * @param {Object} params - 검색 및 필터 조건
 * @param {string} [params.search] - 검색어 (선택)
 * @param {string} [params.style] - 요리 스타일 (선택) - 예: '한식', '중식', '일식', '양식', '퓨전'
 * @param {string} [params.difficulty] - 난이도 (선택) - 예: '하', '중', '상'
 * @param {string} [params.time] - 조리시간 (선택) - 예: '10분 이내', '30분 이내', '1시간 이내', '1시간 이상'
 *
 * @returns {Promise<Object>} 레시피 목록
 * @returns {Array} recipes - 레시피 배열
 * @returns {number} recipes[].id - 레시피 ID
 * @returns {string} recipes[].title - 레시피 제목
 * @returns {string} recipes[].author - 작성자 이름
 * @returns {number} recipes[].cookingTime - 조리 시간 (분)
 * @returns {string} recipes[].difficulty - 난이도 ('하', '중', '상')
 * @returns {number} recipes[].likeCount - 좋아요 수
 * @returns {boolean} recipes[].isLiked - 현재 사용자의 좋아요 여부 (JWT 토큰 기반)
 * @returns {Array<string>} recipes[].ingredients - 재료 목록
 * @returns {string|null} recipes[].image - 레시피 이미지 URL (없으면 null)
 *
 * @example
 * // 전체 레시피 조회
 export const getRecipeBoardList = async ({
  search,
  cuisineStyleCd,
  difficultyCd,
  maxCookTimeMin,
  sort = 'LATEST', // LATEST | POPULAR
  page = 1,
  size = 10,
} = {}) => {
  try {
    const response = await api.get('/recipes/board', {
      params: {
        search,
        cuisineStyleCd,
        difficultyCd,
        maxCookTimeMin,
        sort,
        offset: (page - 1) * size,
        limit: size,
      },
    });

    return response.data; // RecipeBoardListResponseDTO
  } catch (error) {
    console.error('게시판 레시피 목록 조회 실패:', error);
    throw error;
  }
};
 *
 * // 검색어로 조회
 * const data = await getRecipes({ search: '김치' });
 *
 * // 검색 + 필터 조합
 * const data = await getRecipes({
 *   search: '볶음밥',
 *   style: '중식'
 * });
 */
export const getRecipeBoardList = async ({
  search,
  cuisineStyleCd,
  difficultyCd,
  maxCookTimeMin,
  sort = 'LATEST', // LATEST | POPULAR
  page = 1,
  size = 10,
} = {}) => {
  try {
    const response = await api.get('/v1/recipes/board', {
      params: {
        search,
        cuisineStyleCd,
        difficultyCd,
        maxCookTimeMin,
        sort,
        page: page - 1,
        size,
      },
    });

    return response.data; // RecipeBoardListResponseDTO
  } catch (error) {
    console.error('게시판 레시피 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 레시피 상세 조회 API
 *
 * @param {number} recipeId - 레시피 ID
 *
 * @returns {Promise<Object>} 레시피 상세 정보
 * @returns {Object} recipe - 레시피 기본 정보
 * @returns {number} recipe.id - 레시피 ID
 * @returns {string} recipe.title - 레시피 제목
 * @returns {string} recipe.author - 작성자 이름
 * @returns {number} recipe.cookingTime - 조리 시간 (분)
 * @returns {string} recipe.difficulty - 난이도 ('하', '중', '상')
 * @returns {number} recipe.likeCount - 좋아요 수
 * @returns {boolean} recipe.isLiked - 현재 사용자의 좋아요 여부
 * @returns {string|null} recipe.image - 레시피 이미지 URL
 * @returns {Array<Object>} ingredients - 재료 목록
 * @returns {string} ingredients[].name - 재료명
 * @returns {string} ingredients[].amount - 재료 양
 * @returns {Array<string>} steps - 조리 순서 (문자열 배열)
 *
 * @example
 * const data = await getRecipeDetail(123);
 * console.log(data.recipe.title); // "오징어 볶음밥"
 * console.log(data.ingredients); // [{name: "오징어", amount: "1마리"}, ...]
 * console.log(data.steps); // ["소고기를 썰어주세요.", ...]
 */
export const getRecipeBoardDetail = async recipeId => {
  try {
    const response = await api.get(`/recipes/board/${recipeId}`);
    return response.data; // RecipeBoardDetailResponseDTO
  } catch (error) {
    console.error('게시판 레시피 상세 조회 실패:', error);
    throw error;
  }
};

/**
 * 레시피 좋아요 토글 API
 *
 * @param {number} recipeId - 레시피 ID
 *
 * @returns {Promise<Object>} 좋아요 결과
 * @returns {boolean} isLiked - 좋아요 상태 (true: 좋아요, false: 취소)
 * @returns {number} likeCount - 현재 좋아요 수
 *
 * @example
 * // 좋아요 토글
 * const result = await toggleRecipeLike(123);
 * console.log(result.isLiked); // true 또는 false
 * console.log(result.likeCount); // 999
 */
export const toggleRecipeLike = async recipeId => {
  try {
    const response = await api.post(`/recipes/${recipeId}/like`);

    return response.data;
  } catch (error) {
    console.error('좋아요 토글 실패:', error);
    throw error;
  }
};
