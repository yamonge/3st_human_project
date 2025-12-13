import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ArrowLeft, Search, EyeOff, Eye, Trash2} from 'lucide-react-native';
import styles from '../../styles/screens/admin/PostManagementStyles';
import {colors} from '../../styles/common';
import {getPostList, deletePost, togglePostVisibility} from '../../api/admin';
import IngredientModal from '../../components/common/IngredientModal';

/**
 * 게시글 관리 화면
 *
 * 구조:
 * - 상단 헤더: 뒤로가기 + "게시글 관리" 타이틀
 * - 검색 바: 제목 또는 작성자 검색
 * - 필터 탭: 전체, 공개, 숨김
 * - 게시글 목록: 게시글 카드 리스트
 *   - 제목, 상태 배지, 소유자, 날짜
 *   - 액션 버튼: 숨김/공개, 삭제
 */
export default function PostManagementScreen({navigation}) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'public', 'hidden'
  const [deleteModal, setDeleteModal] = useState({visible: false, post: null});

  useEffect(() => {
    loadPosts();
  }, [selectedFilter]);

  // 게시글 목록 로드
  const loadPosts = async () => {
    try {
      setLoading(true);

      // TODO: 실제 API 연동 (주석 해제)
      // const params = {
      //   status: selectedFilter === 'all' ? null : selectedFilter,
      //   search: searchQuery,
      // };
      // const response = await getPostList(params);
      // setPosts(response.posts || []);

      // 임시 더미 데이터
      const dummyPosts = [
        {
          id: 1,
          title: '제육볶음',
          owner: '홍길동',
          date: '2024.11.28',
          isHidden: false,
        },
        {
          id: 2,
          title: '떡볶이',
          owner: '김철수',
          date: '2024.11.27',
          isHidden: false,
        },
        {
          id: 3,
          title: '볶음밥',
          owner: '이영희',
          date: '2024.11.26',
          isHidden: true,
        },
        {
          id: 4,
          title: '김치찌개',
          owner: '박민수',
          date: '2024.11.25',
          isHidden: false,
        },
        {
          id: 5,
          title: '된장찌개',
          owner: '최지우',
          date: '2024.11.24',
          isHidden: true,
        },
      ];

      // 필터 적용
      let filteredPosts = dummyPosts;
      if (selectedFilter === 'public') {
        filteredPosts = dummyPosts.filter(p => !p.isHidden);
      } else if (selectedFilter === 'hidden') {
        filteredPosts = dummyPosts.filter(p => p.isHidden);
      }

      // 검색 적용 (제목, 작성자, 게시글 ID)
      if (searchQuery.trim()) {
        filteredPosts = filteredPosts.filter(
          p =>
            p.title.includes(searchQuery) ||
            p.owner.includes(searchQuery) ||
            p.id.toString().includes(searchQuery),
        );
      }

      setPosts(filteredPosts);
    } catch (error) {
      console.error('게시글 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 검색
  const handleSearch = () => {
    loadPosts();
  };

  // 필터 변경
  const handleFilterChange = filter => {
    setSelectedFilter(filter);
  };

  // 숨김/공개 토글
  const handleToggleVisibility = async post => {
    try {
      // TODO: 실제 API 연동 (주석 해제)
      // await togglePostVisibility(post.id, !post.isHidden);

      console.log(
        `게시글 ${post.title} ${post.isHidden ? '공개' : '숨김'} 처리`,
      );
      loadPosts();
    } catch (error) {
      console.error('게시글 숨김/공개 실패:', error);
    }
  };

  // 삭제 모달 열기
  const handleOpenDeleteModal = post => {
    setDeleteModal({visible: true, post});
  };

  // 삭제 모달 닫기
  const handleCloseDeleteModal = () => {
    setDeleteModal({visible: false, post: null});
  };

  // 삭제 확인
  const handleConfirmDelete = async () => {
    if (!deleteModal.post) return;

    try {
      // TODO: 실제 API 연동 (주석 해제)
      // await deletePost(deleteModal.post.id);

      console.log(`게시글 ${deleteModal.post.title} 삭제`);
      handleCloseDeleteModal();
      loadPosts();
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
    }
  };

  // 필터 버튼 렌더링
  const FilterButton = ({label, value}) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === value && styles.filterButtonActive,
      ]}
      onPress={() => handleFilterChange(value)}
      activeOpacity={0.7}>
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === value && styles.filterButtonTextActive,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // 게시글 카드 렌더링
  const PostCard = ({post}) => {
    return (
      <View style={styles.postCard}>
        {/* 상단: 제목, 상태 배지 */}
        <View style={styles.cardHeader}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <View
            style={[
              styles.statusBadge,
              post.isHidden
                ? styles.statusBadgeHidden
                : styles.statusBadgePublic,
            ]}>
            <Text
              style={[
                styles.statusBadgeText,
                post.isHidden
                  ? styles.statusBadgeTextHidden
                  : styles.statusBadgeTextPublic,
              ]}>
              {post.isHidden ? '숨김' : '공개'}
            </Text>
          </View>
        </View>

        {/* 중간: 소유자, 날짜 */}
        <View style={styles.cardInfo}>
          <Text style={styles.ownerText}>소유자: {post.owner}</Text>
          <Text style={styles.dateText}>{post.date}</Text>
        </View>

        {/* 하단: 액션 버튼 */}
        <View style={styles.actionButtons}>
          {/* 숨김/공개 버튼 */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleVisibility(post)}
            activeOpacity={0.8}>
            <LinearGradient
              colors={
                post.isHidden ? ['#00c950', '#008736'] : ['#6a7282', '#17191c']
              }
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.gradientButton}>
              {post.isHidden ? (
                <Eye size={16} color={colors.white} />
              ) : (
                <EyeOff size={16} color={colors.white} />
              )}
              <Text style={styles.actionButtonText}>
                {post.isHidden ? '공개' : '숨김'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* 삭제 버튼 */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenDeleteModal(post)}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#ED6F75', '#F60000']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              angle={166.1}
              style={styles.gradientButton}>
              <Trash2 size={16} color={colors.white} />
              <Text style={styles.actionButtonText}>삭제</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('AdminSettings')}>
          <ArrowLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시글 관리</Text>
      </View>

      {/* 검색 및 필터 영역 */}
      <View style={styles.searchSection}>
        {/* 검색 바 */}
        <View style={styles.searchBar}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="제목, 작성자, 게시글 ID 검색"
            placeholderTextColor="rgba(10, 10, 10, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* 필터 버튼 */}
        <View style={styles.filterRow}>
          <FilterButton label="전체" value="all" />
          <FilterButton label="공개" value="public" />
          <FilterButton label="숨김" value="hidden" />
        </View>
      </View>

      {/* 게시글 리스트 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : posts.length > 0 ? (
          posts.map(post => <PostCard key={post.id} post={post} />)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>게시글이 없습니다.</Text>
          </View>
        )}
      </ScrollView>

      {/* 삭제 확인 모달 */}
      <IngredientModal
        visible={deleteModal.visible}
        type="delete"
        title="게시글 삭제"
        message={`"${
          deleteModal.post?.title || ''
        }" 게시글을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`}
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}
