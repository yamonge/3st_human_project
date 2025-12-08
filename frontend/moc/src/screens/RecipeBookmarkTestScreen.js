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
import axios from 'axios'; // ⭐ axios 임포트 추가

// ⭐ 백엔드 API 기본 URL (Android 에뮬레이터용)
// UserIngredientController와 RecipeBookmarkController 모두 /api/v1/users/{userId}/... 경로를 사용한다고 가정합니다.
const API_BASE_URL = 'http://192.168.35.21:8090/api/v1/users';

const RecipeBookmarkTestScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState(null);

  // ⭐ 테스트용 사용자 ID (백엔드 Long 타입에 맞게 숫자 형태의 문자열로 유지)
  const [testUserId] = useState('12345'); // 실제 백엔드 DB의 NUMBER(19)에 매핑될 Long 값

  // 북마크할 레시피 ID 입력 필드 상태
  const [inputRecipeId, setInputRecipeId] = useState('');

  // 조회된 북마크 목록 및 개수 상태
  const [bookmarkedList, setBookmarkedList] = useState([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [isBookmarkedStatus, setIsBookmarkedStatus] = useState(false); // 특정 레시피 북마크 상태

  // 컴포넌트 마운트 시 초기 북마크 목록 및 개수 조회
  useEffect(() => {
    fetchBookmarkedRecipesAndCount();
  }, []);

  // 북마크 목록 및 개수를 가져오는 함수
  const fetchBookmarkedRecipesAndCount = async () => {
    setIsLoading(true);
    setError(null);
    setResponseMessage('');
    try {
      // 북마크 목록 조회 API 호출
      const listResponse = await axios.get(
        `${API_BASE_URL}/${testUserId}/bookmarks`,
      );
      setBookmarkedList(listResponse.data.bookmarkedRecipes || []); // .data에 bookmarkedRecipes 리스트가 있음
      setResponseMessage('북마크 목록 조회 성공!');

      // 북마크 개수 조회 API 호출
      const countResponse = await axios.get(
        `${API_BASE_URL}/${testUserId}/bookmarks/count`,
      );
      setBookmarkCount(countResponse.data); // .data에 총 개수(int)가 바로 들어옴
    } catch (e) {
      console.error(
        '초기 북마크 정보 조회 중 오류 발생:',
        e.response?.data || e.message,
      );
      setError(
        e.response?.data?.message || e.message || '초기 북마크 정보 조회 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 레시피 북마크 추가
  const handleAddBookmark = async () => {
    if (!inputRecipeId) {
      Alert.alert('알림', '북마크할 레시피 ID를 입력하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    const requestBody = {
      recipeId: Number(inputRecipeId), // 문자열을 숫자로 변환하여 전송
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/${testUserId}/bookmarks`,
        requestBody,
      );

      setResponseMessage(
        `북마크 추가 성공: 레시피 ID ${response.data.recipeId}`,
      );
      Alert.alert(
        '성공',
        `레시피 ID ${response.data.recipeId}가 북마크되었습니다.`,
      );
      setInputRecipeId(''); // 입력 필드 초기화
      fetchBookmarkedRecipesAndCount(); // 목록 새로고침
    } catch (e) {
      console.error('북마크 추가 중 오류 발생:', e.response?.data || e.message);
      setError(e.response?.data?.message || e.message || '북마크 추가 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '북마크 추가 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 레시피 북마크 삭제
  const handleDeleteBookmark = async () => {
    if (!inputRecipeId) {
      Alert.alert('알림', '삭제할 레시피 ID를 입력하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    try {
      await axios.delete(
        `${API_BASE_URL}/${testUserId}/bookmarks/${inputRecipeId}`,
      );

      setResponseMessage(`북마크 삭제 성공: 레시피 ID ${inputRecipeId}`);
      Alert.alert(
        '성공',
        `레시피 ID ${inputRecipeId} 북마크가 삭제되었습니다.`,
      );
      setInputRecipeId(''); // 입력 필드 초기화
      fetchBookmarkedRecipesAndCount(); // 목록 새로고침
    } catch (e) {
      console.error('북마크 삭제 중 오류 발생:', e.response?.data || e.message);
      setError(e.response?.data?.message || e.message || '북마크 삭제 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '북마크 삭제 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 레시피 북마크 상태 확인
  const handleCheckBookmarkStatus = async () => {
    if (!inputRecipeId) {
      Alert.alert('알림', '확인할 레시피 ID를 입력하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/${testUserId}/bookmarks/check/${inputRecipeId}`,
      );
      setIsBookmarkedStatus(response.data); // true 또는 false 값을 받음
      setResponseMessage(`레시피 ID ${inputRecipeId} 북마크 상태 확인 완료.`);
      Alert.alert(
        '북마크 상태',
        `레시피 ID ${inputRecipeId}는 북마크 ${
          response.data ? '되어 있습니다.' : '되어 있지 않습니다.'
        }`,
      );
    } catch (e) {
      console.error(
        '북마크 상태 확인 중 오류 발생:',
        e.response?.data || e.message,
      );
      setError(
        e.response?.data?.message || e.message || '북마크 상태 확인 실패',
      );
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '북마크 상태 확인 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>레시피 북마크 API 테스트</Text>
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

        {/* 북마크할 레시피 ID 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>레시피 ID 입력</Text>
          <TextInput
            style={styles.input}
            placeholder="북마크할 레시피 ID (숫자만)"
            keyboardType="numeric"
            value={inputRecipeId}
            onChangeText={setInputRecipeId}
          />
          <View style={styles.buttonGroup}>
            <Button
              title="북마크 추가"
              onPress={handleAddBookmark}
              disabled={isLoading}
            />
            <Button
              title="북마크 삭제"
              onPress={handleDeleteBookmark}
              disabled={isLoading}
              color="red"
            />
          </View>
          <View style={styles.buttonGroup}>
            <Button
              title="북마크 상태 확인"
              onPress={handleCheckBookmarkStatus}
              disabled={isLoading}
            />
            {isBookmarkedStatus !== null && (
              <Text
                style={[
                  styles.statusText,
                  {color: isBookmarkedStatus ? 'green' : 'gray'},
                ]}>
                {isBookmarkedStatus ? '✅ 북마크됨' : '❌ 북마크 안됨'}
              </Text>
            )}
          </View>
        </View>

        {/* 북마크된 레시피 목록 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            북마크된 레시피 목록 (총 {bookmarkCount}개)
          </Text>
          <Button
            title="목록 새로고침"
            onPress={fetchBookmarkedRecipesAndCount}
            disabled={isLoading}
          />
          {bookmarkedList.length > 0 ? (
            bookmarkedList.map(item => (
              <TouchableOpacity
                key={item.bookmarkId} // 북마크 ID를 key로 사용
                style={styles.bookmarkItem}
                onPress={() => {
                  setInputRecipeId(String(item.recipeId)); // 해당 레시피 ID 입력 필드에 채우기
                  Alert.alert(
                    '레시피 선택',
                    `레시피 ID: ${item.recipe.recipeId}, 제목: ${item.recipe.title} 선택됨.`,
                  );
                }}>
                <Text style={styles.itemText}>
                  북마크 ID: {item.bookmarkId}
                </Text>
                <Text style={styles.itemTextBold}>
                  제목: {item.recipe?.title || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  저장일: {item.savedDateFormatted || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  난이도: {item.recipe?.difficultyCd || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  조리 시간: {item.recipe?.cookTimeMin}분
                </Text>
                <Text style={styles.itemText}>
                  좋아요 수: {item.recipe?.likeCnt}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>
              북마크된 레시피가 없습니다. 레시피를 저장해보세요.
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
    marginLeft: 10,
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
  bookmarkItem: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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

export default RecipeBookmarkTestScreen;
