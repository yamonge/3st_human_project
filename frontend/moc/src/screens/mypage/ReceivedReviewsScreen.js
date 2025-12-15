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
import {ArrowLeft, Star, Calendar, Heart} from 'lucide-react-native';
// import {getReceivedReviews} from '../../api/mypage';
import styles from '../../styles/screens/mypage/ReceivedReviewsStyles';
import {colors} from '../../styles/common';

/**
 * 받은 후기 목록 화면
 *
 * 기능:
 * - 받은 후기 목록 표시
 * - 평균 별점 및 총 개수 표시
 * - 후기별 닉네임, 별점, 날짜, 내용 표시
 */
export default function ReceivedReviewsScreen({navigation}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCount: 0,
    averageRating: 0,
  });

  useEffect(() => {
    loadReviews();
  }, []);

  // 후기 목록 불러오기
  const loadReviews = async () => {
    try {
      setLoading(true);

      // TODO: 실제 API 연동 (주석 해제)
      // const response = await getReceivedReviews();
      // setReviews(response.reviews);
      // setStats({
      //   totalCount: response.totalCount,
      //   averageRating: response.averageRating,
      // });

      // 임시 더미 데이터
      const dummyData = {
        reviews: [
          {
            id: 1,
            nickname: '희동이',
            rating: 4,
            content:
              '함께 장보기 좋았어요! 친절하시고\n시간 약속도 잘 지켜주셨습니다.',
            createdAt: '2024.11.20',
          },
          {
            id: 2,
            nickname: '도우너',
            rating: 5,
            content:
              '덕분에 무거운 짐도 나눠 들 수 있었어요.\n다음에도 같이 하고 싶네요!',
            createdAt: '2024.11.18',
          },
          {
            id: 3,
            nickname: '또치',
            rating: 5,
            content: '좋은 경험이었습니다. 소통이 원활했어요.',
            createdAt: '2024.11.15',
          },
          {
            id: 4,
            nickname: '둘리',
            rating: 5,
            content: '매너가 좋으시고 시간 약속도 잘 지키셨어요.\n추천합니다!',
            createdAt: '2024.11.10',
          },
        ],
        totalCount: 4,
        averageRating: 4.8,
      };

      setReviews(dummyData.reviews);
      setStats({
        totalCount: dummyData.totalCount,
        averageRating: dummyData.averageRating,
      });
    } catch (error) {
      console.error('후기 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 별점 렌더링
  const renderStars = rating => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i <= rating ? '#FFD700' : 'none'}
          color={i <= rating ? '#FFD700' : '#E0E0E0'}
        />,
      );
    }
    return stars;
  };

  // 후기 카드 렌더링
  const renderReviewCard = review => (
    <View key={review.id} style={styles.reviewCard}>
      {/* 우측 상단 장식 */}
      <LinearGradient
        colors={['rgba(255, 240, 133, 0.3)', 'rgba(255, 214, 167, 0.3)']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.cardDecoration}
      />

      <View style={styles.cardContent}>
        {/* 헤더: 프로필 + 날짜 */}
        <View style={styles.cardHeader}>
          {/* 프로필 영역 */}
          <View style={styles.profileSection}>
            {/* 프로필 아이콘 */}
            <View style={styles.profileIcon}>
              <LinearGradient
                colors={['#FFB900', '#FF8904']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.profileGradient}>
                <Text style={{fontSize: 18, color: '#FFF'}}>
                  {review.nickname.charAt(0)}
                </Text>
              </LinearGradient>
            </View>

            {/* 닉네임 & 별점 */}
            <View style={styles.profileInfo}>
              <Text style={styles.nickname}>{review.nickname}</Text>
              <View style={styles.starRating}>
                {renderStars(review.rating)}
              </View>
            </View>
          </View>

          {/* 날짜 */}
          <View style={styles.dateSection}>
            <Calendar size={14} color="#6A7282" />
            <Text style={styles.dateText}>{review.createdAt}</Text>
          </View>
        </View>

        {/* 후기 내용 */}
        <View style={styles.reviewContent}>
          <Text style={styles.reviewText}>{review.content}</Text>
        </View>
      </View>
    </View>
  );

  // 로딩 상태
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 상단 헤더 */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={['#FFD6A7', '#FFD230']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            angle={160.34}
            style={styles.headerGradient}
          />
          {/* 배경 장식 아이콘들 */}
          <View style={[styles.decorIcon, styles.decorIcon1]}>
            <Star
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
            <Text style={styles.headerTitle}>받은 후기</Text>
          </View>

          {/* 통계 정보 */}
          <View style={styles.headerStats}>
            <Text style={styles.reviewCount}>{stats.totalCount}개</Text>
            <View style={styles.divider} />
            <View style={styles.ratingContainer}>
              <Star size={14} fill="#FFF" color="#FFF" />
              <Text style={styles.ratingText}>{stats.averageRating}</Text>
            </View>
          </View>

          {/* 장식용 일러스트 (추후 에셋 추가 시 활성화) */}
          <Image
            source={require('../../assets/images/mypage/message.png')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* 후기 리스트 */}
        <View style={styles.reviewList}>
          {reviews.length > 0 ? (
            reviews.map(review => renderReviewCard(review))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                아직 받은 후기가 없습니다.{'\n'}같이 장보기를 이용해보세요!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
