import React, {useState} from 'react';
import {
  Button,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert, // Alert 추가
} from 'react-native';

// 💡 1. API 호출 로직을 컴포넌트 외부에 정의 (재사용성 및 가독성 유지)
const testRecipeGeneration = async (
  selectedIngredients,
  filterCuisine,
  filterDifficulty,
  filterCookTime,
  userId,
) => {
  const API_URL = 'http://192.168.1.49:8090/api/v1/recipes/recommend'; // 엔드포인트 수정!

  // 3. 백엔드 서비스의 RecipeGenerationRequestDTO에 맞게 데이터 전송
  const requestBody = {
    selectedIngredients: selectedIngredients.map(ing => ({
      ingredientName: ing,
      usageType: 'ALL', // 기본값으로 'ALL' 설정. UI에서 선택하도록 확장 가능
      amountHint: 'MEDIUM', // 기본값으로 'MEDIUM' 설정. UI에서 선택하도록 확장 가능
    })),
    filterCuisineCd: filterCuisine,
    filterDifficultyCd: filterDifficulty,
    filterCookTimeCd: filterCookTime,
    userId: userId, // 사용자 ID 전달 (로그 저장용 등)
    // cameraSessionId: 'test_session_123', // 필요시 추가
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody), // 수정된 requestBody 사용
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `API 호출 실패: ${response.status} ${response.statusText}. 응답: ${errorBody}`,
      );
    }

    // 4. 백엔드에서 반환된 RecipeRecommendationResponseDTO (JSON) 파싱
    const data = await response.json();
    return data; // { recommendedRecipes: [...], status: "...", message: "..." } 형태
  } catch (error) {
    console.error('testRecipeGeneration 에러:', error);
    throw error;
  }
};

const Test_CHS = () => {
  // 컴포넌트 이름은 파스칼 케이스(PascalCase)가 관례입니다.
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null); // API 응답 전체를 저장
  const [error, setError] = useState(null);

  // 테스트에 사용할 샘플 데이터 (실제 앱에서는 사용자 입력으로 받아야 합니다)
  const [testIngredients] = useState(['김치', '돼지고기', '두부']);
  const [testCuisine] = useState('KOR'); // 한식
  const [testDifficulty] = useState('EASY'); // 쉬움
  const [testCookTime] = useState('30M'); // 30분 이내
  const [testUserId] = useState('123'); // 임시 사용자 ID

  const handleTestPress = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    console.log('테스트 버튼이 눌렸습니다. API 호출 시작...');

    try {
      // 💡 통합된 함수 호출, 인자 전달
      const apiResult = await testRecipeGeneration(
        testIngredients,
        testCuisine,
        testDifficulty,
        testCookTime,
        testUserId,
      );
      setResult(apiResult);
      if (
        apiResult.status === 'SUCCESS' &&
        apiResult.recommendedRecipes &&
        apiResult.recommendedRecipes.length > 0
      ) {
        Alert.alert('성공', apiResult.message || '레시피 추천에 성공했습니다!');
      } else {
        Alert.alert(
          '알림',
          apiResult.message || '레시피를 찾을 수 없거나 생성에 실패했습니다.',
        );
      }
    } catch (e) {
      console.error('API 호출 중 오류 발생:', e);
      setError(e.message || '알 수 없는 오류가 발생했습니다.');
      Alert.alert('오류', e.message || 'API 호출 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>레시피 생성 API 테스트</Text>

      <Button
        title={isLoading ? '테스트 중...' : '테스트 실행'}
        onPress={handleTestPress}
        disabled={isLoading}
      />

      {isLoading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loading}
        />
      )}

      <ScrollView style={styles.resultContainer}>
        {error && <Text style={styles.errorText}>오류: {error}</Text>}

        {result && (
          <View>
            <Text style={styles.resultTitle}>✅ API 호출 성공</Text>
            <Text style={styles.resultText}>- 상태:</Text>
            <Text style={styles.resultValue}>{result.status}</Text>
            <Text style={styles.resultText}>- 메시지:</Text>
            <Text style={styles.resultValue}>{result.message}</Text>

            {result.recommendedRecipes &&
            result.recommendedRecipes.length > 0 ? (
              result.recommendedRecipes.map((recipe, index) => (
                <View key={recipe.recipeId || index} style={styles.recipeCard}>
                  <Text style={styles.recipeCardTitle}>
                    레시피 {index + 1}: {recipe.title}
                  </Text>
                  <Text style={styles.resultText}>썸네일 URL:</Text>
                  <Text style={styles.resultValue}>
                    {recipe.thumbnailUrl || 'N/A'}
                  </Text>
                  <Text style={styles.resultText}>
                    난이도: {recipe.difficultyCd}
                  </Text>
                  <Text style={styles.resultText}>
                    조리 시간: {recipe.cookTimeMin}분
                  </Text>
                  <Text style={styles.resultText}>
                    요리 스타일: {recipe.cuisineStyleCd}
                  </Text>

                  <Text style={styles.resultText}>필요 재료:</Text>
                  {recipe.requiredIngredients.map((ing, ingIndex) => (
                    <Text key={ingIndex} style={styles.resultValue}>
                      - {ing.ingredientName} ({ing.quantityDesc}){' '}
                      {ing.isOwned ? '(보유)' : '(부족)'}
                    </Text>
                  ))}

                  <Text style={styles.resultText}>조리 순서:</Text>
                  {recipe.cookingSteps.map((step, stepIndex) => (
                    <Text key={stepIndex} style={styles.resultValue}>
                      {step.stepNo}. {step.stepDesc} (
                      {step.imageUrl || '이미지 없음'})
                    </Text>
                  ))}
                </View>
              ))
            ) : (
              <Text style={styles.resultText}>추천된 레시피가 없습니다.</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  loading: {
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'green',
  },
  resultText: {
    fontWeight: 'bold',
    marginTop: 5,
    color: '#555',
  },
  resultValue: {
    fontSize: 13,
    backgroundColor: '#f9f9f9',
    padding: 5,
    borderRadius: 4,
    marginBottom: 3,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 14,
  },
  recipeCard: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
  },
  recipeCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
});

export default Test_CHS;
