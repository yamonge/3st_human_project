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

// ✅ 레시피 응답 공통 정규화 (항상 최상단에! import문 바로 밑)
const normalizeRecipe = recipe => {
  if (!recipe) return recipe;

  const r = {...recipe};

  // 실제 디바이스 localhost 보정 (로컬 네트워크 IP 사용)
  if (r.thumbnailUrl?.startsWith('http://localhost:8090')) {
    r.thumbnailUrl = r.thumbnailUrl.replace(
      'http://localhost:8090',
      'http://192.168.50.117:8090',
    );
  }

  // 난이도 한글화 (화면 공통 사용)
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

export const recognizeIngredients = async photoPath => {
  try {
    console.log('📤 OCR API 호출:', photoPath);

    // ✅ URI 정규화: Android Content URI와 일반 파일 경로 모두 처리
    let normalizedUri = photoPath;

    // content:// 로 시작하면 Android Content URI
    if (photoPath.startsWith('content://')) {
      normalizedUri = photoPath; // 그대로 사용
    }
    // file:// 로 시작하면 그대로
    else if (photoPath.startsWith('file://')) {
      normalizedUri = photoPath;
    }
    // 일반 경로면 file:// 붙이기
    else {
      normalizedUri = `file://${photoPath}`;
    }

    console.log('🔄 정규화된 URI:', normalizedUri);

    const formData = new FormData();
    formData.append('file', {
      uri: normalizedUri,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    });

    const response = await axios.post(
      '/receipt/ocr', // ✅ 정확한 URL
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      },
    );

    console.log('✅ OCR 성공:', response);

    return {
      success: true,
      ingredients: response.ingredients ?? [],
    };
  } catch (error) {
    console.error('❌ OCR API 에러:', error);

    let errorMessage = '재료 인식에 실패했습니다.';

    if (error.response) {
      errorMessage = error.response?.message || '서버 오류가 발생했습니다.';
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
 */
export const recommendRecipes = async (userId, ingredients, filters) => {
  try {
    const selectedIngredients = ingredients.map(item => ({
      ingredientName: item.name,
      usageType: item.usage,
      amountHint: item.amount,
    }));

    const requestBody = {
      userId,
      selectedIngredients,
      filterCuisineCd: filters?.style || null,
      filterDifficultyCd: filters?.difficulty || null,
      filterCookTimeCd: filters?.time || null,
    };

    const response = await axios.post('/recipes/recommend', requestBody, {
      timeout: 60000,
    });

    // ✅ axios interceptor 기준
    console.log('🌐 response =', response);

    //////이 함수를 사용하는 부분////////////
    const recipes = Array.isArray(response.recommendedRecipes)
      ? response.recommendedRecipes.map(normalizeRecipe)
      : [];

    return {
      success: response.status === 'SUCCESS',
      recipes,
      message: response.message,
    };
  } catch (error) {
    console.error('❌ 레시피 추천 API 에러:', error);

    return {
      success: false,
      recipes: [],
      error: '레시피 추천에 실패했습니다.',
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
      `/v1/users/${userId}/ingredients/from-receipt`,
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
    console.log('🔥 saveRecipe 호출 직전 recipe', recipe);
    const response = await axios.post(`/v1/users/${userId}/recipes`, {
      title: recipe.title,
      summary: recipe.summary,
      thumbnailUrl: recipe.thumbnailUrl,
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
    console.log('📤 재료 소비 API 호출:', {userId, recipeId, ingredients});

    const requestBody = {
      recipeId,
      ingredients: ingredients.map(item => ({
        userIngredientId: item.userIngredientId,
        usageType: item.usageType, // "ALL" | "PARTIAL"
      })),
    };

    console.log('📦 requestBody:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(
      `/v1/users/${userId}/ingredients/consume`,
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

// 재료 저장 API
export const addUserIngredient = async (userId, ingredient) => {
  try {
    console.log('📤 재료 저장:', {userId, ingredient});

    const response = await axios.post(`/v1/users/${userId}/ingredients`, {
      ingredientName: ingredient.name,
      quantityDesc: ingredient.amount,
      usedFlag: 'N',
      memo: '',
    });

    return {success: true, ingredient: response};
  } catch (error) {
    return {
      success: false,
      error: error.response?.message || '재료 저장 실패',
    };
  }
};

/**
 * 사용자 재료 목록 조회 API
 * 사용자가 DB에 저장한 모든 재료를 조회
 *
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} { success: boolean, ingredients: Array, error?: string }
 */
export const getUserIngredients = async userId => {
  try {
    console.log('📤 사용자 재료 목록 조회:', userId);

    const response = await axios.get(`/v1/users/${userId}/ingredients`);

    console.log('✅ 재료 목록 조회 성공:', response);

    return {
      success: true,
      ingredients: response.userIngredients || [],
    };
  } catch (error) {
    console.error('❌ 재료 목록 조회 에러:', error);

    // 204 No Content는 빈 배열 반환 (에러 아님)
    if (error.response?.status === 204) {
      return {
        success: true,
        ingredients: [],
      };
    }

    return {
      success: false,
      ingredients: [],
      error: '재료 목록을 불러올 수 없습니다.',
    };
  }
};
