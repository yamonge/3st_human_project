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
import axios from 'axios';

const API_BASE_URL = 'http://192.168.35.21:8090/api/v1/users';

const UserIngredientTestScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState(null);

  const [testUserId] = useState('12345');
  const [currentIngredientId, setCurrentIngredientId] = useState('');

  const [ingredientName, setIngredientName] = useState('');
  const [quantityDesc, setQuantityDesc] = useState('');
  const [categoryCd, setCategoryCd] = useState('');
  const [usedFlag, setUsedFlag] = useState('N');
  const [expiredDate, setExpiredDate] = useState('');
  const [memo, setMemo] = useState('');

  const [ingredientList, setIngredientList] = useState([]);
  const [ingredientCount, setIngredientCount] = useState(0);

  useEffect(() => {
    fetchIngredientsAndCount();
  }, []);

  const fetchIngredientsAndCount = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const listResponse = await axios.get(
        `${API_BASE_URL}/${testUserId}/ingredients`,
      );
      setIngredientList(listResponse.data.userIngredients || []);
      setResponseMessage('재료 목록 조회 성공!');

      // ⭐ axios로 재료 개수 조회
      const countResponse = await axios.get(
        `${API_BASE_URL}/${testUserId}/ingredients/count`,
      );
      setIngredientCount(countResponse.data); // axios는 .data에 응답 본문이 바로 들어옴
    } catch (e) {
      console.error('초기 재료 정보 조회 중 오류 발생:', e);
      // axios 오류는 e.response?.data?.message 또는 e.message로 접근 가능
      setError(
        e.response?.data?.message || e.message || '초기 재료 정보 조회 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 재료 추가
  const handleAddIngredient = async () => {
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    const requestBody = {
      ingredientName,
      quantityDesc,
      categoryCd,
      usedFlag,
      expiredDate,
      memo,
    };

    try {
      // ⭐ axios로 재료 추가
      const response = await axios.post(
        `${API_BASE_URL}/${testUserId}/ingredients`,
        requestBody,
      );

      setResponseMessage(`재료 추가 성공: ${response.data.ingredientName}`);
      Alert.alert(
        '성공',
        `재료 "${response.data.ingredientName}"가 추가되었습니다.`,
      );
      // 입력 필드 초기화
      setIngredientName('');
      setQuantityDesc('');
      setCategoryCd('');
      setUsedFlag('N');
      setExpiredDate('');
      setMemo('');
      fetchIngredientsAndCount(); // 목록 새로고침
    } catch (e) {
      console.error('재료 추가 중 오류 발생:', e);
      setError(e.response?.data?.message || e.message || '재료 추가 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '재료 추가 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 재료 상세 조회
  const handleFetchIngredientDetail = async () => {
    if (!currentIngredientId) {
      Alert.alert('알림', '상세 조회할 재료 ID를 입력하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);
    try {
      // ⭐ axios로 재료 상세 조회
      const response = await axios.get(
        `${API_BASE_URL}/${testUserId}/ingredients/${currentIngredientId}`,
      );

      setResponseMessage(
        `재료 상세 조회 성공: ${response.data.ingredientName}`,
      );
      Alert.alert('상세 정보', JSON.stringify(response.data, null, 2));
      // 조회된 내용으로 입력 필드 채우기 (수정 준비)
      setIngredientName(response.data.ingredientName);
      setQuantityDesc(response.data.quantityDesc);
      setCategoryCd(response.data.categoryCd);
      setUsedFlag(response.data.usedFlag);
      setExpiredDate(response.data.expiredDateFormatted || '');
      setMemo(response.data.memo);
    } catch (e) {
      console.error('재료 상세 조회 중 오류 발생:', e);
      setError(e.response?.data?.message || e.message || '재료 상세 조회 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '재료 상세 조회 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 재료 수정
  const handleUpdateIngredient = async () => {
    if (!currentIngredientId) {
      Alert.alert('알림', '수정할 재료 ID를 입력하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    const requestBody = {
      ingredientName,
      quantityDesc,
      categoryCd,
      usedFlag,
      expiredDate,
      memo,
    };

    try {
      // ⭐ axios로 재료 수정
      const response = await axios.put(
        `${API_BASE_URL}/${testUserId}/ingredients/${currentIngredientId}`,
        requestBody,
      );

      setResponseMessage(`재료 수정 성공: ${response.data.ingredientName}`);
      Alert.alert(
        '성공',
        `재료 "${response.data.ingredientName}"가 수정되었습니다.`,
      );
      fetchIngredientsAndCount(); // 목록 새로고침
    } catch (e) {
      console.error('재료 수정 중 오류 발생:', e);
      setError(e.response?.data?.message || e.message || '재료 수정 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '재료 수정 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 재료 삭제
  const handleDeleteIngredient = async () => {
    if (!currentIngredientId) {
      Alert.alert('알림', '삭제할 재료 ID를 입력하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);
    try {
      // ⭐ axios로 재료 삭제
      await axios.delete(
        `${API_BASE_URL}/${testUserId}/ingredients/${currentIngredientId}`,
      );

      setResponseMessage(`재료 ID ${currentIngredientId} 삭제 성공.`);
      Alert.alert('성공', `재료 ID ${currentIngredientId}가 삭제되었습니다.`);
      setCurrentIngredientId(''); // ID 입력 필드 초기화
      fetchIngredientsAndCount(); // 목록 새로고침
    } catch (e) {
      console.error('재료 삭제 중 오류 발생:', e);
      setError(e.response?.data?.message || e.message || '재료 삭제 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '재료 삭제 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>사용자 재료 관리 API 테스트</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>재료 정보 입력 (추가/수정)</Text>
          <TextInput
            style={styles.input}
            placeholder="재료명 (예: 김치)"
            value={ingredientName}
            onChangeText={setIngredientName}
          />
          <TextInput
            style={styles.input}
            placeholder="수량 설명 (예: 200g, 1개)"
            value={quantityDesc}
            onChangeText={setQuantityDesc}
          />
          <TextInput
            style={styles.input}
            placeholder="카테고리 코드 (예: VEGETABLE)"
            value={categoryCd}
            onChangeText={setCategoryCd}
          />
          <TextInput
            style={styles.input}
            placeholder="사용 여부 (Y/N, 기본 N)"
            value={usedFlag}
            onChangeText={setUsedFlag}
          />
          <TextInput
            style={styles.input}
            placeholder="유통기한 (YYYY-MM-DD)"
            value={expiredDate}
            onChangeText={setExpiredDate}
          />
          <TextInput
            style={styles.input}
            placeholder="메모"
            value={memo}
            onChangeText={setMemo}
            multiline
          />
          <Button
            title="새 재료 추가"
            onPress={handleAddIngredient}
            disabled={isLoading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>재료 ID 입력 (상세/수정/삭제)</Text>
          <TextInput
            style={styles.input}
            placeholder="재료 ID"
            keyboardType="numeric"
            value={currentIngredientId}
            onChangeText={setCurrentIngredientId}
          />
          <Button
            title="재료 상세 조회 (입력 필드 채우기)"
            onPress={handleFetchIngredientDetail}
            disabled={isLoading}
          />
          <View style={styles.buttonGroup}>
            <Button
              title="재료 수정"
              onPress={handleUpdateIngredient}
              disabled={isLoading}
            />
            <Button
              title="재료 삭제"
              onPress={handleDeleteIngredient}
              disabled={isLoading}
              color="red"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            재료 목록 (총 {ingredientCount}개)
          </Text>
          <Button
            title="재료 목록 새로고침"
            onPress={fetchIngredientsAndCount}
            disabled={isLoading}
          />
          {ingredientList.length > 0 ? (
            ingredientList.map(item => (
              <TouchableOpacity
                key={item.userIngredientId}
                style={styles.ingredientItem}
                onPress={() => {
                  setCurrentIngredientId(String(item.userIngredientId));
                  Alert.alert(
                    '재료 선택',
                    `ID: ${item.userIngredientId}, 이름: ${item.ingredientName} 선택됨.`,
                  );
                }}>
                <Text style={styles.itemText}>ID: {item.userIngredientId}</Text>
                <Text style={styles.itemText}>이름: {item.ingredientName}</Text>
                <Text style={styles.itemText}>
                  수량: {item.quantityDesc || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  카테고리: {item.categoryCd || 'N/A'}
                </Text>
                <Text style={styles.itemText}>사용: {item.usedFlag}</Text>
                <Text style={styles.itemText}>
                  유통기한: {item.expiredDateFormatted || 'N/A'}{' '}
                  {item.isExpired
                    ? '(만료!)'
                    : item.isNearExpiry
                    ? '(임박!)'
                    : ''}
                </Text>
                <Text style={styles.itemText}>메모: {item.memo || 'N/A'}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text>재료가 없습니다. 새 재료를 추가해 보세요.</Text>
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
  },
  ingredientItem: {
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
});

export default UserIngredientTestScreen;
