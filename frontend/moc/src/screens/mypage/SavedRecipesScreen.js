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
import {ArrowLeft, Bookmark, Heart, Star} from 'lucide-react-native';
import RecipeListItem from '../../components/recipeboard/RecipeListItem';
// import {getSavedRecipes, getLikedPosts} from '../../api/mypage';
import styles from '../../styles/screens/mypage/SavedRecipesStyles';
import {colors} from '../../styles/common';

/**
 * 저장된 레시피 화면
 *
 * 기능:
 * - 내가 저장한 레시피 / 좋아요한 게시물 탭 전환
 * - 저장한 레시피 목록 표시 (좋아요 버튼 숨김)
 * - 좋아요한 게시물 목록 표시 (좋아요 버튼 표시)
 */
export default function SavedRecipesScreen({navigation}) {
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'liked'
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // 데이터 불러오기
  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'saved') {
        // TODO: 실제 API 연동 (주석 해제)
        // const response = await getSavedRecipes();
        // setSavedRecipes(response.recipes);
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
              isLiked: false,
              likeCount: 0,
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
              likeCount: 0,
            },
            {
              id: 3,
              title: '된장찌개',
              author: '집밥요리사',
              cookingTime: '25',
              difficulty: '하',
              image: null,
              ingredients: [{name: '된장'}, {name: '두부'}, {name: '감자'}],
              isLiked: false,
              likeCount: 0,
            },
          ],
          totalCount: 3,
        };

        setSavedRecipes(dummyData.recipes);
        setTotalCount(dummyData.totalCount);
      } else {
        // TODO: 실제 API 연동 (주석 해제)
        // const response = await getLikedPosts();
        // setLikedPosts(response.posts);
        // setTotalCount(response.totalCount);

        // 임시 더미 데이터
        const dummyData = {
          posts: [
            {
              id: 4,
              title: '스테이크 굽는 법',
              author: '육식주의자',
              cookingTime: '20',
              difficulty: '상',
              image: null,
              ingredients: [{name: '소고기'}, {name: '마늘'}, {name: '버터'}],
              isLiked: true,
              likeCount: 42,
            },
            {
              id: 5,
              title: '카레라이스',
              author: '카레마스터',
              cookingTime: '40',
              difficulty: '중',
              image: null,
              ingredients: [{name: '카레가루'}, {name: '감자'}, {name: '당근'}],
              isLiked: true,
              likeCount: 28,
            },
          ],
          totalCount: 2,
        };

        setLikedPosts(dummyData.posts);
        setTotalCount(dummyData.totalCount);
      }
    } catch (error) {
      console.error('데이터 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 레시피 카드 클릭 핸들러
  const handleRecipePress = recipe => {
    navigation.navigate('RecipeBoardDetail', {recipeId: recipe.id});
  };

  // 현재 표시할 리스트
  const currentList = activeTab === 'saved' ? savedRecipes : likedPosts;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 상단 헤더 */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={['#FEB37F', '#FF8E1C']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.headerGradient}
          />
          {/* 배경 장식 아이콘들 */}
          <View style={[styles.decorIcon, styles.decorIcon1]}>
            <Bookmark
              size={48}
              color="rgba(255, 255, 255, 0.3)"
              strokeWidth={2}
              fill="rgba(255, 255, 255, 0.3)"
            />
          </View>
          <View style={[styles.decorIcon, styles.decorIcon2]}>
            <Heart size={28} color="rgba(255, 255, 255, 0.3)" strokeWidth={2} />
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
            <Text style={styles.headerTitle}>저장된 레시피</Text>
          </View>

          {/* 통계 정보 */}
          <View style={styles.headerStats}>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{totalCount}개</Text>
            </View>
            <Bookmark size={16} fill="#FFF" color="#FFF" />
          </View>

          {/* 장식용 일러스트 (추후 에셋 추가 시 활성화) */}
          <Image
            source={require('../../assets/images/mypage/rating.png')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* 탭 영역 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('saved')}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'saved'
                  ? styles.activeTabText
                  : styles.inactiveTabText,
              ]}>
              내가 저장한 레시피
            </Text>
            {activeTab === 'saved' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('liked')}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'liked'
                  ? styles.activeTabText
                  : styles.inactiveTabText,
              ]}>
              좋아요한 게시물
            </Text>
            {activeTab === 'liked' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* 레시피 리스트 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.recipeListContainer}>
            {currentList.length > 0 ? (
              currentList.map(recipe => (
                <RecipeListItem
                  key={recipe.id}
                  recipe={recipe}
                  onPress={() => handleRecipePress(recipe)}
                  hideLike={activeTab === 'saved'} // 저장한 레시피 탭에서만 좋아요 숨김
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {activeTab === 'saved'
                    ? '저장된 레시피가 없습니다.\n마음에 드는 레시피를 저장해보세요!'
                    : '좋아요한 게시물이 없습니다.\n마음에 드는 게시물에 좋아요를 눌러보세요!'}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
