import React, {useRef, useMemo, useCallback, useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Platform} from 'react-native';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {Portal} from '@gorhom/portal';
import {X, AlertTriangle, Star} from 'lucide-react-native';
import styles from '../../styles/components/chat/ParticipantProfileBottomSheetStyles';
import AllReviewsScreen from './AllReviewsScreen';
import ReportModal from '../common/ReportModal';
import {reportUser} from '../../api/report';

const ParticipantProfileBottomSheet = ({
  visible,
  onClose,
  participant,
  onReport,
}) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['80%'], []);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  // 바텀시트 열기/닫기
  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
    if (onClose) {
      setTimeout(() => onClose(), 300);
    }
  }, [onClose]);

  const handleReport = () => {
    setShowReportModal(true);
  };

  const handleSubmitReport = async reportData => {
    try {
      await reportUser(
        participant.userId,
        reportData.reason,
        reportData.detail,
      );

      // 성공 알림
      if (Platform.OS === 'web') {
        window.alert('신고가 접수되었습니다.');
      } else {
        const {Alert} = require('react-native');
        Alert.alert('신고 완료', '신고가 접수되었습니다.');
      }
    } catch (error) {
      console.error('신고 실패:', error);
      // 실패 알림
      if (Platform.OS === 'web') {
        window.alert('신고 처리 중 오류가 발생했습니다.');
      } else {
        const {Alert} = require('react-native');
        Alert.alert('오류', '신고 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleViewAllReviews = () => {
    setShowAllReviews(true);
  };

  if (!visible || !participant) return null;

  // 임시 데이터
  const profileData = {
    nickname: participant.nickname || '둘리',
    avatar: participant.avatar || '👽',
    joinDate: '2024년 8월 가입',
    rating: 4.5,
    reviewCount: 23,
    completedMeetings: 47,
    attendanceRate: 98,
    recentReviews: [
      {
        id: 1,
        author: '고길동',
        rating: 3,
        date: '2일 전',
        content:
          '친절하고 시간 약속도 잘 지키세요! 다음에 또 함께하고 싶어요 😊',
      },
      {
        id: 2,
        author: '마이콜',
        rating: 3,
        date: '1주 전',
        content: '좋은 재료 고르는 안목이 있으시네요',
      },
      {
        id: 3,
        author: '도우너',
        rating: 3,
        date: '2주 전',
        content: '같이 장보기 정말 즐거웠습니다!',
      },
    ],
  };

  const renderStars = (rating, size = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} size={size} fill="#FFD700" color="#FFD700" />,
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          size={size}
          fill="#E5E7EB"
          color="#FFD700"
          strokeWidth={2}
        />,
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={size} fill="none" color="#E5E7EB" />,
      );
    }
    return stars;
  };

  const renderReviewStars = rating => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(
        <Star key={`review-${i}`} size={12} fill="#FFD700" color="#FFD700" />,
      );
    }
    const emptyStars = 5 - rating;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`review-empty-${i}`}
          size={12}
          fill="none"
          color="#E5E7EB"
        />,
      );
    }
    return stars;
  };

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={visible ? 0 : -1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleClose}
        backdropComponent={({style}) => (
          <TouchableOpacity
            style={[style, styles.backdrop]}
            activeOpacity={1}
            onPress={handleClose}
          />
        )}>
        <View style={styles.container}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>프로필</Text>
            <View style={styles.headerActions}>
              {/* 본인이 아닐 때만 신고 버튼 표시 */}
              {!participant?.isMe && (
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleReport}
                  activeOpacity={0.7}>
                  <AlertTriangle size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleClose}
                activeOpacity={0.7}>
                <X size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 콘텐츠 */}
          <BottomSheetScrollView
            style={styles.content}
            contentContainerStyle={{
              paddingBottom: 100, // 또는 더 큰 값 (60-100)
            }}
            showsVerticalScrollIndicator={false}>
            {/* 프로필 정보 */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{profileData.avatar}</Text>
              </View>
              <Text style={styles.nickname}>{profileData.nickname}</Text>
              <Text style={styles.joinDate}>{profileData.joinDate}</Text>
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {renderStars(profileData.rating)}
                </View>
                <Text style={styles.ratingText}>
                  {profileData.rating} ({profileData.reviewCount}개 후기)
                </Text>
              </View>
            </View>

            {/* 통계 */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>🎯</Text>
                <Text style={styles.statValue}>
                  {profileData.completedMeetings}
                </Text>
                <Text style={styles.statLabel}>완료한 모임</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statIcon}>📊</Text>
                <Text style={styles.statValue}>
                  {profileData.attendanceRate}%
                </Text>
                <Text style={styles.statLabel}>참석률</Text>
              </View>
            </View>

            {/* 최근 받은 후기 */}
            <View style={styles.reviewsSection}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.reviewsTitle}>최근 받은 후기</Text>
                <TouchableOpacity
                  onPress={handleViewAllReviews}
                  activeOpacity={0.7}>
                  <Text style={styles.viewAllButton}>전체보기</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.reviewsList}>
                {profileData.recentReviews.map(review => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAuthor}>
                        <Text style={styles.reviewAuthorName}>
                          {review.author}
                        </Text>
                        <View style={styles.reviewStarsContainer}>
                          {renderReviewStars(review.rating)}
                        </View>
                      </View>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                    <Text style={styles.reviewContent}>{review.content}</Text>
                  </View>
                ))}
              </View>
            </View>
          </BottomSheetScrollView>
        </View>
      </BottomSheet>

      {/* 전체 후기 화면 */}
      {showAllReviews && (
        <Portal>
          <AllReviewsScreen
            visible={showAllReviews}
            onClose={() => setShowAllReviews(false)}
            participant={participant}
          />
        </Portal>
      )}

      {/* 신고 모달 */}
      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportTarget={participant}
        onSubmit={handleSubmitReport}
      />
    </>
  );
};

export default ParticipantProfileBottomSheet;
