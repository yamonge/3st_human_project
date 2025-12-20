import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  InteractionManager,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MenuCard from '../../components/home/MenuCard';
import PopularRecipeCard from '../../components/home/PopularRecipeCard';
import {homeStyles} from '../../styles/screens/home/homeStyles';
import {
  initNotification,
  requestNotificationPermission,
  setupFCM,
} from '../../utils/notificationService';
import useChatStore from '../../stores/chatStore';
import StompClient from '../../utils/StompClient';
import {getRecipeBoardList} from '../../api/recipeBoard';

/**
 * 메인 홈 화면
 * 로그인 완료 후 진입하는 첫 화면
 * - 4개 메뉴 카드 (냉장고털기, 레시피찾기, 레시피게시판, 같이장보기)
 * - 인기 레시피 목록
 * - 하단 네비게이션
 */
export default function HomeScreen({navigation}) {
  // 사용자 정보 (임시)
  const [userName, setUserName] = useState('둘리');

  // 🔥 Zustand Store 액션
  const setConnected = useChatStore(state => state.setConnected);
  const setCurrentUser = useChatStore(state => state.setCurrentUser);

  // 🔥 WebSocket 연결 초기화 (홈 화면 진입 시)
  useFocusEffect(
    useCallback(() => {
      const initializeHome = async () => {
        try {
          // 🔹 사용자 정보 로드
          const userId = await AsyncStorage.getItem('userId');
          const nickname = await AsyncStorage.getItem('userNickname');

          if (!userId) {
            console.log('⚠️ [HomeScreen] 사용자 정보 없음');
            return;
          }

          // 🔹 상단 인삿말용
          setUserName(nickname || '사용자');

          // 🔹 Zustand Store에 사용자 정보 저장
          setCurrentUser({
            userId: Number(userId),
            nickname: nickname || '사용자',
          });

          // 🔹 WebSocket 연결 (이미 연결돼 있으면 중복 방지 권장)
          StompClient.connect(
            Number(userId),
            () => {
              console.log('✅ [HomeScreen] WebSocket 연결 성공!');
              setConnected(true);
            },
            error => {
              console.error('❌ [HomeScreen] WebSocket 연결 실패:', error);
              setConnected(false);
            },
          );
        } catch (error) {
          console.error('💥 [HomeScreen] 초기화 에러:', error);
        }
      };
      initializeHome();
    }, []),
  );

  // 알림 권한 요청 (홈 화면 렌더링 완료 후)
  useEffect(() => {
    // requestAnimationFrame: 다음 프레임에서 실행 (렌더링 완료 보장)
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        // 2프레임 대기 후 실행 (확실한 렌더링 완료)
        await initNotification();
        await setupFCM(); // FCM 권한 요청 및 토큰 생성
        await requestNotificationPermission();
      });
    });
  }, []);

  const [popularRecipes, setPopularRecipes] = useState([]);

  useEffect(() => {
    fetchPopularRecipes();
  }, []);

  const fetchPopularRecipes = async () => {
    try {
      const res = await getRecipeBoardList({
        sort: 'LIKE',
        page: 1,
        size: 3,
      });
      console.log('인기 레시피 데이터:', res);
      setPopularRecipes(res.items);
    } catch (e) {
      console.error('인기 레시피 조회 실패', e);
    }
  };

  // 같이 장보기 이동
  const handleShoppingPress = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Map'}],
    });
  };

  // 메뉴 카드 클릭 핸들러
  const handleMenuPress = type => {
    switch (type) {
      case 'fridge':
        // 카메라 플로우 이동 (스택 초기화)
        navigation.reset({
          index: 0,
          routes: [{name: 'Camera'}],
        });
        break;
      case 'search':
        // Voice 화면으로 이동
        navigation.reset({
          index: 0,
          routes: [{name: 'Voice'}],
        });
        break;
      case 'board':
        // 레시피 게시판 이동
        navigation.navigate('RecipeBoard');
        break;
      case 'shopping':
        // 지도 플로우 이동 (권한 체크)
        handleShoppingPress();
        break;
      default:
        break;
    }
  };

  // 인기 레시피 카드 클릭
  const handleRecipePress = recipe => {
    navigation.navigate('RecipeBoardDetail', {
      recipeId: recipe,
      from: 'recipeboard',
    });
  };

  // 좋아요 토글
  const handleLikeToggle = recipeId => {
    setPopularRecipes(prev =>
      prev.map(recipe =>
        recipe.recipeId === recipeId
          ? {
              ...recipe,
              likedByMe: !recipe.likedByMe,
              likeCnt: recipe.likeCnt ? recipe.likeCnt - 1 : recipe.likeCnt + 1,
            }
          : recipe,
      ),
    );
  };

  return (
    <View style={homeStyles.container}>
      <ScrollView
        contentContainerStyle={homeStyles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={homeStyles.content}>
          {/* 헤더 */}
          <View style={homeStyles.headerContainer}>
            <Text style={homeStyles.greeting}>안녕하세요, {userName}님</Text>
            <Text style={homeStyles.subGreeting}>
              My Own Chef에 어서오세요!
            </Text>
          </View>

          {/* 메뉴 섹션 */}
          <View style={homeStyles.menuSection}>
            <Text style={homeStyles.sectionTitleMenu}>메뉴</Text>

            <View style={{flexDirection: 'row', gap: 12, height: 300}}>
              <View style={{flex: 1, gap: 10}}>
                <MenuCard
                  type="fridge"
                  title="냉장고 털기"
                  subtitle="영수증 활용"
                  onPress={() => handleMenuPress('fridge')}
                  style={{flex: 1.5}}
                />
                <MenuCard
                  type="board"
                  title="레시피 게시판"
                  subtitle=""
                  onPress={() => handleMenuPress('board')}
                  style={{flex: 1}}
                />
              </View>
              <View style={{flex: 1, gap: 10}}>
                <MenuCard
                  type="search"
                  title="레시피 찾기"
                  subtitle="음성인식"
                  onPress={() => handleMenuPress('search')}
                  style={{flex: 1}}
                />
                <MenuCard
                  type="shopping"
                  title="같이 장보기"
                  subtitle="지도 및 채팅"
                  onPress={() => handleMenuPress('shopping')}
                  style={{flex: 1.5}}
                />
              </View>
            </View>
          </View>

          {/* 인기 레시피 섹션 */}
          <View style={homeStyles.popularSection}>
            <Text style={homeStyles.sectionTitle}>인기 레시피</Text>

            {popularRecipes.map((recipe, index) => (
              <PopularRecipeCard
                key={recipe.recipeId}
                recipe={recipe}
                rank={index + 1}
                onPress={() => handleRecipePress(recipe.recipeId)}
                onLike={() => handleLikeToggle(recipe.recipeId)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
