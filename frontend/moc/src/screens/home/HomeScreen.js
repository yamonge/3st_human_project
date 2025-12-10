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
  Image,
} from 'react-native';
import axios from 'axios'; // axios 임포트

// ⭐ 백엔드 API 기본 URL (Android 에뮬레이터용)
const API_BASE_URL = 'http://10.0.2.2:8090/api/v1/users'; // {reporterUserId}가 포함된 상위 경로

const ReportTestScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState(null);

  // ⭐ 테스트용 신고자 ID (백엔드 Long 타입에 맞게 숫자 형태의 문자열로 유지)
  const [testReporterUserId] = useState('12345'); // 신고자 ID

  // 공통 신고 입력 필드 상태
  const [inputReportReasonCd, setInputReportReasonCd] = useState(''); // 예: "SPAM", "ABUSE"
  const [inputComment, setInputComment] = useState(''); // 상세 신고 내용

  // 레시피 신고 전용 입력
  const [inputRecipeId, setInputRecipeId] = useState('');
  // 사용자 신고 전용 입력
  const [inputReportedUserId, setInputReportedUserId] = useState('');

  const [currentReportId, setCurrentReportId] = useState(''); // 상세 조회/수정/삭제용 신고 ID (공통)
  const [currentReportType, setCurrentReportType] = useState(null); // 'RECIPE' or 'USER' (현재 선택된 신고 유형)

  // 조회된 레시피 신고 목록 및 개수 상태
  const [reportedRecipesList, setReportedRecipesList] = useState([]);
  const [reportedRecipeCount, setReportedRecipeCount] = useState(0);

  // 조회된 사용자 신고 목록 및 개수 상태
  const [reportedUsersList, setReportedUsersList] = useState([]);
  const [reportedUserCount, setReportedUserCount] = useState(0);

  // 컴포넌트 마운트 시 초기 신고 목록 및 개수 조회
  useEffect(() => {
    fetchAllReportsAndCounts();
  }, []);

  const fetchAllReportsAndCounts = async () => {
    setIsLoading(true);
    setError(null);
    setResponseMessage('');
    try {
      // 1. 레시피 신고 목록 조회
      const recipeListResponse = await axios.get(
        `${API_BASE_URL}/${testReporterUserId}/recipe-reports`,
      );
      setReportedRecipesList(recipeListResponse.data.reportedRecipes || []);

      // 2. 레시피 신고 개수 조회
      const recipeCountResponse = await axios.get(
        `${API_BASE_URL}/${testReporterUserId}/recipe-reports/count`,
      );
      setReportedRecipeCount(recipeCountResponse.data);

      // 3. 사용자 신고 목록 조회
      const userListResponse = await axios.get(
        `${API_BASE_URL}/${testReporterUserId}/user-reports`,
      );
      setReportedUsersList(userListResponse.data.reportedUsers || []);

      // 4. 사용자 신고 개수 조회
      const userCountResponse = await axios.get(
        `${API_BASE_URL}/${testReporterUserId}/user-reports/count`,
      );
      setReportedUserCount(userCountResponse.data);

      setResponseMessage('모든 신고 내역 조회 성공!');
    } catch (e) {
      console.error(
        '초기 신고 정보 조회 중 오류 발생:',
        e.response?.data || e.message,
      );
      setError(
        e.response?.data?.message || e.message || '초기 신고 정보 조회 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 레시피 신고 추가
  const handleAddRecipeReport = async () => {
    if (!inputRecipeId || !inputReportReasonCd) {
      Alert.alert('알림', '레시피 ID와 신고 사유는 필수 입력입니다.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    const requestBody = {
      recipeId: Number(inputRecipeId),
      reportReasonCd: inputReportReasonCd,
      content: inputComment,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/${testReporterUserId}/recipe-reports`,
        requestBody,
      );

      setResponseMessage(
        `레시피 신고 성공: ID ${response.data.reportId}, 레시피 ID ${response.data.recipeId}`,
      );
      Alert.alert(
        '성공',
        `ID ${response.data.reportId} 레시피 신고가 접수되었습니다.`,
      );
      clearInputFields();
      fetchAllReportsAndCounts(); // 목록 새로고침
    } catch (e) {
      console.error('레시피 신고 중 오류 발생:', e.response?.data || e.message);
      setError(e.response?.data?.message || e.message || '레시피 신고 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '레시피 신고 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 신고 추가
  const handleAddUserReport = async () => {
    if (!inputReportedUserId || !inputReportReasonCd) {
      Alert.alert('알림', '신고 대상 사용자 ID와 신고 사유는 필수 입력입니다.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    const requestBody = {
      reportedUserId: Number(inputReportedUserId),
      reportReasonCd: inputReportReasonCd,
      reportComment: inputComment,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/${testReporterUserId}/user-reports`,
        requestBody,
      );

      setResponseMessage(
        `사용자 신고 성공: ID ${response.data.reportId}, 대상 사용자 ID ${response.data.reportedUserId}`,
      );
      Alert.alert(
        '성공',
        `ID ${response.data.reportId} 사용자 신고가 접수되었습니다.`,
      );
      clearInputFields();
      fetchAllReportsAndCounts(); // 목록 새로고침
    } catch (e) {
      console.error('사용자 신고 중 오류 발생:', e.response?.data || e.message);
      setError(e.response?.data?.message || e.message || '사용자 신고 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '사용자 신고 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 신고 상세 조회 (레시피 또는 사용자)
  const handleFetchReportDetail = async () => {
    if (!currentReportId || !currentReportType) {
      Alert.alert('알림', '상세 조회할 신고 ID와 유형을 선택하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);
    try {
      let endpoint = '';
      if (currentReportType === 'RECIPE') {
        endpoint = `${API_BASE_URL}/${testReporterUserId}/recipe-reports/${currentReportId}`;
      } else if (currentReportType === 'USER') {
        endpoint = `${API_BASE_URL}/${testReporterUserId}/user-reports/${currentReportId}`;
      } else {
        throw new Error('유효하지 않은 신고 유형입니다.');
      }

      const response = await axios.get(endpoint);

      setResponseMessage(`신고 상세 조회 성공: ID ${response.data.reportId}`);
      Alert.alert('상세 정보', JSON.stringify(response.data, null, 2));
      // 조회된 내용으로 입력 필드 채우기 (수정 준비)
      setInputReportReasonCd(response.data.reportReasonCd || '');
      setInputComment(
        response.data.content || response.data.reportComment || '',
      ); // 레시피는 content, 사용자는 reportComment
      if (currentReportType === 'RECIPE') {
        setInputRecipeId(String(response.data.recipeId || ''));
        setInputReportedUserId('');
      } else {
        setInputReportedUserId(String(response.data.reportedUserId || ''));
        setInputRecipeId('');
      }
    } catch (e) {
      console.error(
        '신고 상세 조회 중 오류 발생:',
        e.response?.data || e.message,
      );
      setError(e.response?.data?.message || e.message || '신고 상세 조회 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '신고 상세 조회 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 신고 수정 (레시피 또는 사용자)
  const handleUpdateReport = async () => {
    if (!currentReportId || !currentReportType) {
      Alert.alert('알림', '수정할 신고 ID와 유형을 선택하세요.');
      return;
    }
    setIsLoading(true);
    setResponseMessage('');
    setError(null);

    const requestBody = {
      reportReasonCd: inputReportReasonCd,
      // 레시피 신고는 content, 사용자 신고는 reportComment를 사용
      content: currentReportType === 'RECIPE' ? inputComment : undefined,
      reportComment: currentReportType === 'USER' ? inputComment : undefined,
    };

    try {
      let endpoint = '';
      if (currentReportType === 'RECIPE') {
        endpoint = `${API_BASE_URL}/${testReporterUserId}/recipe-reports/${currentReportId}`;
      } else if (currentReportType === 'USER') {
        endpoint = `${API_BASE_URL}/${testReporterUserId}/user-reports/${currentReportId}`;
      } else {
        throw new Error('유효하지 않은 신고 유형입니다.');
      }

      const response = await axios.put(endpoint, requestBody);

      setResponseMessage(`신고 수정 성공: ID ${response.data.reportId}`);
      Alert.alert(
        '성공',
        `ID ${response.data.reportId} 신고가 수정되었습니다.`,
      );
      fetchAllReportsAndCounts(); // 목록 새로고침
    } catch (e) {
      console.error('신고 수정 중 오류 발생:', e.response?.data || e.message);
      setError(e.response?.data?.message || e.message || '신고 수정 실패');
      Alert.alert(
        '오류',
        e.response?.data?.message || e.message || '신고 수정 실패',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 신고 삭제 (레시피 또는 사용자)
  const handleDeleteReport = async () => {
    if (!currentReportId || !currentReportType) {
      Alert.alert('알림', '삭제할 신고 ID와 유형을 선택하세요.');
      return;
    }
    Alert.alert(
      '경고',
      `정말 신고 ID ${currentReportId} (${currentReportType} 유형)를 삭제하시겠습니까?`,
      [
        {text: '취소', style: 'cancel'},
        {
          text: '삭제',
          onPress: async () => {
            setIsLoading(true);
            setResponseMessage('');
            setError(null);
            try {
              let endpoint = '';
              if (currentReportType === 'RECIPE') {
                endpoint = `${API_BASE_URL}/${testReporterUserId}/recipe-reports/${currentReportId}`;
              } else if (currentReportType === 'USER') {
                endpoint = `${API_BASE_URL}/${testReporterUserId}/user-reports/${currentReportId}`;
              } else {
                throw new Error('유효하지 않은 신고 유형입니다.');
              }

              await axios.delete(endpoint);

              setResponseMessage(`신고 ID ${currentReportId} 삭제 성공.`);
              Alert.alert(
                '성공',
                `신고 ID ${currentReportId}가 삭제되었습니다.`,
              );
              setCurrentReportId('');
              setCurrentReportType(null);
              clearInputFields();
              fetchAllReportsAndCounts(); // 목록 새로고침
            } catch (e) {
              console.error(
                '신고 삭제 중 오류 발생:',
                e.response?.data || e.message,
              );
              setError(
                e.response?.data?.message || e.message || '신고 삭제 실패',
              );
              Alert.alert(
                '오류',
                e.response?.data?.message || e.message || '신고 삭제 실패',
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const clearInputFields = () => {
    setInputRecipeId('');
    setInputReportedUserId('');
    setInputReportReasonCd('');
    setInputComment('');
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>신고 내역 관리 API 테스트</Text>
        <Text style={styles.subtitle}>
          현재 신고자 ID: {testReporterUserId}
        </Text>
        <Text style={styles.subtitle}>
          총 레시피 신고: {reportedRecipeCount}개, 총 사용자 신고:{' '}
          {reportedUserCount}개
        </Text>

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

        {/* 신고 추가 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>새 신고 작성</Text>
          <TextInput
            style={styles.input}
            placeholder="레시피 ID (레시피 신고 시, 숫자만)"
            keyboardType="numeric"
            value={inputRecipeId}
            onChangeText={setInputRecipeId}
          />
          <TextInput
            style={styles.input}
            placeholder="대상 사용자 ID (사용자 신고 시, 숫자만)"
            keyboardType="numeric"
            value={inputReportedUserId}
            onChangeText={setInputReportedUserId}
          />
          <TextInput
            style={styles.input}
            placeholder="신고 사유 코드 (예: SPAM, ABUSE)"
            value={inputReportReasonCd}
            onChangeText={setInputReportReasonCd}
          />
          <TextInput
            style={styles.input}
            placeholder="상세 신고 내용"
            value={inputComment}
            onChangeText={setInputComment}
            multiline
          />
          <View style={styles.buttonGroup}>
            <Button
              title="레시피 신고"
              onPress={handleAddRecipeReport}
              disabled={isLoading}
            />
            <Button
              title="사용자 신고"
              onPress={handleAddUserReport}
              disabled={isLoading}
            />
          </View>
        </View>

        {/* 신고 조회/수정/삭제 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>신고 ID로 조회/수정/삭제</Text>
          <TextInput
            style={styles.input}
            placeholder="조회/수정/삭제할 신고 ID (숫자만)"
            keyboardType="numeric"
            value={currentReportId}
            onChangeText={setCurrentReportId}
          />
          <View style={styles.buttonGroup}>
            <Button
              title="레시피 신고 상세"
              onPress={() => {
                setCurrentReportType('RECIPE');
                handleFetchReportDetail();
              }}
              disabled={isLoading}
            />
            <Button
              title="사용자 신고 상세"
              onPress={() => {
                setCurrentReportType('USER');
                handleFetchReportDetail();
              }}
              disabled={isLoading}
            />
          </View>
          <View style={styles.buttonGroup}>
            <Button
              title="신고 수정 (선택된 유형)"
              onPress={handleUpdateReport}
              disabled={isLoading || !currentReportType}
            />
            <Button
              title="신고 삭제 (선택된 유형)"
              onPress={handleDeleteReport}
              disabled={isLoading || !currentReportType}
              color="red"
            />
          </View>
          {currentReportType && (
            <Text style={styles.statusText}>
              ⭐ 현재 선택된 신고 유형: {currentReportType}
            </Text>
          )}
        </View>

        {/* 현재 신고된 레시피 목록 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            신고된 레시피 목록 (총 {reportedRecipeCount}개)
          </Text>
          {reportedRecipesList.length > 0 ? (
            reportedRecipesList.map(item => (
              <TouchableOpacity
                key={`recipe-${item.reportId}`} // 고유 키
                style={styles.reportItem}
                onPress={() => {
                  setCurrentReportId(String(item.reportId));
                  setCurrentReportType('RECIPE');
                  Alert.alert(
                    '신고 선택',
                    `신고 ID: ${item.reportId}, 레시피: ${
                      item.reportedRecipe?.title || 'N/A'
                    } 선택됨 (유형: RECIPE).`,
                  );
                  // 선택된 신고 정보로 입력 필드 채우기 (편의상)
                  setInputRecipeId(String(item.recipeId));
                  setInputReportedUserId('');
                  setInputReportReasonCd(item.reportReasonCd || '');
                  setInputComment(item.content || '');
                }}>
                {item.reportedRecipe?.thumbnailUrl && (
                  <Image
                    source={{uri: item.reportedRecipe.thumbnailUrl}}
                    style={styles.thumbnail}
                  />
                )}
                <Text style={styles.itemText}>신고 ID: {item.reportId}</Text>
                <Text style={styles.itemTextBold}>
                  레시피: {item.reportedRecipe?.title || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  신고자 ID: {item.reporterUserId}
                </Text>
                <Text style={styles.itemText}>
                  사유: {item.reportReasonCd || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  내용: {item.content || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  처리 상태:{' '}
                  <Text
                    style={{
                      color:
                        item.statusCd === 'PENDING'
                          ? 'orange'
                          : item.statusCd === 'APPROVED'
                          ? 'green'
                          : 'red',
                    }}>
                    {item.statusCd || 'N/A'}
                  </Text>
                </Text>
                <Text style={styles.itemText}>
                  신고일: {item.createdDateFormatted || 'N/A'}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>신고한 레시피가 없습니다.</Text>
          )}
        </View>

        {/* 현재 신고된 사용자 목록 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            신고된 사용자 목록 (총 {reportedUserCount}개)
          </Text>
          {reportedUsersList.length > 0 ? (
            reportedUsersList.map(item => (
              <TouchableOpacity
                key={`user-${item.reportId}`} // 고유 키
                style={styles.reportItem}
                onPress={() => {
                  setCurrentReportId(String(item.reportId));
                  setCurrentReportType('USER');
                  Alert.alert(
                    '신고 선택',
                    `신고 ID: ${item.reportId}, 대상: ${
                      item.reportedUser?.nickname || 'N/A'
                    } 선택됨 (유형: USER).`,
                  );
                  // 선택된 신고 정보로 입력 필드 채우기 (편의상)
                  setInputRecipeId('');
                  setInputReportedUserId(String(item.reportedUserId));
                  setInputReportReasonCd(item.reportReasonCd || '');
                  setInputComment(item.reportComment || '');
                }}>
                {item.reportedUser?.profileImageUrl && (
                  <Image
                    source={{uri: item.reportedUser.profileImageUrl}}
                    style={styles.thumbnail}
                  />
                )}
                <Text style={styles.itemText}>신고 ID: {item.reportId}</Text>
                <Text style={styles.itemTextBold}>
                  대상 사용자:{' '}
                  {item.reportedUser?.nickname || `ID ${item.reportedUserId}`}
                </Text>
                <Text style={styles.itemText}>
                  신고자 ID: {item.reporterUserId}
                </Text>
                <Text style={styles.itemText}>
                  사유: {item.reportReasonCd || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  내용: {item.reportComment || 'N/A'}
                </Text>
                <Text style={styles.itemText}>
                  처리 상태:{' '}
                  <Text
                    style={{
                      color:
                        item.processingStatusCd === 'PENDING'
                          ? 'orange'
                          : item.processingStatusCd === 'PROCESSED'
                          ? 'green'
                          : 'red',
                    }}>
                    {item.processingStatusCd || 'N/A'}
                  </Text>
                </Text>
                <Text style={styles.itemText}>
                  신고일: {item.createdDateFormatted || 'N/A'}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>신고한 사용자가 없습니다.</Text>
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
    color: '#007bff',
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
  reportItem: {
    backgroundColor: '#fff0e0', // 연한 주황색 배경 (신고 목록용)
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ffcc99',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 25, // 동그란 프로필 이미지 또는 썸네일
    marginRight: 10,
    marginBottom: 5,
    alignSelf: 'flex-start', // 왼쪽 정렬
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

export default ReportTestScreen;
