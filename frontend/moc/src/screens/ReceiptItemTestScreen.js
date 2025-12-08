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

// ⭐ 백엔드 API 기본 URL (Android 에뮬레이터용) - RecipeBookmarkController와 동일한 구조
const API_BASE_URL = 'http://10.0.2.2:8090/api/v1/users'; // {userId}가 포함된 상위 경로

const ReceiptItemTestScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState(null);

  // ⭐ 테스트용 사용자 ID (백엔드 Long 타입에 맞게 숫자 형태의 문자열로 유지)
  const [testUserId] = useState('12345');
  // ⭐ 테스트용 영수증 ID (가상. 실제 구현 시 tb_receipt 테이블에서 생성된 ID)
  //    초기 테스트를 위해 1L (Long 1)과 매핑되는 문자열 "1" 사용
  const [testReceiptId] = useState('1');

  const [currentReceiptItemId, setCurrentReceiptItemId] = useState(''); // 수정/삭제/상세조회용 품목 ID

  // 품목 추가/수정 입력 필드 상태
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(''); // BigDecimal -> String으로 입력
  const [itemUnitPrice, setItemUnitPrice] = useState('');
  const [itemTotalPrice, setItemTotalPrice] = useState('');
  const [mappedIngredientName, setMappedIngredientName] = useState('');

  // 조회된 품목 목록 상태
  const [receiptItemList, setReceiptItemList] = useState([]);
  const [totalItemCount, setTotalItemCount] = useState(0);
  const [convertedUserIngredients, setConvertedUserIngredients] = useState([]); // 내 재료로 전환된 목록

  // 초기 로드 시 품목 목록 조회
  useEffect(() => {
    fetchReceiptItems();
  }, []);

  const fetchReceiptItems = async () => {
    setIsLoading(true);
    setError(null);
    setResponseMessage('');
    try {
      // 영수증 품목 목록 조회 API 호출
      const response = await axios.get(
        `${API_BASE_URL}/${testUserId}/receipts/${testReceiptId}/items`,
      );
      setReceiptItemList(response.data.receiptItems || []);
      setTotalItemCount(response.data.totalCount || 0);
      setResponseMessage('영수증 품목 목록 조회 성공!');
    } catch (e) {
      console.error(
        '영수증 품목 조회 중 오류 발생:',
        e.response?.data || e.message,
      );
      setError(
        e.response?.data?.message || e.message || '영수증 품목 조회 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 단일 품목 추가
  const handleAddReceiptItem = async () => {
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    const requestBody = {
      itemName,
      itemQuantity: itemQuantity ? Number(itemQuantity) : null, // Number로 변환하여 전송
      itemUnitPrice: itemUnitPrice ? Number(itemUnitPrice) : null,
      itemTotalPrice: itemTotalPrice ? Number(itemTotalPrice) : null,
      mappedIngredientName,
      // receiptId, createdId는 Controller에서 @PathVariable 및 인증 정보로 처리
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/${testUserId}/receipts/${testReceiptId}/items`,
        requestBody,
      );

      setResponseMessage(`품목 추가 성공: ${response.data.itemName}`);
      Alert.alert('성공', `품목 "${response.data.itemName}"가 추가되었습니다.`);
      clearInputFields();
      fetchReceiptItems(); // 목록 새로고침
    } catch (e) {
      console.error('품목 추가 중 오류 발생:', e.response?.data || e.message);
      setError(e.response?.data?.message || e.message || '품목 추가 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '품목 추가 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 일괄 품목 추가 (예시 데이터 사용)
  const handleAddReceiptItemsBatch = async () => {
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    const batchItems = [
      {
        itemName: '우유',
        itemQuantity: 1,
        itemUnitPrice: 3000,
        itemTotalPrice: 3000,
        mappedIngredientName: '우유',
      },
      {
        itemName: '계란 10구',
        itemQuantity: 1,
        itemUnitPrice: 5000,
        itemTotalPrice: 5000,
        mappedIngredientName: '계란',
      },
      {
        itemName: '신라면 5개입',
        itemQuantity: 1,
        itemUnitPrice: 4500,
        itemTotalPrice: 4500,
        mappedIngredientName: '라면',
      },
    ];

    try {
      const response = await axios.post(
        `${API_BASE_URL}/${testUserId}/receipts/${testReceiptId}/items/batch`,
        batchItems,
      );

      setResponseMessage(`일괄 품목 추가 성공: 총 ${response.data.length}개`);
      Alert.alert(
        '성공',
        `총 ${response.data.length}개의 품목이 일괄 추가되었습니다.`,
      );
      fetchReceiptItems(); // 목록 새로고침
    } catch (e) {
      console.error(
        '일괄 품목 추가 중 오류 발생:',
        e.response?.data || e.message,
      );
      setError(e.response?.data?.message || e.message || '일괄 품목 추가 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '일괄 품목 추가 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 품목 상세 조회
  const handleFetchReceiptItemDetail = async () => {
    if (!currentReceiptItemId) {
      Alert.alert('알림', '상세 조회할 품목 ID를 입력하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/${testUserId}/receipts/${testReceiptId}/items/${currentReceiptItemId}`,
      );

      setResponseMessage(`품목 상세 조회 성공: ${response.data.itemName}`);
      Alert.alert('상세 정보', JSON.stringify(response.data, null, 2));
      // 조회된 내용으로 입력 필드 채우기 (수정 준비)
      setItemName(response.data.itemName);
      setItemQuantity(String(response.data.itemQuantity));
      setItemUnitPrice(String(response.data.itemUnitPrice));
      setItemTotalPrice(String(response.data.itemTotalPrice));
      setMappedIngredientName(response.data.mappedIngredientName || '');
    } catch (e) {
      console.error(
        '품목 상세 조회 중 오류 발생:',
        e.response?.data || e.message,
      );
      setError(e.response?.data?.message || e.message || '품목 상세 조회 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '품목 상세 조회 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 품목 수정
  const handleUpdateReceiptItem = async () => {
    if (!currentReceiptItemId) {
      Alert.alert('알림', '수정할 품목 ID를 입력하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    const requestBody = {
      itemName,
      itemQuantity: itemQuantity ? Number(itemQuantity) : null,
      itemUnitPrice: itemUnitPrice ? Number(itemUnitPrice) : null,
      itemTotalPrice: itemTotalPrice ? Number(itemTotalPrice) : null,
      mappedIngredientName,
    };

    try {
      const response = await axios.put(
        `${API_BASE_URL}/${testUserId}/receipts/${testReceiptId}/items/${currentReceiptItemId}`,
        requestBody,
      );

      setResponseMessage(`품목 수정 성공: ${response.data.itemName}`);
      Alert.alert('성공', `품목 "${response.data.itemName}"가 수정되었습니다.`);
      fetchReceiptItems(); // 목록 새로고침
    } catch (e) {
      console.error('품목 수정 중 오류 발생:', e.response?.data || e.message);
      setError(e.response?.data?.message || e.message || '품목 수정 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '품목 수정 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 품목 삭제
  const handleDeleteReceiptItem = async () => {
    if (!currentReceiptItemId) {
      Alert.alert('알림', '삭제할 품목 ID를 입력하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);
    try {
      await axios.delete(
        `${API_BASE_URL}/${testUserId}/receipts/${testReceiptId}/items/${currentReceiptItemId}`,
      );

      setResponseMessage(`품목 ID ${currentReceiptItemId} 삭제 성공.`);
      Alert.alert('성공', `품목 ID ${currentReceiptItemId}가 삭제되었습니다.`);
      setCurrentReceiptItemId(''); // ID 입력 필드 초기화
      clearInputFields();
      fetchReceiptItems(); // 목록 새로고침
    } catch (e) {
      console.error('품목 삭제 중 오류 발생:', e.response?.data || e.message);
      setError(e.response?.data?.message || e.message || '품목 삭제 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '품목 삭제 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 모든 품목 삭제 (해당 영수증 ID 기준)
  const handleDeleteAllReceiptItems = async () => {
    Alert.alert(
      '경고',
      `정말 영수증 ID ${testReceiptId}의 모든 품목을 삭제하시겠습니까?`,
      [
        {text: '취소', style: 'cancel'},
        {
          text: '삭제',
          onPress: async () => {
            setIsLoading(true);
            setResponseMessage('');
            setError(null);
            try {
              const response = await axios.delete(
                `${API_BASE_URL}/${testUserId}/receipts/${testReceiptId}/items`,
              );
              setResponseMessage(
                `영수증 ID ${testReceiptId}의 모든 품목 ${response.data}개 삭제 성공.`,
              );
              Alert.alert(
                '성공',
                `총 ${response.data}개의 품목이 삭제되었습니다.`,
              );
              fetchReceiptItems(); // 목록 새로고침
            } catch (e) {
              console.error(
                '모든 품목 삭제 중 오류 발생:',
                e.response?.data || e.message,
              );
              setError(
                e.response?.data?.message || e.message || '모든 품목 삭제 실패',
              );
              Alert.alert(
                '오류',
                e.response?.data?.message || e.message || '모든 품목 삭제 실패',
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  // 영수증 품목을 '내 재료'로 전환
  const handleConvertToUserIngredients = async () => {
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/${testUserId}/receipts/${testReceiptId}/items/convert-to-user-ingredients`,
      );
      setConvertedUserIngredients(response.data || []);
      setResponseMessage(
        `총 ${response.data.length}개의 품목을 '내 재료'로 전환 성공!`,
      );
      Alert.alert(
        '성공',
        `총 ${response.data.length}개의 품목이 '내 재료'로 전환되었습니다.`,
        [
          {text: '확인', onPress: () => setConvertedUserIngredients([])}, // 알림 닫으면 전환된 목록 초기화
        ],
      );
      fetchReceiptItems(); // 목록 새로고침 (혹시 used_flag 같은 상태 변화가 있을 수 있으므로)
    } catch (e) {
      console.error(
        '품목을 내 재료로 전환 중 오류 발생:',
        e.response?.data || e.message,
      );
      setError(
        e.response?.data?.message || e.message || '품목을 내 재료로 전환 실패',
      );
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '품목을 내 재료로 전환 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearInputFields = () => {
    setItemName('');
    setItemQuantity('');
    setItemUnitPrice('');
    setItemTotalPrice('');
    setMappedIngredientName('');
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>영수증 품목 관리 API 테스트</Text>
        <Text style={styles.subtitle}>현재 사용자 ID: {testUserId}</Text>
        <Text style={styles.subtitle}>테스트 영수증 ID: {testReceiptId}</Text>

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

        {/* 품목 추가/수정 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            품목 정보 입력 (단일 추가/수정)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="품목명 (예: 김치)"
            value={itemName}
            onChangeText={setItemName}
          />
          <TextInput
            style={styles.input}
            placeholder="수량 (예: 1.5)"
            keyboardType="numeric"
            value={itemQuantity}
            onChangeText={setItemQuantity}
          />
          <TextInput
            style={styles.input}
            placeholder="단위 가격 (예: 3000)"
            keyboardType="numeric"
            value={itemUnitPrice}
            onChangeText={setItemUnitPrice}
          />
          <TextInput
            style={styles.input}
            placeholder="총 가격 (예: 4500)"
            keyboardType="numeric"
            value={itemTotalPrice}
            onChangeText={setItemTotalPrice}
          />
          <TextInput
            style={styles.input}
            placeholder="매핑 재료명 (예: 김치)"
            value={mappedIngredientName}
            onChangeText={setMappedIngredientName}
          />
          <Button
            title="새 품목 추가"
            onPress={handleAddReceiptItem}
            disabled={isLoading}
          />
          <Button
            title="테스트 품목 일괄 추가"
            onPress={handleAddReceiptItemsBatch}
            disabled={isLoading}
          />
        </View>

        {/* 품목 ID 입력 (상세/수정/삭제용) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>품목 ID 입력 (상세/수정/삭제)</Text>
          <TextInput
            style={styles.input}
            placeholder="품목 ID"
            keyboardType="numeric"
            value={currentReceiptItemId}
            onChangeText={setCurrentReceiptItemId}
          />
          <Button
            title="품목 상세 조회 (입력 필드 채우기)"
            onPress={handleFetchReceiptItemDetail}
            disabled={isLoading}
          />
          <View style={styles.buttonGroup}>
            <Button
              title="품목 수정"
              onPress={handleUpdateReceiptItem}
              disabled={isLoading}
            />
            <Button
              title="품목 삭제"
              onPress={handleDeleteReceiptItem}
              disabled={isLoading}
              color="red"
            />
          </View>
        </View>

        {/* 모든 품목 삭제 (테스트 영수증 ID 기준) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            전체 품목 삭제 ({testReceiptId}번 영수증)
          </Text>
          <Button
            title={`영수증 ${testReceiptId}의 모든 품목 삭제`}
            onPress={handleDeleteAllReceiptItems}
            disabled={isLoading}
            color="darkred"
          />
        </View>

        {/* 영수증 품목을 '내 재료'로 전환 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>영수증 품목 → 내 재료 전환</Text>
          <Button
            title="영수증 품목을 '내 재료'로 전환"
            onPress={handleConvertToUserIngredients}
            disabled={isLoading}
          />
          {convertedUserIngredients.length > 0 && (
            <View style={styles.convertedList}>
              <Text style={styles.sectionTitle}>⭐ 전환된 '내 재료' 목록:</Text>
              {convertedUserIngredients.map(ing => (
                <View key={ing.userIngredientId} style={styles.ingredientItem}>
                  <Text style={styles.itemText}>
                    ID: {ing.userIngredientId}
                  </Text>
                  <Text style={styles.itemTextBold}>
                    이름: {ing.ingredientName}
                  </Text>
                  <Text style={styles.itemText}>
                    수량: {ing.quantityDesc || 'N/A'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 현재 영수증 품목 목록 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            현재 영수증 품목 목록 (총 {totalItemCount}개)
          </Text>
          <Button
            title="목록 새로고침"
            onPress={fetchReceiptItems}
            disabled={isLoading}
          />
          {receiptItemList.length > 0 ? (
            receiptItemList.map(item => (
              <TouchableOpacity
                key={item.receiptItemId}
                style={styles.receiptItem}
                onPress={() => {
                  setCurrentReceiptItemId(String(item.receiptItemId));
                  Alert.alert(
                    '품목 선택',
                    `ID: ${item.receiptItemId}, 이름: ${item.itemName} 선택됨.`,
                  );
                }}>
                <Text style={styles.itemText}>ID: {item.receiptItemId}</Text>
                <Text style={styles.itemTextBold}>품목명: {item.itemName}</Text>
                <Text style={styles.itemText}>
                  매핑 재료: {item.mappedIngredientName || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  수량: {item.itemQuantity || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  단가: {item.itemUnitPrice || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  총액: {item.itemTotalPrice || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  등록일: {item.createdDateFormatted || 'N/A'}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>
              인식된 품목이 없습니다. 품목을 추가해 보세요.
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
  receiptItem: {
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ingredientItem: {
    // 전환된 재료 목록 스타일
    backgroundColor: '#e6ffe6', // 연한 초록색 배경
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
  convertedList: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
});

export default ReceiptItemTestScreen;
