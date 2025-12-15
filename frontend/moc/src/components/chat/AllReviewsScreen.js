import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {ChevronLeft, Star} from 'lucide-react-native';
import styles from '../../styles/components/chat/AllReviewsScreenStyles';

const AllReviewsScreen = ({visible, onClose, participant}) => {
  if (!visible || !participant) return null;

  // 임시 데이터
  const reviewData = {
    nickname: participant.nickname || '둘리',
    rating: 4.5,
    totalReviews: 23,
    reviews: [
      {
        id: 1,
        author: '고길동',
        authorInitial: '고',
        rating: 5,
        date: '2일 전',
        content:
          '친절하고 시간 약속도 잘 지키세요! 다음에 또 함께하고 싶어요 😊',
      },
      {
        id: 2,
        author: '마이콜',
        authorInitial: '마',
        rating: 4,
        date: '1주 전',
        content: '좋은 재료 고르는 안목이 있으시네요',
      },
      {
        id: 3,
        author: '도우너',
        authorInitial: '도',
        rating: 5,
        date: '2주 전',
        content: '같이 장보기 정말 즐거웠습니다!',
      },
      {
        id: 4,
        author: '희동이',
        authorInitial: '희',
        rating: 5,
        date: '3주 전',
        content: '항상 밝은 에너지로 즐겁게 장보기 했어요!',
      },
    ],
  };

  const renderStars = rating => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} size={20} fill="#FFD700" color="#FFD700" />,
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          size={20}
          fill="#E5E7EB"
          color="#FFD700"
          strokeWidth={2}
        />,
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={20} fill="none" color="#E5E7EB" />,
      );
    }
    return stars;
  };

  const renderReviewStars = rating => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(
        <Star key={`review-${i}`} size={16} fill="#FFD700" color="#FFD700" />,
      );
    }
    const emptyStars = 5 - rating;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`review-empty-${i}`}
          size={16}
          fill="none"
          color="#E5E7EB"
        />,
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            activeOpacity={0.7}>
            <ChevronLeft size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{reviewData.nickname}님의 후기</Text>
        </View>
      </View>

      {/* 평균 평점 영역 */}
      <View style={styles.ratingSection}>
        <View style={styles.ratingContent}>
          <View style={styles.ratingTop}>
            <Text style={styles.ratingNumber}>{reviewData.rating}</Text>
            <View style={styles.ratingStars}>
              {renderStars(reviewData.rating)}
            </View>
          </View>
          <Text style={styles.totalReviews}>
            총 {reviewData.totalReviews}개의 후기
          </Text>
        </View>
      </View>

      {/* 후기 목록 */}
      <ScrollView
        style={styles.reviewsList}
        contentContainerStyle={styles.reviewsContent}
        showsVerticalScrollIndicator={false}>
        {reviewData.reviews.map(review => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAuthor}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorInitial}>
                    {review.authorInitial}
                  </Text>
                </View>
                <Text style={styles.authorName}>{review.author}</Text>
              </View>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
            <View style={styles.reviewStars}>
              {renderReviewStars(review.rating)}
            </View>
            <Text style={styles.reviewContent}>{review.content}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default AllReviewsScreen;
