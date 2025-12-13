import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {ArrowLeft, Send, Star, Share2} from 'lucide-react-native';
import RecipeListItem from '../../components/recipeboard/RecipeListItem';
// import {getSharedRecipes} from '../../api/mypage';
import styles from '../../styles/screens/mypage/SharedRecipesStyles';
import {colors} from '../../styles/common';

/**
 * 공유한 레시피 화면
 *
 * 기능:
 * - 내가 공유한 레시피 목록 표시
 * - RecipeListItem 컴포넌트 재사용 (좋아요 버튼 표시)
 * - 레시피 카드 클릭 시 상세보기 이동
 */
export default function SharedRecipesScreen({navigation}) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadRecipes();
  }, []);

  // 레시피 목록 불러오기
  const loadRecipes = async () => {
    try {
      setLoading(true);

      // TODO: 실제 API 연동 (주석 해제)
      // const response = await getSharedRecipes();
      // setRecipes(response.recipes);
      // setTotalCount(response.totalCount);

      // 임시 더미 데이터
      const dummyData = {
        recipes: [
          {
            id: 1,
            title: '팬케이크',
            author: '베이킹마스터',
            cookingTime: '15',
            difficulty: '하',
            image: null,
            ingredients: [
              {name: '밀가루'},
              {name: '계란'},
              {name: '우유'},
              {name: '설탕'},
            ],
            isLiked: true,
            likeCount: 121,
          },
          {
            id: 2,
            title: '김치찌개',
            author: '요리왕',
            cookingTime: '30',
            difficulty: '중',
            image: null,
            ingredients: [{name: '김치'}, {name: '돼지고기'}, {name: '두부'}],
            isLiked: false,
            likeCount: 85,
          },
          {
            id: 3,
            title: '된장찌개',
            author: '집밥요리사',
            cookingTime: '25',
            difficulty: '하',
            image: null,
            ingredients: [{name: '된장'}, {name: '두부'}, {name: '감자'}],
            isLiked: true,
            likeCount: 67,
          },
          {
            id: 4,
            title: '불고기',
            author: '한식러버',
            cookingTime: '40',
            difficulty: '중',
            image: null,
            ingredients: [{name: '소고기'}, {name: '양파'}, {name: '당근'}],
            isLiked: false,
            likeCount: 152,
          },
        ],
        totalCount: 4,
      };

      setRecipes(dummyData.recipes);
      setTotalCount(dummyData.totalCount);
    } catch (error) {
      console.error('레시피 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 레시피 카드 클릭 핸들러
  const handleRecipePress = recipe => {
    navigation.navigate('RecipeBoardDetail', {recipeId: recipe.id});
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 상단 헤더 */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={['#7371FC', '#8677D9', '#B99DD8']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            angle={175.64}
            style={styles.headerGradient}
          />

          {/* 배경 장식 아이콘들 */}
          <View style={[styles.decorIcon, styles.decorIcon1]}>
            <Send size={48} color="rgba(255, 255, 255, 0.3)" strokeWidth={2} />
          </View>
          <View style={[styles.decorIcon, styles.decorIcon2]}>
            <Share2
              size={28}
              color="rgba(255, 255, 255, 0.3)"
              strokeWidth={2}
            />
          </View>
          <View style={[styles.decorIcon, styles.decorIcon3]}>
            <Star
              size={42}
              color="rgba(255, 255, 255, 0.3)"
              strokeWidth={2}
              fill="rgba(255, 255, 255, 0.3)"
            />
          </View>

          {/* 타이틀 영역 */}
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.7}>
              <ArrowLeft size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>공유한 레시피</Text>
          </View>

          {/* 통계 정보 */}
          <View style={styles.headerStats}>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{totalCount}개</Text>
            </View>
            <Send size={16} fill="#FFF" color="#FFF" />
          </View>

          {/* 장식용 일러스트 (추후 에셋 추가 시 활성화) */}
          <Image
            source={require('../../assets/images/mypage/share.png')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* 콘텐츠 섹션 */}
        <View style={styles.contentSection}>
          {/* 레시피 리스트 */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.recipeListContainer}>
              {recipes.length > 0 ? (
                recipes.map(recipe => (
                  <RecipeListItem
                    key={recipe.id}
                    recipe={recipe}
                    onPress={() => handleRecipePress(recipe)}
                    hideLike={true} // 공유한 레시피에서는 좋아요 버튼 숨김
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    공유한 레시피가 없습니다.{'\n'}나만의 레시피를 공유해보세요!
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
