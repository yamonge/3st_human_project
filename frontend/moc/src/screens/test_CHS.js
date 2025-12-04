import React, {useState} from 'react';
import {
  Button,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

// 💡 1. API 호출 로직을 컴포넌트 외부에 정의 (재사용성 및 가독성 유지)
const testRecipeGeneration = async () => {
  // 1. 테스트에 사용할 재료 목록
  const ingredients = ['김치', '돼지고기', '두부'];

  // 2. 백엔드 API 엔드포인트 (실제 서버 주소로 변경해야 합니다!)
  //    ⚠️ 이 부분을 실제 Spring Boot 서버의 주소와 포트, 엔드포인트로 변경해야 합니다.
  const API_URL = 'http://YOUR_SERVER_IP:YOUR_PORT/api/recipe/generate';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 3. 백엔드 서비스의 generateAndFormatRecipe 메서드에 맞게 데이터 전송
      body: JSON.stringify({recognizedIngredients: ingredients}),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `API 호출 실패: ${response.status} ${response.statusText}. 응답: ${errorBody}`,
      );
    }

    // 4. 백엔드에서 반환된 RecipeResponse DTO (JSON) 파싱
    const data = await response.json();
    return data; // { recipeJson: "...", imageUrl: "..." } 형태의 객체 반환
  } catch (error) {
    console.error('testRecipeGeneration 에러:', error);
    throw error;
  }
};

const test_CHS = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTestPress = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    console.log('테스트 버튼이 눌렸습니다. API 호출 시작...');

    try {
      // 💡 통합된 함수 호출
      const apiResult = await testRecipeGeneration();
      setResult(apiResult);
    } catch (e) {
      console.error('API 호출 중 오류 발생:', e);
      setError(e.message || '알 수 없는 오류가 발생했습니다.');
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
            <Text style={styles.resultText}>- 이미지 URL:</Text>
            <Text style={styles.resultValue}>{result.imageUrl || 'N/A'}</Text>

            <Text style={styles.resultText}>- 레시피 JSON:</Text>
            {/* JSON 문자열을 파싱하여 보기 좋게 포맷팅 */}
            <Text style={styles.resultValue}>
              {/* recipeJson이 유효한 JSON인지 확인 후 포맷팅 */}
              {result.recipeJson
                ? JSON.stringify(JSON.parse(result.recipeJson), null, 2)
                : 'JSON 데이터 없음'}
            </Text>
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
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  loading: {
    marginTop: 20,
  },
  resultContainer: {
    marginTop: 20,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'green',
  },
  resultText: {
    fontWeight: 'bold',
    marginTop: 5,
  },
  resultValue: {
    fontSize: 12,
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 4,
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default test_CHS;
