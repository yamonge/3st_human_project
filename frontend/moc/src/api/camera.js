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
    console.log('📤 OCR API 호출:', photoPath);

    const formData = new FormData();
    formData.append('file', {
      // ✅ Controller와 일치
      uri: `file://${photoPath}`,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    });

    const response = await axios.post(
      '/api/receipt/ocr', // ✅ 정확한 URL
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      },
    );

    console.log('✅ OCR 성공:', response.data);

    return {
      success: true,
      ingredients: response.data.ingredients ?? [],
    };
  } catch (error) {
    console.error('❌ OCR API 에러:', error);

    let errorMessage = '재료 인식에 실패했습니다.';

    if (error.response) {
      errorMessage =
        error.response.data?.message || '서버 오류가 발생했습니다.';
    } else if (error.request) {
      errorMessage =
        '서버에 연결할 수 없습니다.\n네트워크 상태를 확인해주세요.';
    } else if (error.code === 'ECONNABORTED') {
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
 * AI 레시피 추천 API (에러 처리 포함)
 * 선택한 재료와 필터 정보를 기반으로 AI가 레시피를 추천
 *
 * @param {Array} ingredients - 선택한 재료 목록 [{id, name, usage, amount}, ...]
 * @param {Object} filters - 필터 정보 {style, difficulty, time}
 * @returns {Promise<Object>} { success: boolean, recipes?: Array, error?: string }
 * @example
 * const result = await recommendRecipes(ingredients, {style: '퓨전', difficulty: '보통', time: '30분'});
 * if (result.success) {
 *   console.log(result.recipes);
 * } else {
 *   console.error(result.error);
 * }
 */
export const recommendRecipes = async (ingredients, filters) => {
  try {
    console.log('📤 AI 레시피 추천 API 호출:', {ingredients, filters});

    // 1️⃣ 프론트 재료 → 백엔드 DTO 구조로 변환
    const selectedIngredients = ingredients.map(item => ({
      ingredientName: item.name,
      usageType: item.usage, // "ALL" | "PARTIAL"
      amountHint: item.amount, // "LITTLE" | "MEDIUM" | "MUCH"
    }));

    // 2️⃣ 백엔드가 기대하는 Request DTO 구성
    const requestBody = {
      selectedIngredients,
      filterCuisineCd: filters?.style || null,
      filterDifficultyCd: filters?.difficulty || null,
      filterCookTimeCd: filters?.time || null,
    };

    // 3️⃣ 실제 백엔드 호출
    const response = await axios.post(
      '/api/recipes/recommend',
      requestBody,
      {timeout: 60000}, // AI 호출 고려
    );

    console.log('✅ AI 레시피 추천 성공:', response.data);

    return {
      success: true,
      recipes: response.data || [],
    };
  } catch (error) {
    console.error('❌ 레시피 추천 API 에러:', error);

    let errorMessage = '레시피 추천에 실패했습니다.';

    if (error.response) {
      errorMessage =
        error.response.data?.message || '서버 오류가 발생했습니다.';
    } else if (error.request) {
      errorMessage = '서버에 연결할 수 없습니다.\n인터넷 연결을 확인해주세요.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '요청 시간이 초과되었습니다.\n다시 시도해주세요.';
    }

    return {
      success: false,
      recipes: [],
      error: errorMessage,
    };
  }
};

/**
 * 재료 저장 API
 * OCR → 사용자 수정 완료 후 "다음 / 레시피 추천" 시점에 호출
 *
 * @param {number} userId - 로그인 사용자 ID
 * @param {Array<string>} ingredientNames - 최종 확정된 재료명 목록
 */
export const saveIngredients = async (userId, ingredientNames) => {
  try {
    console.log('📤 재료 저장 API 호출:', {userId, ingredientNames});

    const response = await axios.post(
      `/api/v1/users/${userId}/ingredients/from-receipt`,
      ingredientNames, // ✅ List<String>
    );

    console.log('✅ 재료 저장 성공:', response.data);

    return {
      success: true,
      ingredients: response.data,
    };
  } catch (error) {
    console.error('❌ 재료 저장 API 에러:', error);

    let errorMessage = '재료 저장에 실패했습니다.';

    if (error.response) {
      errorMessage =
        error.response.data?.message || '서버 오류가 발생했습니다.';
    } else if (error.request) {
      errorMessage = '서버에 연결할 수 없습니다.';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * 레시피 저장 API
 * AI 추천 레시피 또는 사용자가 선택한 레시피를 DB에 저장
 *
 * @param {number} userId - 사용자 ID
 * @param {Object} recipe - 저장할 레시피 전체 데이터
 * @returns {Promise<{ success: boolean, recipeId?: number, error?: string }>}
 */
export const saveRecipe = async (userId, recipe) => {
  try {
    console.log('📤 레시피 저장 API 호출', {userId, recipe});

    const response = await axios.post(`/api/v1/users/${userId}/recipes`, {
      title: recipe.title,
      summary: recipe.summary,
      difficultyCd: recipe.difficultyCd,
      cookTimeMin: recipe.cookTimeMin,
      cuisineStyleCd: recipe.cuisineStyleCd,
      category: recipe.category,
      share: recipe.share ?? false,

      ingredients: recipe.ingredients.map(ing => ({
        ingredientName: ing.ingredientName,
        quantityDesc: ing.quantityDesc,
      })),

      steps: recipe.steps.map((step, index) => ({
        stepNo: step.stepNo ?? index + 1,
        stepDesc: step.stepDesc,
      })),
    });

    console.log('✅ 레시피 저장 성공:', response.data);

    return {
      success: true,
      recipeId: response.data, // Long recipeId
    };
  } catch (error) {
    console.error('❌ 레시피 저장 API 에러:', error);

    let errorMessage = '레시피 저장에 실패했습니다.';

    if (error.response) {
      errorMessage =
        error.response.data?.message || '서버 오류가 발생했습니다.';
    } else if (error.request) {
      errorMessage = '서버에 연결할 수 없습니다.\n인터넷 연결을 확인해주세요.';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * 재료 소비 API (레시피 시작 시 사용)
 * 레시피를 시작할 때 사용된 재료를 DB에서 소비 처리 (used_flag = true)
 *
 * @param {number} recipeId - 레시피 ID
 * @param {Array} ingredientIds - 소비할 재료 ID 목록 [1, 2, 3, ...]
 * @returns {Promise<Object>} { success: boolean, message?: string, error?: string }
 * @example
 * const result = await consumeIngredients(123, [1, 2, 3]);
 * if (result.success) {
 *   console.log(result.message);
 * } else {
 *   console.error(result.error);
 * }
 */
export const consumeIngredients = async (userId, recipeId, ingredients) => {
  try {
    const requestBody = {
      recipeId,
      ingredients: ingredients.map(item => ({
        userIngredientId: item.userIngredientId,
        usageType: item.usage, // "ALL" | "PARTIAL"
      })),
    };

    const response = await axios.post(
      `/api/v1/users/${userId}/ingredients/consume`,
      requestBody,
    );

    return {success: true};
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || '재료 소비 처리에 실패했습니다.',
    };
  }
};
