import React, {useMemo, useRef, useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, FlatList, Alert} from 'react-native';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {RefreshCw, Filter, AlertCircle, X} from 'lucide-react-native';
import PostCard from './PostCard';
import PostFilterModal from './PostFilterModal';
import PostCreateModal from './PostCreateModal';
import {getPostsByLocation} from '../../api/map';
import styles from '../../styles/components/map/PostListBottomSheetStyles';
import {colors} from '../../styles/common';

export default function PostListBottomSheet({
  visible,
  onClose,
  navigation,
  storeName = '선택된 장소',
  selectedMarker = null,
}) {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['30%', '80%'], []);

  // 게시물 목록 상태 (내부 관리)
  const [postList, setPostList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 게시물 필터 모달 (내부 관리)
  const [showPostFilterModal, setShowPostFilterModal] = useState(false);
  const [postFilters, setPostFilters] = useState({
    ingredients: [],
    peopleCount: 2,
    time: null,
  });

  // 게시물 작성 모달
  const [showPostCreateModal, setShowPostCreateModal] = useState(false);

  // visible 변경 시 바텀시트 열기/닫기
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
      // 바텀시트 열릴 때 게시물 로드
      if (selectedMarker) {
        loadPosts();
      }
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible, selectedMarker]);

  /**
   * 게시물 목록 불러오기
   * DTO → PostCard 모델 매핑 포함
   */
// meetDatetime -> "HH:mm"
const formatMeetTime = ts => {
  if (!ts) return '-';
  const d = new Date(ts); // Timestamp가 ISO로 직렬화되면 정상 파싱됨
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit'});
};

// categoryCodesCsv -> "meat 외 2개"
// 재료 코드 → 한글 라벨 매핑
const INGREDIENT_LABEL_MAP = {
  meat: '육류',
  dairy: '유제품',
  vegetable: '채소',
  fruit: '과일',
  snack: '간식',
  etc: '기타',
};

const formatItems = csv => {
  if (!csv) return '재료 미선택';

  const codes = String(csv)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (codes.length === 0) return '재료 미선택';

  const labels = codes.map(code => INGREDIENT_LABEL_MAP[code] || code);

  // 표기 정책: 1개면 그대로, 여러개면 "첫번째 외 n개"
  return labels.length === 1 ? labels[0] : `${labels[0]} 외 ${labels.length - 1}개`;
};

// DTO -> PostCard post 모델
const mapToPostCardModel = (dto, marker) => {
  const distanceKm =
    marker?.distance != null
      ? `${Number(marker.distance).toFixed(1)}km`
      : dto?.distanceMeters != null
      ? `${(Number(dto.distanceMeters) / 1000).toFixed(1)}km`
      : '-';

  return {
    id: dto.shoppingPostId,

    storeName: dto.placeName || marker?.name || '선택된 장소',
    distance: distanceKm,

    meetTime: formatMeetTime(dto.meetDatetime),

    currentCount: dto.currentPersonCnt ?? 0,
    maxCount: dto.maxPersonCnt ?? 0,

    items: formatItems(dto.categoryCodesCsv),

    author: dto.writerNickname || `user#${dto.writerUserId ?? ''}`,

    description: dto.description || '',

    // PostCard에서 new Date(post.createdAt) 하므로 ISO/파싱 가능 형태여야 함
    createdAt: dto.createdDate || new Date().toISOString(),
  };
};

/**
 * 게시물 목록 불러오기
 */
const loadPosts = async () => {
  if (!selectedMarker?.latitude || !selectedMarker?.longitude) return;

  try {
    setIsLoading(true);

    const fetchedPosts = await getPostsByLocation(
      selectedMarker.name, // 호환용 (백엔드가 무시해도 OK)
      selectedMarker.latitude,
      selectedMarker.longitude,
    );

    const mapped = (fetchedPosts || []).map(dto =>
      mapToPostCardModel(dto, selectedMarker),
    );

    setPostList(mapped);
    console.log('[게시물 조회 성공]', mapped.length, '개');
  } catch (error) {
    console.error('[게시물 조회 실패]', error);
    setPostList([]);
  } finally {
    setIsLoading(false);
  }
};

  /**
   * 새로고침 핸들러
   */
  const handleRefresh = () => {
    console.log('[게시물 새로고침]', storeName);
    loadPosts();
  };

  /**
   * 게시물 필터 모달 열기
   */
  const handlePostFilterPress = () => {
    console.log('[게시물 필터 열기]');
    setShowPostFilterModal(true);
  };

  /**
   * 게시물 필터 적용
   */
  const handleApplyPostFilter = filters => {
    setPostFilters(filters);
    console.log('[게시물 필터 적용]', filters);
    setShowPostFilterModal(false);

    // TODO: 필터링된 게시물 목록 다시 로드
    // 백엔드 API 연동 시 필터 파라미터와 함께 요청
    /*
    loadPostsWithFilters(filters);
    */
  };

  /**
   * 글쓰기 핸들러
   */
  const handleWritePress = () => {
    console.log('[글쓰기 클릭]', selectedMarker?.name);
    setShowPostCreateModal(true);
  };

  /**
   * 참여하기 핸들러
   */
  const handleJoinPost = post => {
    console.log('[참여하기]', post.id, post.storeName);
    // TODO: 백엔드 API 호출 → 채팅방 입장
    // navigation.navigate('ChatRoom', {postId: post.id, ...});
  };

  // 게시물 카드 렌더링
  const renderPostCard = ({item}) => (
    <PostCard post={item} onJoin={handleJoinPost} />
  );

  // 빈 상태
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <AlertCircle size={48} color={colors.textGray} strokeWidth={1.5} />
      <Text style={styles.emptyText}>해당 위치에 게시물이 없습니다</Text>
    </View>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      enableDynamicSizing={false}
      onClose={onClose}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      style={styles.bottomSheetContainer}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <X size={20} color={colors.textBlack} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시물 목록</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <RefreshCw size={20} color={colors.textBlack} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* 선택된 장소 정보 */}
      {selectedMarker && (
        <View style={{paddingHorizontal: 16, paddingBottom: 10}}>
          <Text style={{fontSize: 16, fontWeight: '700', color: colors.textBlack}}>
            {selectedMarker.name || storeName}
          </Text>

          {!!selectedMarker.address && (
            <Text style={{marginTop: 4, fontSize: 12, color: colors.textGray}}>
              {selectedMarker.address}
            </Text>
          )}

          {selectedMarker.distance != null && (
            <Text style={{marginTop: 4, fontSize: 12, color: colors.textGray}}>
              현재 위치에서 약 {Number(selectedMarker.distance).toFixed(1)}km
            </Text>
          )}
        </View>
      )}

      {/* 필터/글쓰기 버튼 */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={handlePostFilterPress}
          activeOpacity={0.7}>
          <Text style={styles.filterText}>필터</Text>
          <Filter size={13.375} color={colors.textGray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.writeButton}
          onPress={handleWritePress}
          activeOpacity={0.8}>
          <Text style={styles.writeButtonText}>글쓰기</Text>
        </TouchableOpacity>
      </View>

      {/* 게시물 리스트 */}
      <BottomSheetFlatList
        data={postList}
        renderItem={renderPostCard}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        contentContainerStyle={styles.postListContent}
        ListEmptyComponent={renderEmpty}
      />

      {/* 게시물 필터 모달 (바텀시트 내부에서 렌더링) */}
      <PostFilterModal
        visible={showPostFilterModal}
        onClose={() => setShowPostFilterModal(false)}
        onApply={handleApplyPostFilter}
      />

      {/* 게시물 작성 모달 */}
      <PostCreateModal
        visible={showPostCreateModal}
        onClose={() => setShowPostCreateModal(false)}
        selectedMarker={selectedMarker}
        storeName={selectedMarker?.name || storeName}
        onCreated={() => {
          setShowPostCreateModal(false);
          loadPosts(); // 생성 후 목록 갱신
        }}
      />
    </BottomSheet>
  );
}
