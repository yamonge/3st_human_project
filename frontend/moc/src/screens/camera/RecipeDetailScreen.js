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
import {styles} from '../../styles/screens/camera/recipeDetailStyles.js';

/**
 * 레시피 상세 화면
 * 선택한 레시피의 상세 정보(재료, 조리 순서 등)를 표시하는 화면
 *
 * Route Params:
 * - recipe: 레시피 전체 데이터 (추천 API에서 이미 받아온 데이터)
 * - ingredients: 선택한 재료 목록 (선택사항)
 */
export default function RecipeDetailScreen({route, navigation}) {
  const {recipe: initialRecipe, ingredients = []} = route.params || {};

  const [recipe, setRecipe] = useState(initialRecipe);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shareToBoard, setShareToBoard] = useState(false);

  // 화면 마운트 시 레시피 데이터 확인
  useEffect(() => {
    if (!initialRecipe) {
      setError('레시피 정보가 없습니다.');
    }
  }, [initialRecipe]);

  /**
   * 저장 버튼 핸들러
   */
  const handleSave = () => {
    console.log('💾 레시피 저장:', {
      recipeId: recipe?.id,
      shareToBoard,
    });

    Alert.alert(
      '저장 완료',
      shareToBoard
        ? '레시피가 게시판에 공유되었습니다!'
        : '레시피가 저장되었습니다!',
      [
        {
          text: '확인',
          onPress: () => navigation.navigate('Home'),
        },
      ],
    );

    // TODO: 백엔드 개발 완료 후 저장 API 호출
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
          {/* 뒤로가기 버튼 */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.navigate('RecommendedRecipes', route.params)
            }>
            <ChevronLeft color="white" size={24} />
          </TouchableOpacity>

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

          {/* 하단 액션 영역 */}
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
            <TouchableOpacity onPress={handleSave}>
              <LinearGradient
                colors={['#00B8DB', '#155DFC']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.saveButton}>
                <Text style={styles.saveButtonText}>저장</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
