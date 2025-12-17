import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  InteractionManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MenuCard from '../../components/home/MenuCard';
import PopularRecipeCard from '../../components/home/PopularRecipeCard';
import {homeStyles} from '../../styles/screens/home/homeStyles';
import {
  initNotification,
  requestNotificationPermission,
} from '../../utils/notificationService';
import useChatStore from '../../stores/chatStore';
import StompClient from '../../utils/StompClient';

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
  useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        // 사용자 정보 로드
        const userId = await AsyncStorage.getItem('userId');
        const nickname = await AsyncStorage.getItem('userNickname');

        if (!userId) {
          console.log(
            '⚠️ [HomeScreen] 사용자 정보 없음 - WebSocket 연결 건너뜀',
          );
          return;
        }

        console.log('🔌 [HomeScreen] WebSocket 연결 시작...', {
          userId,
          nickname,
        });

        // Zustand Store에 사용자 정보 저장
        setCurrentUser({
          userId: Number(userId),
          nickname: nickname || '사용자',
        });

        // WebSocket 연결
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
        console.error('💥 [HomeScreen] WebSocket 초기화 에러:', error);
      }
    };

    initializeWebSocket();

    // ✅ WebSocket은 앱 전체에서 공유되므로 언마운트 시에도 연결 유지
    // cleanup 함수 제거 - 연결을 끊지 않음!
  }, []);

  // 알림 초기화 및 권한 요청 (홈 화면 렌더링 완료 후)
  useEffect(() => {
    // requestAnimationFrame: 다음 프레임에서 실행 (렌더링 완료 보장)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // 2프레임 대기 후 실행 (확실한 렌더링 완료)
        initNotification();
        requestNotificationPermission();
      });
    });
  }, []);

  // 인기 레시피 데이터 (임시 - 추후 API 연동)
  const [popularRecipes, setPopularRecipes] = useState([
    {
      id: 1,
      title: '팬케이크',
      author: '베이킹마스터',
      cookingTime: 15,
      difficulty: '하',
      ingredients: ['밀가루', '계란', '우유', '설탕'],
      imageUrl: '',
      likeCount: 1205,
      isLiked: false,
    },
    {
      id: 2,
      title: '팬케이크',
      author: '베이킹마스터',
      cookingTime: 15,
      difficulty: '하',
      ingredients: ['밀가루', '계란', '우유', '설탕'],
      imageUrl: '',
      likeCount: 998,
      isLiked: false,
    },
    {
      id: 3,
      title: '팬케이크',
      author: '베이킹마스터',
      cookingTime: 15,
      difficulty: '하',
      ingredients: ['밀가루', '계란', '우유', '설탕'],
      imageUrl: '',
      likeCount: 856,
      isLiked: false,
    },
  ]);

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
        // TODO: 마이크 플로우 이동
        Alert.alert('레시피 찾기', '음성인식 플로우로 이동합니다.');
        // navigation.navigate('Voice');
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
    // TODO: 레시피 상세보기 이동
    Alert.alert('레시피 상세', `${recipe.title} 상세보기로 이동합니다.`);
    // navigation.navigate('RecipeDetail', { recipeId: recipe.id });
  };

  // 좋아요 토글
  const handleLikeToggle = recipeId => {
    setPopularRecipes(prev =>
      prev.map(recipe =>
        recipe.id === recipeId
          ? {
              ...recipe,
              isLiked: !recipe.isLiked,
              likeCount: recipe.isLiked
                ? recipe.likeCount - 1
                : recipe.likeCount + 1,
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
                key={recipe.id}
                recipe={recipe}
                rank={index + 1}
                onPress={() => handleRecipePress(recipe)}
                onLike={() => handleLikeToggle(recipe.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
