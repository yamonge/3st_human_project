import React from 'react';
import {Button, View, Text, StyleSheet} from 'react-native';
import {testRecipeGeneration} from './testRecipeGeneration'; // 파일 경로에 맞게 수정

const Ttest_CHS = () => {
  const handleTestPress = () => {
    console.log('테스트 버튼이 눌렸습니다. API 호출 시작...');
    testRecipeGeneration();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>레시피 생성 API 테스트</Text>
      <Button title="테스트 실행" onPress={handleTestPress} />
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
});

export default test_CHS;
