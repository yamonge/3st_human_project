import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import axios from 'axios';

// ⚠️ 반드시 PC 사설 IP 입력!!
// CMD → ipconfig → IPv4 확인
const API_BASE_URL = 'http://192.168.35.21:8090';

export default function RecipeTestScreenAxios() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // === 🔥 백엔드 매핑과 100% 일치하는 테스트 Payload ===
  const testPayload = {
    selectedIngredients: [
      {ingredientName: '계란', usageType: 'ALL', amountHint: 'MEDIUM'},
      {ingredientName: '파', usageType: 'ALL', amountHint: 'LITTLE'},
      {ingredientName: '밥', usageType: 'ALL', amountHint: 'MEDIUM'},
    ],
    filterCuisineCd: 'KOR',
    filterDifficultyCd: 'EASY',
    filterCookTimeCd: 'UNDER_30',
    userId: '1',
    cameraSessionId: '',
  };

  const sendTestRequest = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/recipes/recommend`,
        testPayload,
        {
          headers: {'Content-Type': 'application/json'},
          timeout: 15000,
        },
      );
      setResponse(res.data);
    } catch (error) {
      console.log('error:', error);
      setResponse({
        error: error.message,
        detail: error.response?.data,
      });
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🍳 레시피 추천 API 테스트</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={sendTestRequest}
        disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? '요청 중...' : '테스트 실행'}
        </Text>
      </TouchableOpacity>

      <View style={styles.responseBox}>
        <Text style={styles.responseText}>
          {response ? JSON.stringify(response, null, 2) : '응답 없음'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 20, marginTop: 40, backgroundColor: '#fff'},
  title: {fontSize: 22, fontWeight: 'bold', marginBottom: 20},
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {fontSize: 18, color: '#fff', fontWeight: '600'},
  responseBox: {
    backgroundColor: '#f1f1f1',
    padding: 15,
    borderRadius: 8,
  },
  responseText: {fontSize: 14, fontFamily: 'monospace'},
});
