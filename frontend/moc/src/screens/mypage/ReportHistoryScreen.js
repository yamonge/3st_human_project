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
import {ArrowLeft, Shield, AlertTriangle, Star} from 'lucide-react-native';
import ReportCard from '../../components/mypage/ReportCard';
// import {getReportHistory} from '../../api/mypage';
import styles from '../../styles/screens/mypage/ReportHistoryStyles';
import {colors} from '../../styles/common';

/**
 * 신고 내역 화면
 *
 * 기능:
 * - 내가 신고한 내역 목록 표시
 * - 신고 유형별 배지 표시
 * - 처리 상태별 배지 표시 (처리완료, 검토중, 반려)
 */
export default function ReportHistoryScreen({navigation}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadReports();
  }, []);

  // 신고 내역 불러오기
  const loadReports = async () => {
    try {
      setLoading(true);

      // TODO: 실제 API 연동 (주석 해제)
      // const response = await getReportHistory();
      // setReports(response.reports);
      // setTotalCount(response.totalCount);

      // 임시 더미 데이터
      const dummyData = {
        reports: [
          {
            id: 1,
            title: '이상한 레시피',
            targetName: '나쁜사람',
            reason: '음란물 포함',
            category: 'inappropriate', // inappropriate, copyright, abuse, spam
            status: 'completed', // completed, pending, rejected
            createdAt: '2024.11.25',
          },
          {
            id: 2,
            title: '복사한 레시피',
            targetName: '도둑이',
            reason: '타 사이트 레시피 무단 복제',
            category: 'copyright',
            status: 'pending',
            createdAt: '2024.11.20',
          },
          {
            id: 3,
            title: '김치찌개',
            targetName: '악플러',
            reason: '댓글에 욕설 사용',
            category: 'abuse',
            status: 'completed',
            createdAt: '2024.11.18',
          },
          {
            id: 4,
            title: '광고 레시피',
            targetName: '스패머',
            reason: '광고 링크 포함',
            category: 'spam',
            status: 'rejected',
            createdAt: '2024.11.15',
          },
        ],
        totalCount: 4,
      };

      setReports(dummyData.reports);
      setTotalCount(dummyData.totalCount);
    } catch (error) {
      console.error('신고 내역 불러오기 실패:', error);
    } finally {
      setLoading(false);
    }
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
            colors={['#FFD0D0', '#FD5555', '#BC7F7F']}
            start={{x: 0, y: 0}}
            end={{x: 0, y: 1}}
            angle={175.64}
            style={styles.headerGradient}
          />

          {/* 배경 장식 아이콘들 */}
          <View style={[styles.decorIcon, styles.decorIcon1]}>
            <Shield
              size={48}
              color="rgba(255, 255, 255, 0.3)"
              strokeWidth={2}
            />
          </View>
          <View style={[styles.decorIcon, styles.decorIcon2]}>
            <AlertTriangle
              size={28}
              color="rgba(255, 255, 255, 0.3)"
              strokeWidth={2}
            />
          </View>
          <View style={[styles.decorIcon, styles.decorIcon3]}>
            <Star size={42} color="rgba(255, 255, 255, 0.3)" strokeWidth={2} />
          </View>

          {/* 타이틀 영역 */}
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.7}>
              <ArrowLeft size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>신고 내역</Text>
          </View>

          {/* 통계 정보 */}
          <View style={styles.headerStats}>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{totalCount}개</Text>
            </View>
            <Shield size={16} fill="#FFF" color="#FFF" />
          </View>

          {/* 장식용 일러스트 (추후 에셋 추가 시 활성화) */}
          <Image
            source={require('../../assets/images/mypage/report.png')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>

        {/* 콘텐츠 섹션 */}
        <View style={styles.contentSection}>
          {/* 신고 리스트 */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.reportListContainer}>
              {reports.length > 0 ? (
                reports.map(report => (
                  <ReportCard key={report.id} report={report} />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    신고 내역이 없습니다.{'\n'}부적절한 콘텐츠를 발견하면
                    신고해주세요.
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
