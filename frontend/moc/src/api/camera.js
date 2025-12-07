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

    // TODO: 백엔드 개발 완료 후 주석 해제
    // const response = await axios.post('/api/recipes/recommend', {
    //   ingredients,
    //   filters,
    // });
    //
    // console.log('✅ AI 레시피 추천 성공:', response.data);
    // return {
    //   success: true,
    //   recipes: response.data.recipes || [],
    // };

    // 개발 단계: 더미 데이터 반환
    console.log('⚠️ 개발 모드: 더미 레시피 데이터 반환');

    // 서버 응답 시뮬레이션 (1초 딜레이)
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      recipes: [
        {
          id: 1,
          title: '소고기 덮밥',
          difficulty: '쉬움',
          cookingTime: '30분',
          imageUrl: null,
          // 상세 정보 포함 (AI 1회 호출로 모든 정보 제공)
          ingredients: [
            {name: '소고기', amount: '200g'},
            {name: '양파', amount: '1개'},
            {name: '간장', amount: '3스푼'},
          ],
          steps: [
            '소고기를 한입 크기로 썰어주세요.',
            '양파를 채썰어 준비합니다.',
            '팬에 기름을 두르고 소고기를 볶습니다.',
            '양파를 넣고 함께 볶아주세요.',
            '간장으로 간을 맞춰 완성합니다.',
          ],
        },
        {
          id: 2,
          title: '비빔밥',
          difficulty: '보통',
          cookingTime: '30분',
          imageUrl: null,
          ingredients: [
            {name: '밥', amount: '1공기'},
            {name: '소고기', amount: '100g'},
            {name: '시금치', amount: '50g'},
            {name: '당근', amount: '1/2개'},
            {name: '고추장', amount: '2스푼'},
          ],
          steps: [
            '밥을 짓고 야채를 씻어 준비합니다.',
            '소고기를 양념하여 볶습니다.',
            '야채를 각각 데쳐서 준비합니다.',
            '그릇에 밥을 담고 재료를 예쁘게 올립니다.',
            '고추장을 얹어 비벼 먹습니다.',
          ],
        },
        {
          id: 3,
          title: '소고기 무국',
          difficulty: '쉬움',
          cookingTime: '30분',
          imageUrl: null,
          ingredients: [
            {name: '소고기', amount: '150g'},
            {name: '무', amount: '1/4개'},
            {name: '국간장', amount: '2스푼'},
            {name: '다진 마늘', amount: '1스푼'},
          ],
          steps: [
            '무를 먹기 좋은 크기로 썰어주세요.',
            '소고기도 적당한 크기로 썰어 준비합니다.',
            '냄비에 참기름을 두르고 소고기를 볶습니다.',
            '무를 넣고 함께 볶아주세요.',
            '물을 붓고 끓인 후 국간장으로 간을 맞춥니다.',
          ],
        },
      ],
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
