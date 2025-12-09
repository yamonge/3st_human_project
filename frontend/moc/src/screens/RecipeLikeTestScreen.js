import React, {useState, useEffect} from 'react';
import {
  Button,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios'; // axios 임포트

// ⭐ 백엔드 API 기본 URL (Android 에뮬레이터용)
// 모든 user 관련 컨트롤러는 /api/v1/users/{userId}/... 경로를 사용한다고 가정합니다.
const API_BASE_URL = 'http://192.168.35.21:8090/api/v1/users';

const RecipeLikeTestScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState(null);

  // ⭐ 테스트용 사용자 ID (백엔드 Long 타입에 맞게 숫자 형태의 문자열로 유지)
  const [testUserId] = useState('12345'); // 실제 백엔드 DB의 NUMBER(19)에 매핑될 Long 값

  // 좋아요할 레시피 ID 입력 필드 상태
  const [inputRecipeId, setInputRecipeId] = useState('');

  // 조회된 좋아요 목록 및 개수 상태
  const [likedList, setLikedList] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [isLikedStatus, setIsLikedStatus] = useState(null); // 특정 레시피 좋아요 상태 (true/false)

  // 컴포넌트 마운트 시 초기 좋아요 목록 및 개수 조회
  useEffect(() => {
    fetchLikedRecipesAndCount();
  }, []);

  // 좋아요 목록 및 개수를 가져오는 함수
  const fetchLikedRecipesAndCount = async () => {
    setIsLoading(true);
    setError(null);
    setResponseMessage('');
    try {
      // 좋아요 목록 조회 API 호출
      const listResponse = await axios.get(
        `${API_BASE_URL}/${testUserId}/likes`,
      );
      setLikedList(listResponse.data.likedRecipes || []); // .data에 likedRecipes 리스트가 있음
      setResponseMessage('좋아요 목록 조회 성공!');

      // 좋아요 개수 조회 API 호출
      const countResponse = await axios.get(
        `${API_BASE_URL}/${testUserId}/likes/count`,
      );
      setLikeCount(countResponse.data); // .data에 총 개수(int)가 바로 들어옴
    } catch (e) {
      console.error(
        '초기 좋아요 정보 조회 중 오류 발생:',
        e.response?.data || e.message,
      );
      setError(
        e.response?.data?.message || e.message || '초기 좋아요 정보 조회 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 레시피 좋아요 토글 (추가 또는 취소)
  const handleToggleLike = async () => {
    if (!inputRecipeId) {
      Alert.alert('알림', '좋아요/취소할 레시피 ID를 입력하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    const requestBody = {
      recipeId: Number(inputRecipeId), // 문자열을 숫자로 변환하여 전송
    };

    try {
      // API 경로: /api/v1/users/{userId}/likes
      const response = await axios.post(
        `${API_BASE_URL}/${testUserId}/likes`,
        requestBody,
      );

      const newStatus = response.data; // 백엔드에서 true/false를 반환한다고 가정
      setIsLikedStatus(newStatus);
      setResponseMessage(
        `레시피 ID ${inputRecipeId} 좋아요 ${
          newStatus ? '추가' : '취소'
        } 성공.`,
      );
      Alert.alert(
        '성공',
        `레시피 ID ${inputRecipeId} 좋아요가 ${
          newStatus ? '추가' : '취소'
        }되었습니다.`,
      );
      // setInputRecipeId(''); // 입력 필드 초기화하지 않고 상태 확인 가능하게 유지
      fetchLikedRecipesAndCount(); // 목록 새로고침
    } catch (e) {
      console.error('좋아요 토글 중 오류 발생:', e.response?.data || e.message);
      setError(e.response?.data?.message || e.message || '좋아요 토글 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '좋아요 토글 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 레시피 좋아요 상태 확인
  const handleCheckLikeStatus = async () => {
    if (!inputRecipeId) {
      Alert.alert('알림', '확인할 레시피 ID를 입력하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    try {
      // API 경로: /api/v1/users/{userId}/likes/check/{recipeId}
      const response = await axios.get(
        `${API_BASE_URL}/${testUserId}/likes/check/${inputRecipeId}`,
      );
      setIsLikedStatus(response.data); // true 또는 false 값을 받음
      setResponseMessage(`레시피 ID ${inputRecipeId} 좋아요 상태 확인 완료.`);
      Alert.alert(
        '좋아요 상태',
        `레시피 ID ${inputRecipeId}는 좋아요 ${
          response.data ? '되어 있습니다.' : '되어 있지 않습니다.'
        }`,
      );
    } catch (e) {
      console.error(
        '좋아요 상태 확인 중 오류 발생:',
        e.response?.data || e.message,
      );
      setError(
        e.response?.data?.message || e.message || '좋아요 상태 확인 실패',
      );
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '좋아요 상태 확인 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>레시피 좋아요 API 테스트</Text>
        <Text style={styles.subtitle}>현재 사용자 ID: {testUserId}</Text>

        {isLoading && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loading}
          />
        )}
        {error && <Text style={styles.errorText}>오류: {error}</Text>}
        {responseMessage && (
          <Text style={styles.successText}>{responseMessage}</Text>
        )}

        {/* 좋아요할 레시피 ID 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>레시피 ID 입력</Text>
          <TextInput
            style={styles.input}
            placeholder="좋아요/취소할 레시피 ID (숫자만)"
            keyboardType="numeric"
            value={inputRecipeId}
            onChangeText={setInputRecipeId}
          />
          <View style={styles.buttonGroup}>
            <Button
              title="좋아요 토글 (추가/취소)"
              onPress={handleToggleLike}
              disabled={isLoading}
            />
            <Button
              title="좋아요 상태 확인"
              onPress={handleCheckLikeStatus}
              disabled={isLoading}
            />
          </View>
          {isLikedStatus !== null && (
            <Text
              style={[
                styles.statusText,
                {color: isLikedStatus ? 'green' : 'gray'},
              ]}>
              {isLikedStatus ? '✅ 좋아요됨' : '❌ 좋아요 안됨'}
            </Text>
          )}
        </View>

        {/* 좋아요된 레시피 목록 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            좋아요한 레시피 목록 (총 {likeCount}개)
          </Text>
          <Button
            title="목록 새로고침"
            onPress={fetchLikedRecipesAndCount}
            disabled={isLoading}
          />
          {likedList.length > 0 ? (
            likedList.map(item => (
              <TouchableOpacity
                key={item.likeId} // 좋아요 ID를 key로 사용
                style={styles.likedItem}
                onPress={() => {
                  setInputRecipeId(String(item.recipe.recipeId)); // 해당 레시피 ID 입력 필드에 채우기
                  Alert.alert(
                    '레시피 선택',
                    `레시피 ID: ${item.recipe.recipeId}, 제목: ${item.recipe.title} 선택됨.`,
                  );
                }}>
                <Text style={styles.itemText}>좋아요 ID: {item.likeId}</Text>
                <Text style={styles.itemTextBold}>
                  제목: {item.recipe?.title || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  좋아요 일시: {item.likedDateFormatted || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  난이도: {item.recipe?.difficultyCd || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  조리 시간: {item.recipe?.cookTimeMin}분
                </Text>
                <Text style={styles.itemText}>
                  총 좋아요 수: {item.recipe?.likeCnt}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>
              좋아요한 레시피가 없습니다. 레시피에 좋아요를 눌러보세요.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  loading: {
    marginVertical: 20,
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 5,
  },
  likedItem: {
    backgroundColor: '#fff0f5', // 연한 핑크색 배경 (좋아요된 레시피 목록용)
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ffd9ec',
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  itemTextBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  noDataText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 10,
  },
});

export default RecipeLikeTestScreen;
