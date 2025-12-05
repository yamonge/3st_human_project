import axios from './axiosConfig';

/**
 * 재료 인식 API (에러 처리 포함)
 * 촬영한 이미지를 백엔드로 전송하여 AI 재료 인식 수행
 *
 * @param {string} photoPath - 촬영한 사진의 로컬 경로
 * @returns {Promise<Object>} { success: boolean, ingredients: Array, error?: string }
 * @example
 * const result = await recognizeIngredients('/path/to/photo.jpg');
 * if (result.success) {
 *   console.log(result.ingredients);
 * } else {
 *   console.error(result.error);
 * }
 */
export const recognizeIngredients = async photoPath => {
  try {
    console.log('📤 AI 재료 인식 API 호출:', photoPath);

    const formData = new FormData();
    formData.append('image', {
      uri: `file://${photoPath}`,
      type: 'image/jpeg',
      name: 'ingredient.jpg',
    });

    const response = await axios.post('/api/ingredients/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30초 타임아웃 (AI 처리 시간 고려)
    });

    console.log('✅ AI 재료 인식 성공:', response.data);
    return {
      success: true,
      ingredients: response.data.ingredients || [],
    };
  } catch (error) {
    console.error('❌ 재료 인식 API 에러:', error);

    // 에러 타입별 메시지 반환
    let errorMessage = '재료 인식에 실패했습니다.';

    if (error.response) {
      // 서버 응답 에러 (4xx, 5xx)
      errorMessage =
        error.response.data?.message || '서버 오류가 발생했습니다.';
    } else if (error.request) {
      // 네트워크 에러 (요청은 보냈지만 응답 없음)
      errorMessage = '서버에 연결할 수 없습니다.\n인터넷 연결을 확인해주세요.';
    } else if (error.code === 'ECONNABORTED') {
      // 타임아웃
      errorMessage = '요청 시간이 초과되었습니다.\n다시 시도해주세요.';
    }

    return {
      success: false,
      ingredients: [],
      error: errorMessage,
    };
  }
};

/**
 * 재료 저장 API (에러 처리 포함)
 * 사용자가 확인/수정한 재료 목록을 DB에 저장
 *
 * @param {Array} ingredients - 재료 목록 [{id, name}, ...]
 * @returns {Promise<Object>} { success: boolean, message?: string, error?: string }
 * @example
 * const result = await saveIngredients([{id: 1, name: '소고기'}, ...]);
 * if (result.success) {
 *   console.log(result.message);
 * } else {
 *   console.error(result.error);
 * }
 */
export const saveIngredients = async ingredients => {
  try {
    console.log('📤 재료 저장 API 호출:', ingredients);

    const response = await axios.post('/api/ingredients/save', {
      ingredients,
    });

    console.log('✅ 재료 저장 성공:', response.data);
    return {
      success: true,
      message: response.data.message || '재료가 저장되었습니다.',
    };
  } catch (error) {
    console.error('❌ 재료 저장 API 에러:', error);

    // 에러 타입별 메시지 반환
    let errorMessage = '재료 저장에 실패했습니다.';

    if (error.response) {
      // 서버 응답 에러 (4xx, 5xx)
      errorMessage =
        error.response.data?.message || '서버 오류가 발생했습니다.';
    } else if (error.request) {
      // 네트워크 에러
      errorMessage = '서버에 연결할 수 없습니다.\n인터넷 연결을 확인해주세요.';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};
