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

  const fixImageUrl = url => {
    if (!url) return null;
    return url.replace('http://localhost:8090', 'http://10.0.2.2:8090');
  };
  const {
    recipe: initialRecipe,
    ingredients = [],
    mode = 'view',
    from = 'camera',
  } = route.params || {};

  console.log('🔥 initialRecipe:', JSON.stringify(initialRecipe, null, 2));

  // 레시피->직접입력 플로우인지 확인
  const isRecipeDirectInput = from === 'recipe-direct-input';

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
      const isRecipeSaved =
        initialRecipe?.recipeId && savedList.includes(initialRecipe.recipeId);
      setIsSaved(isRecipeSaved);
      console.log(`레시피 ${initialRecipe?.id} 저장 여부:`, isRecipeSaved);
    } catch (error) {
      console.error('저장 여부 확인 실패:', error);
      setIsSaved(false);
    }
  };

  /**
   * 재료 소비 확인 핸들러 (백엔드 연동)
   */
  const handleConfirmConsume = async () => {
    setShowConsumeModal(false);
    setIsLoading(true);

    try {
      console.log('🚀 재료 소비 API 호출 시작');

      // 1️⃣ 로그인 사용자 ID
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('오류', '로그인 정보가 없습니다.');
        return;
      }

      // 2️⃣ 소비할 재료 DTO 구성 (ID + usageType 기준)
      const consumeIngredientsPayload = ingredients
        .filter(item => item.checked !== false)
        .map(item => ({
          userIngredientId: item.userIngredientId, // ✅ 핵심
          usageType: item.usageType, // "ALL" | "PARTIAL"
        }));

      if (consumeIngredientsPayload.length === 0) {
        Alert.alert('안내', '소비할 재료가 없습니다.');
        return;
      }

      // 3️⃣ 백엔드 API 호출
      const result = await consumeIngredients(
        Number(userId),
        recipe.recipeId ?? null,
        consumeIngredientsPayload,
      );

      if (!result.success) {
        Alert.alert('오류', result.error);
        setShowConsumeModal(true);
        return;
      }

      console.log('✅ 재료 소비 성공');

      // 4️⃣ 조리 모드로 전환
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
    const available = recipe.ingredients
      .slice(0, 2)
      .map(ing => ing.ingredientName);

    const missing = recipe.ingredients.slice(2).map(ing => ing.ingredientName);

    return {available, missing};
  };

  /**
   * 체크박스 토글
   */
  const toggleCheckbox = () => {
    setShareToBoard(!shareToBoard);
  };

  /**
   * 레시피 저장 핸들러 (백엔드 연동)
   */
  const handleSave = async () => {
    try {
      setIsLoading(true);

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('오류', '로그인 정보가 없습니다.');
        return;
      }

      const result = await saveRecipe(Number(userId), {
        title: recipe.title,
        summary: recipe.summary,
        difficultyCd: recipe.difficultyCd,
        cookTimeMin: recipe.cookTimeMin,
        cuisineStyleCd: recipe.cuisineStyleCd,
        category: recipe.category,
        share: shareToBoard,

        ingredients: recipe.requiredIngredients.map(ing => ({
          ingredientName: ing.ingredientName,
          quantityDesc: ing.quantityDesc,
        })),

        steps: recipe.cookingSteps.map((step, index) => ({
          stepNo: step.stepNo ?? index + 1,
          stepDesc: step.stepDesc,
        })),
      });

      if (!result.success) {
        Alert.alert('오류', result.error);
        return;
      }

      setIsSaved(true);
      setShowSaveModal(true);

      // 프론트 저장 여부 관리 (recipeId 기준)
      const savedRecipes = await AsyncStorage.getItem('savedRecipes');
      const savedList = savedRecipes ? JSON.parse(savedRecipes) : [];
      console.log('🔥 저장 payload 확인', {
        title: recipe.title,
        requiredIngredients: recipe.requiredIngredients,
        cookingSteps: recipe.cookingSteps,
      });
      await AsyncStorage.setItem(
        'savedRecipes',
        JSON.stringify([...savedList, result.recipeId]),
      );
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '레시피 저장 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleCloseModal = () => {
    setShowSaveModal(false);
  };
  const handleNavigateToRecipe = () => {
    setShowSaveModal(false);
    navigation.navigate('MyRecipes'); // 또는 RecipeBoard 등
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
            <Text style={styles.metadataText}>
              {recipe.difficultyText ?? recipe.difficultyCd}
            </Text>
            <View style={styles.metadataDivider} />
            <Text style={styles.metadataText}>{recipe.cookTimeMin}분</Text>
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
              {initialRecipe.requiredIngredients.map(ingredient => (
                <View
                  key={`${ingredient.ingredientName}-${ingredient.quantityDesc}`}
                  style={styles.ingredientItem}>
                  <Text style={styles.ingredientName}>
                    {ingredient.ingredientName}
                  </Text>
                  <Text style={styles.ingredientAmount}>
                    {ingredient.quantityDesc}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 조리 순서 카드 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>조리 순서</Text>
            <View style={styles.stepsList}>
              {recipe.cookingSteps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <LinearGradient
                    colors={['#00B8DB', '#155DFC']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>
                      {step.stepNo ?? index + 1}
                    </Text>
                  </LinearGradient>
                  <Text style={styles.stepText}>{step.stepDesc}</Text>
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
        hideStartButton={isRecipeDirectInput} // 레시피->직접입력일 때 시작 버튼 숨김
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
