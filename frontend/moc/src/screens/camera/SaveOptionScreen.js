import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {ChevronLeft, ChevronRight, Check, Sparkles} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {styles} from '../../styles/screens/camera/saveOptionStyles';
import {addUserIngredient} from '../../api/camera';

//재료명만 추출
const extractIngredientNames = ingredients =>
  ingredients.map(item => item.name);

export default function SaveOptionScreen({route, navigation}) {
  const {ingredients = []} = route.params || {};
  const [isSaving, setIsSaving] = useState(false);

  //저장만 하기
  const handleSaveOnly = async () => {
    setIsSaving(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('오류', '로그인 정보가 없습니다.');
        return;
      }

      if (ingredients.length === 0) {
        Alert.alert('안내', '저장할 재료가 없습니다.');
        return;
      }

      for (const ingredient of ingredients) {
        const result = await addUserIngredient(Number(userId), ingredient);
        if (!result.success) {
          Alert.alert('저장 실패', result.error);
          return;
        }
      }

      Alert.alert('저장 완료', '재료가 저장되었습니다.', [
        {text: '확인', onPress: () => navigation.navigate('Home')},
      ]);
    } finally {
      setIsSaving(false);
    }
  };
  //레시피 추천
  const handleGetRecipe = async () => {
    setIsSaving(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('오류', '로그인 정보가 없습니다.');
        return;
      }

      if (ingredients.length === 0) {
        Alert.alert('안내', '저장할 재료가 없습니다.');
        return;
      }

      // ✅ 직접 입력 재료 하나씩 저장
      for (const ingredient of ingredients) {
        const result = await addUserIngredient(Number(userId), ingredient);
        if (!result.success) {
          Alert.alert('저장 실패', result.error);
          return;
        }
      }

      // ✅ 저장 성공 → 필터 화면
      navigation.navigate('RecipeFilter', {ingredients});
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* 상단 헤더 (그라데이션) */}
      <LinearGradient
        colors={['#00B8DB', '#155DFC']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.navigate('IngredientResult', route.params)
            }>
            <ChevronLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>저장 옵션</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {/* 콘텐츠 영역 */}
      <View style={styles.content}>
        {/* 인식 완료 카드 */}
        <View style={styles.completionCard}>
          <View style={styles.completionHeader}>
            <Check color="#10B981" size={20} />
            <Text style={styles.completionTitle}>인식 완료</Text>
          </View>
          <Text style={styles.completionText}>
            총{' '}
            <Text style={styles.completionCount}>{ingredients.length}개</Text>의
            재료가 인식되었습니다
          </Text>
        </View>

        {/* 옵션 버튼들 */}
        <View style={styles.optionsContainer}>
          {/* 저장만 하기 */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleSaveOnly}
            activeOpacity={0.7}
            disabled={isSaving}>
            <LinearGradient
              colors={['#00D084', '#00B86D']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.iconContainer}>
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Check color="#FFFFFF" size={30} />
              )}
            </LinearGradient>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>저장만 하기</Text>
              <Text style={styles.optionDescription}>
                내 재료에 저장하고 종료해요
              </Text>
            </View>
            {!isSaving && <ChevronRight color="#9CA3AF" size={24} />}
          </TouchableOpacity>

          {/* 레시피 추천받기 */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleGetRecipe}
            activeOpacity={0.7}>
            <LinearGradient
              colors={['#E879F9', '#C026D3']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.iconContainer}>
              <Sparkles color="#FFFFFF" size={30} />
            </LinearGradient>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>레시피 추천받기</Text>
              <Text style={styles.optionDescription}>
                저장 후 바로 레시피를 추천받아요
              </Text>
            </View>
            <ChevronRight color="#9CA3AF" size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
