import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import {ChevronLeft, Camera as CameraIcon, Check} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {styles} from '../../styles/screens/camera/recipeDetailStyles.js';
import RecipeSaveModal from '../../components/camera/RecipeSaveModal';
import IngredientConsumeModal from '../../components/camera/IngredientConsumeModal';
import {consumeIngredients, saveRecipe} from '../../api/camera';

/**
 * 레시피 상세 화면
 * 선택한 레시피의 상세 정보(재료, 조리 순서 등)를 표시하는 화면
 *
 * Route Params:
 * - recipe: 레시피 전체 데이터 (추천 API에서 이미 받아온 데이터)
 * - ingredients: 선택한 재료 목록 (선택사항)
 */
export default function RecipeDetailScreen({route, navigation}) {
  const {
    recipe: initialRecipe,
    ingredients = [],
    mode = 'view',
  } = route.params || {};

  const [recipe, setRecipe] = useState(initialRecipe);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shareToBoard, setShareToBoard] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // 조리 모드 여부 판단 ('view': 일반 상세보기, 'cooking': 조리 진행)
  const isCookingMode = mode === 'cooking';

  // route.params의 recipe가 변경될 때마다 state 업데이트
  useEffect(() => {
    if (!initialRecipe) {
      setError('레시피 정보가 없습니다.');
    } else {
      setRecipe(initialRecipe);
      setError(null);
      setShareToBoard(false);
      checkIfRecipeSaved();
    }
  }, [initialRecipe]);

  /**
   * 레시피 저장 여부 확인 (AsyncStorage 전용)
   */
  const checkIfRecipeSaved = async () => {
    try {
      // AsyncStorage에서 저장 여부 확인 (프론트 전용)
      console.log('⚠️ AsyncStorage에서 레시피 저장 여부 확인');
      const savedRecipes = await AsyncStorage.getItem('savedRecipes');
      const savedList = savedRecipes ? JSON.parse(savedRecipes) : [];
      const isRecipeSaved = savedList.includes(initialRecipe?.id);
      setIsSaved(isRecipeSaved);
      console.log(`레시피 ${initialRecipe?.id} 저장 여부:`, isRecipeSaved);
    } catch (error) {
      console.error('저장 여부 확인 실패:', error);
      setIsSaved(false);
    }
  };

  /**
   * 저장 버튼 핸들러
   */
  const handleSave = async () => {
    setIsLoading(true);

    try {
      console.log('💾 레시피 저장:', {
        recipeId: recipe?.id,
        shareToBoard,
      });

      // TODO: 백엔드 개발 완료 후 주석 해제
      // const result = await saveRecipe(recipe?.id, shareToBoard);
      // if (result.success) {
      //   console.log('✅ 레시피 저장 성공:', result.message);
      //   setIsSaved(true);
      //   setShowSaveModal(true);
      // } else {
      //   console.error('❌ 레시피 저장 실패:', result.error);
      //   Alert.alert('오류', result.error);
      // }

      // 개발 모드: AsyncStorage에 저장
      console.log('⚠️ 개발 모드: 레시피 저장 시뮬레이션');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // AsyncStorage에 저장된 레시피 목록 업데이트
      const savedRecipes = await AsyncStorage.getItem('savedRecipes');
      const savedList = savedRecipes ? JSON.parse(savedRecipes) : [];
      if (!savedList.includes(recipe?.id)) {
        savedList.push(recipe?.id);
        await AsyncStorage.setItem('savedRecipes', JSON.stringify(savedList));
        console.log('✅ AsyncStorage에 레시피 저장 완료:', recipe?.id);
      }

      setIsSaved(true); // 저장 상태 업데이트
      setShowSaveModal(true); // 성공 모달 표시
    } catch (error) {
      console.error('❌ 레시피 저장 처리 중 오류:', error);
      Alert.alert('오류', '레시피 저장 처리 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * "바로 시작하러 가기" 버튼 핸들러
   */
  const handleNavigateToRecipe = () => {
    setShowSaveModal(false);
    setShowConsumeModal(true);
  };

  /**
   * 모달 닫기 핸들러 (더 둘러보기)
   */
  const handleCloseModal = () => {
    setShowSaveModal(false);
  };

  /**
   * 재료 소비 확인 핸들러
   */
  const handleConfirmConsume = async () => {
    setShowConsumeModal(false);
    setIsLoading(true);

    try {
      console.log('🚀 재료 소비 API 호출 시작');

      // TODO: 백엔드 개발 완료 후 주석 해제
      // const ingredientIds = [1, 2, 3]; // 보유 재료의 ID 목록
      // const result = await consumeIngredients(recipe?.id, ingredientIds);
      // if (result.success) {
      //   console.log('✅ 재료 소비 성공:', result.message);
      //   Alert.alert('성공', result.message, [
      //     {
      //       text: '확인',
      //       onPress: () => {
      //         // TODO: 레시피 진행 화면으로 이동
      //         console.log('📍 레시피 진행 화면으로 이동');
      //       },
      //     },
      //   ]);
      // } else {
      //   console.error('❌ 재료 소비 실패:', result.error);
      //   Alert.alert('오류', result.error, [
      //     {
      //       text: '확인',
      //       onPress: () => setShowConsumeModal(true),
      //     },
      //   ]);
      // }

      // 개발 모드: 더미 동작 (1초 딜레이 후 성공)
      console.log('⚠️ 개발 모드: 재료 소비 시뮬레이션');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 조리 모드로 화면 재진입
      console.log('📍 조리 모드로 전환');
      navigation.navigate('RecipeDetail', {
        recipe,
        ingredients,
        mode: 'cooking',
      });
    } catch (error) {
      console.error('❌ 재료 소비 처리 중 오류:', error);
      Alert.alert('오류', '재료 소비 처리 중 문제가 발생했습니다.', [
        {
          text: '확인',
          onPress: () => setShowConsumeModal(true),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 재료 소비 취소 핸들러
   */
  const handleCancelConsume = () => {
    setShowConsumeModal(false);
  };

  /**
   * 보유 재료 및 부족한 재료 계산
   */
  const getIngredientStatus = () => {
    if (!recipe?.ingredients) {
      return {available: [], missing: []};
    }

    // TODO: 실제로는 사용자의 냉장고 재료와 비교해야 함
    // 현재는 예시 데이터 사용
    const userIngredients = ingredients || [];
    const available = recipe.ingredients.slice(0, 2).map(ing => ing.name); // 예시: 처음 2개는 보유
    const missing = recipe.ingredients.slice(2).map(ing => ing.name); // 예시: 나머지는 부족

    return {available, missing};
  };

  /**
   * 체크박스 토글
   */
  const toggleCheckbox = () => {
    setShareToBoard(!shareToBoard);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 상단 그라데이션 헤더 */}
      <LinearGradient
        colors={['#00B8DB', '#155DFC']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <View style={styles.headerTop}>
          {/* 뒤로가기 버튼 (조리 모드에서는 숨김) */}
          {!isCookingMode && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() =>
                navigation.navigate('RecommendedRecipes', route.params)
              }>
              <ChevronLeft color="white" size={24} />
            </TouchableOpacity>
          )}

          {/* 레시피 제목 */}
          <Text style={styles.headerTitle}>
            {recipe?.title || '레시피 상세'}
          </Text>
        </View>

        {/* 난이도 및 시간 */}
        {recipe && (
          <View style={styles.headerMetadata}>
            <Text style={styles.metadataText}>{recipe.difficulty}</Text>
            <View style={styles.metadataDivider} />
            <Text style={styles.metadataText}>{recipe.cookingTime}</Text>
          </View>
        )}
      </LinearGradient>

      {/* 메인 컨텐츠 */}
      {error ? (
        // 에러 상태
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>뒤로 가기</Text>
          </TouchableOpacity>
        </View>
      ) : !recipe ? (
        // 데이터 없음
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            레시피 정보를 불러올 수 없습니다.
          </Text>
        </View>
      ) : (
        // 레시피 상세 정보
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={{paddingBottom: isCookingMode ? 150 : 0}}
          showsVerticalScrollIndicator={false}>
          {/* 레시피 이미지 (최상단) */}
          <View style={styles.recipeImageContainer}>
            {recipe.imageUrl ? (
              <Image
                source={{uri: recipe.imageUrl}}
                style={styles.recipeImage}
                resizeMode="cover"
              />
            ) : (
              <CameraIcon
                color="#D1D5DB"
                size={64}
                style={styles.recipePlaceholderIcon}
              />
            )}
          </View>

          {/* 필요한 재료 카드 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>필요한 재료</Text>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <Text style={styles.ingredientAmount}>
                    {ingredient.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 조리 순서 카드 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>조리 순서</Text>
            <View style={styles.stepsList}>
              {recipe.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <LinearGradient
                    colors={['#00B8DB', '#155DFC']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </LinearGradient>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 하단 액션 영역 (조리 모드에서는 숨김) */}
          {!isCookingMode && (
            <View style={styles.actionContainer}>
              {/* 게시판 공개 체크박스 */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={toggleCheckbox}>
                <View
                  style={[
                    styles.checkbox,
                    shareToBoard && styles.checkboxChecked,
                  ]}>
                  {shareToBoard && <Check color="white" size={16} />}
                </View>
                <Text style={styles.checkboxLabel}>게시판에 공개</Text>
              </TouchableOpacity>

              {/* 저장 버튼 */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaved || isLoading}>
                <LinearGradient
                  colors={
                    isSaved ? ['#D1D5DB', '#D1D5DB'] : ['#00B8DB', '#155DFC']
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[styles.saveButton, isSaved && styles.savedButton]}>
                  <Text
                    style={[
                      styles.saveButtonText,
                      isSaved && styles.savedButtonText,
                    ]}>
                    {isSaved ? '저장됨' : isLoading ? '저장 중...' : '저장'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* 레시피 저장 완료 모달 */}
      <RecipeSaveModal
        visible={showSaveModal}
        onClose={handleCloseModal}
        onNavigateToRecipe={handleNavigateToRecipe}
        recipeName={recipe?.title || '레시피'}
      />

      {/* 재료 소비 확인 모달 */}
      <IngredientConsumeModal
        visible={showConsumeModal}
        onClose={handleCancelConsume}
        onConfirm={handleConfirmConsume}
        availableIngredients={getIngredientStatus().available}
        missingIngredients={getIngredientStatus().missing}
      />
    </View>
  );
}
