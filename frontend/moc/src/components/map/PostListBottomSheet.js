import React, {useMemo, useRef, useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, FlatList, Alert} from 'react-native';
import BottomSheet, {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {RefreshCw, Filter, AlertCircle} from 'lucide-react-native';
import PostCard from './PostCard';
import {getPostsByLocation} from '../../api/map';
import styles from '../../styles/components/map/PostListBottomSheetStyles';
import {colors} from '../../styles/common';

export default function PostListBottomSheet({
  visible,
  onClose,
  posts = [],
  onRefresh,
  onFilterPress,
  onWritePress,
  onJoinPost,
  storeName = '선택된 장소',
  selectedMarker = null, // 선택된 마커 정보 추가
}) {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['30%', '80%'], []);

  // 게시물 목록 상태
  const [postList, setPostList] = useState(posts);
  const [isLoading, setIsLoading] = useState(false);

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
  }, [visible]);

  // props의 posts가 변경되면 postList 업데이트
  useEffect(() => {
    setPostList(posts);
  }, [posts]);

  /**
   * 게시물 목록 불러오기
   */
  const loadPosts = async () => {
    if (!selectedMarker) return;

    /* 백엔드 API 연동 (준비되면 주석 해제)
    try {
      setIsLoading(true);
      const fetchedPosts = await getPostsByLocation(
        selectedMarker.name,
        selectedMarker.latitude,
        selectedMarker.longitude,
      );
      setPostList(fetchedPosts);
      console.log('[게시물 조회 성공]', fetchedPosts.length, '개');
    } catch (error) {
      console.error('[게시물 조회 실패]', error);
      setPostList([]);
      Alert.alert('오류', '게시물을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
    */

    // 임시: props로 받은 posts 사용
    console.log('[게시물 목록]', posts.length, '개 (임시 데이터)');
  };

  /**
   * 새로고침 핸들러
   */
  const handleRefresh = () => {
    console.log('[게시물 새로고침]', storeName);
    loadPosts();
    if (onRefresh) {
      onRefresh();
    }
  };

  // 게시물 카드 렌더링
  const renderPostCard = ({item}) => (
    <PostCard post={item} onJoin={onJoinPost} />
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
        <Text style={styles.headerTitle}>게시물 목록</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <RefreshCw size={20} color={colors.textBlack} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* 필터/글쓰기 버튼 */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterPress}
          activeOpacity={0.7}>
          <Text style={styles.filterText}>필터</Text>
          <Filter size={13.375} color={colors.textGray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.writeButton}
          onPress={onWritePress}
          activeOpacity={0.8}>
          <Text style={styles.writeButtonText}>글쓰기</Text>
        </TouchableOpacity>
      </View>

      {/* 게시물 리스트 */}
      <BottomSheetFlatList
        data={posts}
        renderItem={renderPostCard}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        contentContainerStyle={styles.postListContent}
        ListEmptyComponent={renderEmpty}
      />
    </BottomSheet>
  );
}
