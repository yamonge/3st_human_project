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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ArrowLeft, Bookmark, Heart, Star} from 'lucide-react-native';
import RecipeListItem from '../../components/recipeboard/RecipeListItem';
import {getSavedRecipes, getLikedPosts} from '../../api/mypage';
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
  const fixImageUrl = url => {
    if (!url) return null;
    return url.replace('http://localhost:8090', 'http://10.0.2.2:8090');
  };

  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'liked'
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    console.log(
      '🧠 [SavedRecipesScreen] likedPosts state 변경됨:',
      likedPosts,
      'length:',
      likedPosts?.length,
    );
  }, [likedPosts]);

  // 데이터 불러오기
  const loadData = async () => {
    try {
      setLoading(true);

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.warn('❌ userId 없음 → API 호출 중단');
        setSavedRecipes([]);
        setLikedPosts([]);
        setTotalCount(0);
        return;
      }

      if (activeTab === 'saved') {
        const response = await getSavedRecipes(userId);
        setSavedRecipes(response.bookmarkedRecipes ?? []);
        setTotalCount(response.totalCount ?? 0);
      } else {
        const response = await getLikedPosts(userId);
        setLikedPosts(response.likedRecipes);
        setTotalCount(response.totalCount);
      }
    } catch (error) {
      console.error('데이터 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // 레시피 카드 클릭 핸들러
  const handleRecipePress = recipe => {
    navigation.navigate('RecipeBoardDetail', {
      recipeId: recipe.recipeId,
      from: 'recipeSave',
    });
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
              currentList.map(item => {
                const recipe = item.recipe; // ⭐ saved / liked 공통
                
                // 좋아요한 게시물 탭일 때는 likedByMe를 명시적으로 true로 설정
                const recipeWithLike = activeTab === 'liked' 
                  ? {...recipe, likedByMe: recipe.likedByMe || 1} 
                  : recipe;

                const key = `recipe-${recipe.recipeId}`;

                return (
                  <RecipeListItem
                    key={key}
                    recipe={recipeWithLike}
                    onPress={() => handleRecipePress(recipe)}
                    hideLike={activeTab === 'saved'}
                  />
                );
              })
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
