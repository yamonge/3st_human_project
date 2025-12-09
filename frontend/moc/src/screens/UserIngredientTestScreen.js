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
const API_BASE_URL = 'http://192.168.1.49:8090/api/v1/users'; // {userId}가 포함된 상위 경로

const UserIngredientTestScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState(null);

  // ⭐ 테스트용 사용자 ID (백엔드 Long 타입에 맞게 숫자 형태의 문자열로 유지)
  const [testUserId] = useState('12345');

  const [currentIngredientId, setCurrentIngredientId] = useState(''); // 수정/삭제/상세조회용 ID

  // 재료 추가/수정 입력 필드 상태
  const [ingredientName, setIngredientName] = useState('');
  const [quantityDesc, setQuantityDesc] = useState('');
  const [categoryCd, setCategoryCd] = useState(''); // 예: "MEAT", "VEGETABLE"
  const [usedFlag, setUsedFlag] = useState('N'); // "Y" 또는 "N"
  const [expiredDate, setExpiredDate] = useState(''); // "YYYY-MM-DD" 형식
  const [memo, setMemo] = useState('');

  // 영수증 재료 일괄 추가용 입력 (테스트 목적)
  const [receiptIngredientsInput, setReceiptIngredientsInput] =
    useState('양파,파,마늘'); // 콤마로 구분된 재료명

  // 조회된 재료 목록 상태
  const [ingredientList, setIngredientList] = useState([]);
  const [ingredientCount, setIngredientCount] = useState(0);

  // 초기 로드 시 재료 목록 및 개수 조회
  useEffect(() => {
    fetchUserIngredientsAndCount();
  }, []);

  const fetchUserIngredientsAndCount = async () => {
    setIsLoading(true);
    setError(null);
    setResponseMessage('');
    try {
      // 재료 목록 조회 API 호출
      const listResponse = await axios.get(
        `${API_BASE_URL}/${testUserId}/ingredients`,
      );
      setIngredientList(listResponse.data.userIngredients || []);

      // 재료 개수 조회 API 호출
      const countResponse = await axios.get(
        `${API_BASE_URL}/${testUserId}/ingredients/count`,
      );
      setIngredientCount(countResponse.data);
      setResponseMessage('재료 목록 조회 및 개수 성공!');
    } catch (e) {
      console.error(
        '초기 재료 정보 조회 중 오류 발생:',
        e.response?.data || e.message,
      );
      setError(
        e.response?.data?.message || e.message || '초기 재료 정보 조회 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 단일 재료 추가 (사용자 직접 입력)
  const handleAddUserIngredient = async () => {
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
      const response = await axios.post(
        `${API_BASE_URL}/${testUserId}/ingredients`,
        requestBody,
      );

      setResponseMessage(`재료 추가 성공: ${response.data.ingredientName}`);
      Alert.alert(
        '성공',
        `재료 "${response.data.ingredientName}"가 추가되었습니다.`,
      );
      clearInputFields();
      fetchUserIngredientsAndCount(); // 목록 새로고침
    } catch (e) {
      console.error('재료 추가 중 오류 발생:', e.response?.data || e.message);
      setError(e.response?.data?.message || e.message || '재료 추가 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '재료 추가 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 영수증 재료 일괄 추가 (from-receipt 엔드포인트)
  const handleAddIngredientsFromReceipt = async () => {
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    const ingredientNames = receiptIngredientsInput
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    if (ingredientNames.length === 0) {
      Alert.alert('알림', '추가할 재료명을 콤마로 구분하여 입력하세요.');
      setIsLoading(false);
      return;
    }

    try {
      // API 경로 변경: /api/v1/users/{userId}/ingredients/from-receipt
      const response = await axios.post(
        `${API_BASE_URL}/${testUserId}/ingredients/from-receipt`,
        ingredientNames,
      );

      setResponseMessage(
        `영수증 재료 ${response.data.length}개 '내 재료'로 추가 성공!`,
      );
      Alert.alert(
        '성공',
        `총 ${response.data.length}개의 재료가 '내 재료'로 추가되었습니다.`,
      );
      setReceiptIngredientsInput(''); // 입력 필드 초기화
      fetchUserIngredientsAndCount(); // 목록 새로고침
    } catch (e) {
      console.error(
        '영수증 재료 추가 중 오류 발생:',
        e.response?.data || e.message,
      );
      setError(
        e.response?.data?.message || e.message || '영수증 재료 추가 실패',
      );
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '영수증 재료 추가 실패',
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
      const response = await axios.get(
        `${API_BASE_URL}/${testUserId}/ingredients/${currentIngredientId}`,
      );

      setResponseMessage(
        `재료 상세 조회 성공: ${response.data.ingredientName}`,
      );
      Alert.alert('상세 정보', JSON.stringify(response.data, null, 2));
      // 조회된 내용으로 입력 필드 채우기 (수정 준비)
      setIngredientName(response.data.ingredientName);
      setQuantityDesc(data.quantityDesc);
      setCategoryCd(response.data.categoryCd);
      setUsedFlag(response.data.usedFlag);
      setExpiredDate(response.data.expiredDateFormatted || ''); // 포맷된 날짜 사용
      setMemo(response.data.memo);
    } catch (e) {
      console.error(
        '재료 상세 조회 중 오류 발생:',
        e.response?.data || e.message,
      );
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
  const handleUpdateUserIngredient = async () => {
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
      const response = await axios.put(
        `${API_BASE_URL}/${testUserId}/ingredients/${currentIngredientId}`,
        requestBody,
      );

      setResponseMessage(`재료 수정 성공: ${response.data.ingredientName}`);
      Alert.alert(
        '성공',
        `재료 "${response.data.ingredientName}"가 수정되었습니다.`,
      );
      fetchUserIngredientsAndCount(); // 목록 새로고침
    } catch (e) {
      console.error('재료 수정 중 오류 발생:', e.response?.data || e.message);
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
  const handleDeleteUserIngredient = async () => {
    if (!currentIngredientId) {
      Alert.alert('알림', '삭제할 재료 ID를 입력하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);
    try {
      await axios.delete(
        `${API_BASE_URL}/${testUserId}/ingredients/${currentIngredientId}`,
      );

      setResponseMessage(`재료 ID ${currentIngredientId} 삭제 성공.`);
      Alert.alert('성공', `재료 ID ${currentIngredientId}가 삭제되었습니다.`);
      setCurrentIngredientId(''); // ID 입력 필드 초기화
      clearInputFields();
      fetchUserIngredientsAndCount(); // 목록 새로고침
    } catch (e) {
      console.error('재료 삭제 중 오류 발생:', e.response?.data || e.message);
      setError(e.response?.data?.message || e.message || '재료 삭제 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '재료 삭제 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearInputFields = () => {
    setIngredientName('');
    setQuantityDesc('');
    setCategoryCd('');
    setUsedFlag('N');
    setExpiredDate('');
    setMemo('');
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

        {/* 재료 추가/수정 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            재료 정보 입력 (단일 추가/수정)
          </Text>
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
            onPress={handleAddUserIngredient}
            disabled={isLoading}
          />
        </View>

        {/* 영수증 재료 일괄 추가 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>영수증 인식 재료 일괄 추가</Text>
          <TextInput
            style={styles.input}
            placeholder="재료명들 (콤마로 구분, 예: 양파,파,마늘)"
            value={receiptIngredientsInput}
            onChangeText={setReceiptIngredientsInput}
          />
          <Button
            title="영수증 재료 '내 재료'로 추가"
            onPress={handleAddIngredientsFromReceipt}
            disabled={isLoading}
          />
        </View>

        {/* 재료 ID 입력 (상세/수정/삭제용) */}
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
              onPress={handleUpdateUserIngredient}
              disabled={isLoading}
            />
            <Button
              title="재료 삭제"
              onPress={handleDeleteUserIngredient}
              disabled={isLoading}
              color="red"
            />
          </View>
        </View>

        {/* 현재 사용자 재료 목록 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            현재 '내 재료' 목록 (총 {ingredientCount}개)
          </Text>
          <Button
            title="목록 새로고침"
            onPress={fetchUserIngredientsAndCount}
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
                  // 선택된 재료로 입력 필드 채우기 (편의상)
                  setIngredientName(item.ingredientName);
                  setQuantityDesc(item.quantityDesc || '');
                  setCategoryCd(item.categoryCd || '');
                  setUsedFlag(item.usedFlag);
                  setExpiredDate(item.expiredDateFormatted || '');
                  setMemo(item.memo || '');
                }}>
                <Text style={styles.itemText}>ID: {item.userIngredientId}</Text>
                <Text style={styles.itemTextBold}>
                  이름: {item.ingredientName}
                </Text>
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
                <Text style={styles.itemText}>
                  남은일수:{' '}
                  {item.daysUntilExpired !== -1
                    ? `${item.daysUntilExpired}일`
                    : '없음'}
                </Text>
                <Text style={styles.itemText}>메모: {item.memo || 'N/A'}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>
              현재 '내 재료'가 없습니다. 추가해 보세요.
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
  ingredientItem: {
    backgroundColor: '#e6ffe6', // 연한 초록색 배경 (전환된 재료 목록용)
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#c6ecc6',
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

export default UserIngredientTestScreen;
