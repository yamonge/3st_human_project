import api from './axiosConfig';

/**
 * 신고 API (공통)
 * - 레시피, 유저 등 다양한 컨텐츠 신고에 사용
 *
 * @param {string} type - 신고 유형 ('recipe', 'user' 등)
 * @param {number} targetId - 신고 대상 ID
 * @param {string} reason - 신고 사유
 * @param {string} [details] - 상세 설명 (선택)
 *
 * @returns {Promise<Object>} 신고 결과
 * @returns {boolean} success - 성공 여부
 * @returns {string} message - 결과 메시지
 *
 * @example
 * // 레시피 신고
 * await reportContent('recipe', 123, '부적절한 내용', '욕설이 포함되어 있습니다.');
 */
export const reportContent = async (type, targetId, reason, details = '') => {
  try {
    const response = await api.post('/report', {
      type,
      targetId,
      reason,
      details,
    });

    return response.data;
  } catch (error) {
    console.error('신고 실패:', error);
    throw error;
  }
};

/**
 * 레시피 신고 전용 함수 (간편 사용)
 *
 * @param {number} recipeId - 레시피 ID
 * @param {string} reason - 신고 사유
 * @param {string} [details] - 상세 설명
 * @returns {Promise<Object>}
 *
 * @example
 * await reportRecipe(123, '부적절한 내용', '욕설 포함');
 */
export const reportRecipe = async (recipeId, reason, details = '') => {
  return reportContent('recipe', recipeId, reason, details);
};
