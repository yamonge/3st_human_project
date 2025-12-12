import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Pressable,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Search, ChevronDown, X} from 'lucide-react-native';
import {Portal} from '@gorhom/portal';
import RecipeCard from '../../components/recipeboard/RecipeCard';
import RecipeListItem from '../../components/recipeboard/RecipeListItem';
import styles from '../../styles/screens/recipeboard/RecipeBoardStyles';
import headerClipboardImg from '../../assets/images/main/mianBoard.png';
// import {getRecipes} from '../../api/recipeBoard';

const RecipeBoardScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilterType, setCurrentFilterType] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  // 필터 옵션 데이터
  const filterOptions = {
    style: ['한식', '중식', '일식', '양식', '퓨전'],
    difficulty: ['하', '중', '상'],
    time: ['10분 이내', '30분 이내', '1시간 이내', '1시간 이상'],
  };

  // 더미 데이터 - 인기 레시피
  const dummyPopularRecipes = [
    {
      id: 1,
      title: '오징어 볶음밥',
      author: '요리왕 김철수',
      cookingTime: 25,
      difficulty: '중',
      likeCount: 999,
      isLiked: false,
      ingredients: [
        {name: '오징어', amount: '1마리'},
        {name: '밥', amount: '2공기'},
        {name: '양파', amount: '1/2개'},
        {name: '당근', amount: '1/4개'},
        {name: '간장', amount: '2스푼'},
      ],
      image: null,
    },
    {
      id: 2,
      title: '김치찌개',
      author: '한식요리사',
      cookingTime: 40,
      difficulty: '중',
      likeCount: 856,
      isLiked: true,
      ingredients: [
        {name: '김치', amount: '300g'},
        {name: '돼지고기', amount: '150g'},
        {name: '두부', amount: '1/2모'},
        {name: '대파', amount: '1/2대'},
      ],
      image: null,
    },
    {
      id: 3,
      title: '까르보나라',
      author: '파스타마스터',
      cookingTime: 20,
      difficulty: '하',
      likeCount: 742,
      isLiked: false,
      ingredients: [
        {name: '스파게티면', amount: '100g'},
        {name: '베이컨', amount: '4줄'},
        {name: '계란', amount: '2개'},
        {name: '파마산치즈', amount: '3스푼'},
      ],
      image: null,
    },
  ];

  const dummyAllRecipes = [
    {
      id: 4,
      title: '팬케이크',
      author: '베이킹마스터',
      cookingTime: 15,
      difficulty: '하',
      likeCount: 121,
      isLiked: false,
      ingredients: [
        {name: '밀가루', amount: '1컵'},
        {name: '계란', amount: '1개'},
        {name: '우유', amount: '1컵'},
        {name: '설탕', amount: '2스푼'},
      ],
      image: null,
    },
    {
      id: 5,
      title: '된장찌개',
      author: '집밥요리사',
      cookingTime: 30,
      difficulty: '하',
      likeCount: 89,
      isLiked: true,
      ingredients: [
        {name: '된장', amount: '2스푼'},
        {name: '두부', amount: '1/2모'},
        {name: '감자', amount: '1개'},
        {name: '호박', amount: '1/4개'},
      ],
      image: null,
    },
    {
      id: 6,
      title: '마라탕',
      author: '중식셰프',
      cookingTime: 45,
      difficulty: '중',
      likeCount: 156,
      isLiked: false,
      ingredients: [
        {name: '마라탕 육수', amount: '500ml'},
        {name: '각종 채소', amount: '취향껏'},
        {name: '고기', amount: '100g'},
        {name: '면', amount: '1인분'},
      ],
      image: null,
    },
    {
      id: 7,
      title: '일식 돈부리',
      author: '일식요리사',
      cookingTime: 25,
      difficulty: '하',
      likeCount: 203,
      isLiked: false,
      ingredients: [
        {name: '밥', amount: '1공기'},
        {name: '돼지고기', amount: '150g'},
        {name: '양파', amount: '1/2개'},
        {name: '계란', amount: '1개'},
      ],
      image: null,
    },
    {
      id: 8,
      title: '크림파스타',
      author: '양식셰프',
      cookingTime: 30,
      difficulty: '중',
      likeCount: 178,
      isLiked: true,
      ingredients: [
        {name: '파스타면', amount: '100g'},
        {name: '생크림', amount: '200ml'},
        {name: '베이컨', amount: '4줄'},
        {name: '마늘', amount: '3쪽'},
      ],
      image: null,
    },
  ];

  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    setTimeout(() => {
      setPopularRecipes(dummyPopularRecipes);
      setAllRecipes(dummyAllRecipes);
      setLoading(false);
    }, 500);
  }, []);

  const handleSearch = async () => {
    console.log('검색:', searchQuery);
    // TODO: 검색 API 호출
    // try {
    //   setLoading(true);
    //   const response = await getRecipes({
    //     search: searchQuery,
    //     style: selectedStyle,
    //     difficulty: selectedDifficulty,
    //     time: selectedTime,
    //   });
    //   setAllRecipes(response.recipes || []);
    // } catch (error) {
    //   console.error('레시피 검색 실패:', error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const openFilterSheet = filterType => {
    setCurrentFilterType(filterType);
    setIsModalVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeFilterSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
    });
  };

  const handleFilterSelect = value => {
    switch (currentFilterType) {
      case 'style':
        setSelectedStyle(value);
        break;
      case 'difficulty':
        setSelectedDifficulty(value);
        break;
      case 'time':
        setSelectedTime(value);
        break;
    }
    closeFilterSheet();
  };

  const getFilterTitle = () => {
    switch (currentFilterType) {
      case 'style':
        return '요리 스타일';
      case 'difficulty':
        return '난이도';
      case 'time':
        return '조리시간';
      default:
        return '';
    }
  };

  const getCurrentOptions = () => {
    return filterOptions[currentFilterType] || [];
  };

  const getCurrentValue = () => {
    switch (currentFilterType) {
      case 'style':
        return selectedStyle;
      case 'difficulty':
        return selectedDifficulty;
      case 'time':
        return selectedTime;
      default:
        return null;
    }
  };

  const handleRecipePress = recipeId => {
    console.log('레시피 선택:', recipeId);
    const recipe = [...popularRecipes, ...allRecipes].find(
      r => r.id === recipeId,
    );
    if (!recipe) return;
    navigation.navigate('RecipeBoardDetail', {
      recipe,
      from: 'recipeboard',
      mode: 'view',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#155DFC" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FBB2B2', '#F55E5E', '#FF9494']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        angle={155}
        style={styles.headerGradient}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 헤더 영역 */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* 제목 */}
            <View style={{paddingLeft: 0}}>
              <Text style={styles.headerTitle}>레시피 게시판</Text>
              <Text style={styles.headerSubtitle}>
                공유된 레시피를 확인하세요!
              </Text>
            </View>

            {/* 검색 바 */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="검색어를 입력해주세요."
                placeholderTextColor="#A1A1A1"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}>
                <LinearGradient
                  colors={['#00D3F2', '#2B7FFF']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.searchButton}>
                  <Search size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* 필터 칩 */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => openFilterSheet('style')}>
                <Text style={styles.filterChipText}>
                  {selectedStyle || '요리스타일'}
                </Text>
                <ChevronDown size={14} color="#404040" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => openFilterSheet('difficulty')}>
                <Text style={styles.filterChipText}>
                  {selectedDifficulty || '난이도'}
                </Text>
                <ChevronDown size={14} color="#404040" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => openFilterSheet('time')}>
                <Text style={styles.filterChipText}>
                  {selectedTime || '조리시간'}
                </Text>
                <ChevronDown size={14} color="#404040" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 헤더 이미지 (클립보드) - 추후 추가 */}
        </View>

        {/* 헤더 이미지 (클립보드) */}
        <Image
          source={headerClipboardImg}
          style={styles.headerImage}
          resizeMode="contain"
        />

        {/* 메인 콘텐츠 */}
        <View style={styles.contentContainer}>
          {/* 인기 레시피 섹션 */}
          <View style={styles.popularSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>인기 레시피</Text>
              <View style={styles.sectionDots}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dotLong} />
              </View>
            </View>

            {popularRecipes.length > 0 ? (
              <FlatList
                data={popularRecipes}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled={true}
                decelerationRate="fast"
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                  <View style={{width: 320, padding: 5}}>
                    <RecipeCard
                      recipe={item}
                      onPress={() => handleRecipePress(item.id)}
                    />
                  </View>
                )}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>인기 레시피가 없습니다.</Text>
              </View>
            )}
          </View>

          {/* 전체 레시피 섹션 */}
          <View style={styles.allRecipesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>전체 레시피</Text>
            </View>

            {allRecipes.length > 0 ? (
              <View style={styles.allRecipesList}>
                {allRecipes.map(recipe => (
                  <RecipeListItem
                    key={recipe.id}
                    recipe={recipe}
                    onPress={() => handleRecipePress(recipe.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>레시피가 없습니다.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 필터 바텀시트 */}
      <Portal>
        {isModalVisible && (
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{translateY: slideAnim}],
              },
            ]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getFilterTitle()}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeFilterSheet}>
                <X size={24} color="#404040" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {getCurrentOptions().map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.filterOption,
                    getCurrentValue() === option && styles.filterOptionSelected,
                  ]}
                  onPress={() => handleFilterSelect(option)}>
                  <Text
                    style={[
                      styles.filterOptionText,
                      getCurrentValue() === option &&
                        styles.filterOptionTextSelected,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </Portal>
    </View>
  );
};

export default RecipeBoardScreen;
