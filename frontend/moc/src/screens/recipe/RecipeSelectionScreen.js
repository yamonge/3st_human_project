import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, StatusBar} from 'react-native';
import {Keyboard, Package, ChevronRight, X} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {styles} from '../../styles/screens/recipe/recipeSelectionStyles';

/**
 * 레시피 추천 방식 선택 화면
 * FAB 메뉴의 AI 아이콘 클릭 시 진입
 *
 * 2가지 추천 방식:
 * 1. 직접 입력으로 추천받기 - 재료를 수동 입력
 * 2. 내 재료로 추천받기 - DB에 저장된 재료 선택
 */
export default function RecipeSelectionScreen({navigation}) {
  /**
   * 직접 입력 방식 선택
   */
  const handleDirectInput = () => {
    console.log('🎹 직접 입력으로 추천받기 선택');
    // TODO: 재료 입력 화면으로 이동
    // navigation.navigate('IngredientInput');
  };

  /**
   * 내 재료 방식 선택
   */
  const handleMyIngredients = () => {
    console.log('📦 내 재료로 추천받기 선택');
    // TODO: 재료 선택 화면으로 이동 (DB 조회)
    // navigation.navigate('IngredientSelection', { source: 'myIngredients' });
  };

  /**
   * 닫기 버튼
   */
  const handleClose = () => {
    navigation.goBack();
  };

  // 데코레이션 애니메이션 - X, Y 위치 이동
  const circle1X = useSharedValue(0);
  const circle1Y = useSharedValue(0);
  const circle2X = useSharedValue(0);
  const circle2Y = useSharedValue(0);
  const circle3X = useSharedValue(0);
  const circle3Y = useSharedValue(0);
  const circle4X = useSharedValue(0);
  const circle4Y = useSharedValue(0);
  const circle5X = useSharedValue(0);
  const circle5Y = useSharedValue(0);
  const circle6X = useSharedValue(0);
  const circle6Y = useSharedValue(0);

  useEffect(() => {
    // 원형 1: 대각선 이동 (왼쪽 상단)
    circle1X.value = withRepeat(
      withTiming(80, {duration: 5000, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
    circle1Y.value = withRepeat(
      withTiming(70, {duration: 4500, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );

    // 원형 2: 타원 궤적 (오른쪽 중간)
    circle2X.value = withRepeat(
      withTiming(-100, {duration: 6000, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
    circle2Y.value = withRepeat(
      withTiming(90, {duration: 5000, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );

    // 원형 3: 작은 원형 궤적 (왼쪽 하단)
    circle3X.value = withRepeat(
      withTiming(60, {duration: 4000, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
    circle3Y.value = withRepeat(
      withTiming(-60, {duration: 3500, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );

    // 원형 4: 하단 오른쪽
    circle4X.value = withRepeat(
      withTiming(-90, {duration: 5500, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
    circle4Y.value = withRepeat(
      withTiming(65, {duration: 5000, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );

    // 원형 5: 하단 왼쪽
    circle5X.value = withRepeat(
      withTiming(75, {duration: 4800, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
    circle5Y.value = withRepeat(
      withTiming(-80, {duration: 4300, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );

    // 원형 6: 하단 중앙
    circle6X.value = withRepeat(
      withTiming(50, {duration: 4500, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
    circle6Y.value = withRepeat(
      withTiming(55, {duration: 4000, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
  }, []);

  const circle1Style = useAnimatedStyle(() => ({
    transform: [{translateX: circle1X.value}, {translateY: circle1Y.value}],
  }));

  const circle2Style = useAnimatedStyle(() => ({
    transform: [{translateX: circle2X.value}, {translateY: circle2Y.value}],
  }));

  const circle3Style = useAnimatedStyle(() => ({
    transform: [{translateX: circle3X.value}, {translateY: circle3Y.value}],
  }));

  const circle4Style = useAnimatedStyle(() => ({
    transform: [{translateX: circle4X.value}, {translateY: circle4Y.value}],
  }));

  const circle5Style = useAnimatedStyle(() => ({
    transform: [{translateX: circle5X.value}, {translateY: circle5Y.value}],
  }));

  const circle6Style = useAnimatedStyle(() => ({
    transform: [{translateX: circle6X.value}, {translateY: circle6Y.value}],
  }));

  return (
    <LinearGradient
      colors={['#8FB4FF', '#B8D4FF']}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
      style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 상단 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>레시피 추천</Text>
            <View style={styles.titleIcon}>
              {/* 요리 아이콘 (데코레이션) */}
            </View>
          </View>

          {/* 닫기 버튼 */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}>
            <X color="white" size={20} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          어떤 방법으로 레시피를 추천받으시겠어요?
        </Text>
      </View>

      {/* 선택 카드 영역 */}
      <View style={styles.cardsContainer}>
        {/* 직접 입력으로 추천받기 */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleDirectInput}
          activeOpacity={0.8}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Keyboard color="white" size={30} />
            </View>

            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>직접 입력으로 추천받기</Text>
              <Text style={styles.cardDescription}>
                재료를 직접 입력하고 필터를 설정해요
              </Text>
            </View>

            <ChevronRight color="#9CA3AF" size={24} />
          </View>
        </TouchableOpacity>

        {/* 내 재료로 추천받기 */}
        <TouchableOpacity
          style={styles.card}
          onPress={handleMyIngredients}
          activeOpacity={0.8}>
          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, styles.iconContainerGreen]}>
              <Package color="white" size={30} />
            </View>

            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>내 재료로 추천받기</Text>
              <Text style={styles.cardDescription}>
                저장된 재료 목록에서 선택해요
              </Text>
            </View>

            <ChevronRight color="#9CA3AF" size={24} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 데코레이션 요소 (둥둥 떠다니며 위치 이동) */}
      <Animated.View style={[styles.decorationCircle1, circle1Style]} />
      <Animated.View style={[styles.decorationCircle2, circle2Style]} />
      <Animated.View style={[styles.decorationCircle3, circle3Style]} />

      {/* 하단 추가 데코레이션 (애니메이션 적용) */}
      <Animated.View style={[styles.decorationCircle4, circle4Style]} />
      <Animated.View style={[styles.decorationCircle5, circle5Style]} />
      <Animated.View style={[styles.decorationCircle6, circle6Style]} />
    </LinearGradient>
  );
}
