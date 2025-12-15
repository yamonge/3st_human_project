import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ArrowLeft, Search, ChevronDown} from 'lucide-react-native';
import styles from '../../styles/screens/admin/ReportManagementStyles';
import {colors} from '../../styles/common';
import {getReportList, sendWarning, suspendUserByReport} from '../../api/admin';
import SuspendDurationModal from '../../components/admin/SuspendDurationModal';
import ReportDetailModal from '../../components/admin/ReportDetailModal';

/**
 * 신고 관리 화면
 *
 * 구조:
 * - 상단 헤더: 뒤로가기 + "신고 관리" 타이틀
 * - 검색 바: 신고자 또는 피신고자 검색
 * - 필터 탭
 *   - 신고 대상: 전체, 게시물, 사용자
 *   - 신고 유형: 전체, 노쇼, 욕설, 허위
 *   - 처리 상태: 전체, 미처리, 처리완료
 * - 신고 목록: 신고 카드 리스트
 *   - 유형, 상태, 출처, 날짜, 신고자 → 피신고자, 내용
 *   - 액션 버튼: 경고 발송, 계정 정지
 */
export default function ReportManagementScreen({navigation}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportType, setSelectedReportType] = useState(''); // '', 'all', 'post', 'user'
  const [selectedType, setSelectedType] = useState(''); // '', 'all', 'noshow', 'abuse', 'fake'
  const [selectedStatus, setSelectedStatus] = useState(''); // '', 'all', 'pending', 'resolved'
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [detailModal, setDetailModal] = useState({
    visible: false,
    report: null,
  });
  const [showReportTypeDropdown, setShowReportTypeDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    loadReports();
  }, [selectedReportType, selectedType, selectedStatus]);

  // 신고 목록 로드
  const loadReports = async () => {
    try {
      setLoading(true);

      // TODO: 실제 API 연동 (주석 해제)
      // const params = {
      //   reportType: selectedReportType === 'all' ? null : selectedReportType,
      //   type: selectedType === 'all' ? null : selectedType,
      //   status: selectedStatus === 'all' ? null : selectedStatus,
      //   search: searchQuery,
      // };
      // const response = await getReportList(params);
      // setReports(response.reports || []);

      // 임시 더미 데이터
      const dummyReports = [
        {
          id: 1,
          reportType: 'user', // 'post' or 'user'
          source: 'shopping_together', // 'recipe_board' or 'shopping_together'
          type: 'noshow',
          status: 'pending',
          date: '2024.11.28',
          reporter: '홍길동',
          reported: '김철수',
          reportedUserId: 2,
          description: '공동구매 약속 시간에 나타나지 않음',
          details: '11월 28일 오후 3시 약속에 30분 이상 지각',
        },
        {
          id: 2,
          reportType: 'user',
          source: 'shopping_together',
          type: 'abuse',
          status: 'pending',
          date: '2024.11.27',
          reporter: '이영희',
          reported: '박민수',
          reportedUserId: 4,
          description: '채팅에서 욕설 사용',
          details: '채팅방에서 반복적으로 욕설과 비방',
        },
        {
          id: 3,
          reportType: 'post',
          source: 'recipe_board',
          postId: 'RCP-12345',
          type: 'fake',
          status: 'resolved',
          date: '2024.11.26',
          reporter: '최수진',
          reported: '정현우',
          reportedUserId: 5,
          description: '허위 상품 정보 게시',
          details: '레시피와 무관한 광고성 게시물',
        },
        {
          id: 4,
          reportType: 'post',
          source: 'recipe_board',
          postId: 'RCP-12346',
          type: 'abuse',
          status: 'pending',
          date: '2024.11.25',
          reporter: '강민지',
          reported: '이태민',
          reportedUserId: 6,
          description: '부적절한 이미지 포함',
          details: '음식과 무관한 선정적 이미지 게시',
        },
      ];

      // 필터 적용
      let filteredReports = dummyReports;
      if (selectedReportType && selectedReportType !== 'all') {
        filteredReports = filteredReports.filter(
          r => r.reportType === selectedReportType,
        );
      }
      if (selectedType && selectedType !== 'all') {
        filteredReports = filteredReports.filter(r => r.type === selectedType);
      }
      if (selectedStatus && selectedStatus !== 'all') {
        filteredReports = filteredReports.filter(
          r => r.status === selectedStatus,
        );
      }

      // 검색 적용
      if (searchQuery.trim()) {
        filteredReports = filteredReports.filter(
          r =>
            r.reporter.includes(searchQuery) ||
            r.reported.includes(searchQuery),
        );
      }

      setReports(filteredReports);
    } catch (error) {
      console.error('신고 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 검색
  const handleSearch = () => {
    loadReports();
  };

  // 필터 변경
  const handleReportTypeFilterChange = reportType => {
    setSelectedReportType(reportType);
  };

  const handleTypeFilterChange = type => {
    setSelectedType(type);
  };

  const handleStatusFilterChange = status => {
    setSelectedStatus(status);
  };

  // 신고 상세보기 모달 열기
  const handleOpenDetailModal = report => {
    setDetailModal({visible: true, report});
  };

  // 신고 상세보기 모달 닫기
  const handleCloseDetailModal = () => {
    setDetailModal({visible: false, report: null});
  };

  // 경고 발송
  const handleSendWarning = async report => {
    Alert.alert(
      '경고 발송',
      `${report.reported} 회원에게 경고를 발송하시겠습니까?`,
      [
        {text: '취소', style: 'cancel'},
        {
          text: '발송',
          onPress: async () => {
            try {
              // TODO: 실제 API 연동 (주석 해제)
              // await sendWarning(report.id, {
              //   userId: report.reportedUserId,
              //   reason: report.description,
              // });

              Alert.alert('완료', '경고가 발송되었습니다.');
              loadReports();
            } catch (error) {
              console.error('경고 발송 실패:', error);
              Alert.alert('오류', '경고 발송에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  // 계정 정지 (기간 선택 모달 열기)
  const handleSuspendUser = report => {
    setSelectedReport(report);
    setShowDurationModal(true);
  };

  // 기간 선택 후 계정 정지
  const handleSuspendWithDuration = async duration => {
    if (!selectedReport) return;

    const durationText =
      duration === 'permanent' ? '영구 정지' : `${duration}일 정지`;

    Alert.alert(
      '계정 정지',
      `${selectedReport.reported} 회원을 ${durationText}하시겠습니까?`,
      [
        {text: '취소', style: 'cancel'},
        {
          text: '정지',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: 실제 API 연동 (주석 해제)
              // await suspendUserByReport(selectedReport.id, {
              //   userId: selectedReport.reportedUserId,
              //   duration: duration === 'permanent' ? 999999 : duration,
              //   reason: selectedReport.description,
              // });

              Alert.alert('완료', `계정이 ${durationText}되었습니다.`);
              setSelectedReport(null);
              loadReports();
            } catch (error) {
              console.error('계정 정지 실패:', error);
              Alert.alert('오류', '계정 정지에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  // 신고 유형 한글 변환
  const getTypeLabel = type => {
    switch (type) {
      case 'noshow':
        return '노쇼';
      case 'abuse':
        return '욕설';
      case 'fake':
        return '허위';
      default:
        return '기타';
    }
  };

  // 상태 한글 변환
  const getStatusLabel = status => {
    return status === 'pending' ? '미처리' : '처리완료';
  };

  // 출처 한글 변환
  const getSourceLabel = source => {
    return source === 'recipe_board' ? '레시피 게시판' : '같이 장보기';
  };

  // 드롭다운 라벨 가져오기
  const getReportTypeLabel = value => {
    switch (value) {
      case 'all':
        return '전체';
      case 'post':
        return '게시물';
      case 'user':
        return '사용자';
      default:
        return '대상';
    }
  };

  const getTypeFilterLabel = value => {
    switch (value) {
      case 'all':
        return '전체';
      case 'noshow':
        return '노쇼';
      case 'abuse':
        return '욕설';
      case 'fake':
        return '허위';
      default:
        return '유형';
    }
  };

  const getStatusFilterLabel = value => {
    switch (value) {
      case 'all':
        return '전체';
      case 'pending':
        return '미처리';
      case 'resolved':
        return '처리완료';
      default:
        return '상태';
    }
  };

  // 커스텀 드롭다운 컴포넌트
  const CustomDropdown = ({
    value,
    placeholder,
    options,
    onSelect,
    visible,
    onToggle,
  }) => (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={onToggle}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.dropdownButtonText,
            !value && styles.dropdownPlaceholder,
          ]}>
          {value ? options.find(o => o.value === value)?.label : placeholder}
        </Text>
        <ChevronDown size={16} color="#4a5565" />
      </TouchableOpacity>

      {visible && (
        <View style={styles.dropdownMenu}>
          {options.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dropdownItem,
                value === option.value && styles.dropdownItemActive,
              ]}
              onPress={() => {
                onSelect(option.value);
                onToggle();
              }}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.dropdownItemText,
                  value === option.value && styles.dropdownItemTextActive,
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // 드롭다운 옵션 데이터
  const reportTypeOptions = [
    {label: '대상: 전체', value: 'all'},
    {label: '대상: 게시물', value: 'post'},
    {label: '대상: 사용자', value: 'user'},
  ];

  const typeOptions = [
    {label: '유형: 전체', value: 'all'},
    {label: '유형: 노쇼', value: 'noshow'},
    {label: '유형: 욕설', value: 'abuse'},
    {label: '유형: 허위', value: 'fake'},
  ];

  const statusOptions = [
    {label: '상태: 전체', value: 'all'},
    {label: '상태: 미처리', value: 'pending'},
    {label: '상태: 처리완료', value: 'resolved'},
  ];

  // 신고 카드 렌더링
  const ReportCard = ({report}) => {
    const typeColors = {
      noshow: {bg: '#ffedd4', text: '#ca3500'},
      abuse: {bg: '#ffe2e2', text: '#c10007'},
      fake: {bg: '#f3e8ff', text: '#8200db'},
    };

    const statusColors = {
      pending: {bg: '#fef9c2', text: '#a65f00'},
      resolved: {bg: '#dcfce7', text: '#008236'},
    };

    const sourceColors = {
      recipe_board: {bg: '#dbeafe', text: '#1e40af'},
      shopping_together: {bg: '#fce7f3', text: '#9f1239'},
    };

    const typeColor = typeColors[report.type] || typeColors.noshow;
    const statusColor = statusColors[report.status] || statusColors.pending;
    const sourceColor =
      sourceColors[report.source] || sourceColors.recipe_board;

    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => handleOpenDetailModal(report)}
        activeOpacity={0.7}>
        {/* 상단: 유형, 상태, 출처, 날짜 */}
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, {backgroundColor: typeColor.bg}]}>
              <Text style={[styles.badgeText, {color: typeColor.text}]}>
                {getTypeLabel(report.type)}
              </Text>
            </View>
            <View style={[styles.badge, {backgroundColor: statusColor.bg}]}>
              <Text style={[styles.badgeText, {color: statusColor.text}]}>
                {getStatusLabel(report.status)}
              </Text>
            </View>
            <View style={[styles.badge, {backgroundColor: sourceColor.bg}]}>
              <Text style={[styles.badgeText, {color: sourceColor.text}]}>
                {getSourceLabel(report.source)}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>{report.date}</Text>
        </View>

        {/* 중간: 신고자 → 피신고자 */}
        <View style={styles.cardContent}>
          <View style={styles.userRow}>
            <Text style={styles.labelText}>신고자:</Text>
            <Text style={styles.reporterText}>{report.reporter}</Text>
            <Text style={styles.arrowText}>→</Text>
            <Text style={styles.labelText}>피신고자:</Text>
            <Text style={styles.reportedText}>{report.reported}</Text>
          </View>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </View>

        {/* 하단: 액션 버튼 */}
        {report.status === 'pending' && (
          <View style={styles.actionButtons}>
            {/* 경고 발송 버튼 */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSendWarning(report)}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#FAD15D', '#D09E10']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                angle={104.04}
                style={styles.gradientButton}>
                <Text style={styles.actionButtonText}>경고 발송</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 계정 정지 버튼 */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSuspendUser(report)}
              activeOpacity={0.8}>
              <LinearGradient
                colors={['#ED6F75', '#F60000']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                angle={166.1}
                style={styles.gradientButton}>
                <Text style={styles.actionButtonText}>계정 정지</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>신고 관리</Text>
      </View>

      {/* 검색 및 필터 영역 */}
      <View style={styles.searchSection}>
        {/* 검색 바 */}
        <View style={styles.searchBar}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="신고자 또는 피신고자 검색"
            placeholderTextColor="rgba(10, 10, 10, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>

        {/* 필터 드롭다운 */}
        <View style={styles.filterDropdownRow}>
          <CustomDropdown
            value={selectedReportType}
            placeholder="대상"
            options={reportTypeOptions}
            onSelect={handleReportTypeFilterChange}
            visible={showReportTypeDropdown}
            onToggle={() => {
              setShowReportTypeDropdown(!showReportTypeDropdown);
              setShowTypeDropdown(false);
              setShowStatusDropdown(false);
            }}
          />

          <CustomDropdown
            value={selectedType}
            placeholder="유형"
            options={typeOptions}
            onSelect={handleTypeFilterChange}
            visible={showTypeDropdown}
            onToggle={() => {
              setShowTypeDropdown(!showTypeDropdown);
              setShowReportTypeDropdown(false);
              setShowStatusDropdown(false);
            }}
          />

          <CustomDropdown
            value={selectedStatus}
            placeholder="상태"
            options={statusOptions}
            onSelect={handleStatusFilterChange}
            visible={showStatusDropdown}
            onToggle={() => {
              setShowStatusDropdown(!showStatusDropdown);
              setShowReportTypeDropdown(false);
              setShowTypeDropdown(false);
            }}
          />
        </View>
      </View>

      {/* 신고 리스트 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : reports.length > 0 ? (
          reports.map(report => <ReportCard key={report.id} report={report} />)
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>신고 내역이 없습니다.</Text>
          </View>
        )}
      </ScrollView>

      {/* 정지 기간 선택 모달 */}
      <SuspendDurationModal
        visible={showDurationModal}
        userName={selectedReport?.reported}
        onClose={() => {
          setShowDurationModal(false);
          setSelectedReport(null);
        }}
        onSelect={handleSuspendWithDuration}
      />

      {/* 신고 상세보기 모달 */}
      <ReportDetailModal
        visible={detailModal.visible}
        report={detailModal.report}
        onClose={handleCloseDetailModal}
        getTypeLabel={getTypeLabel}
        getStatusLabel={getStatusLabel}
        getSourceLabel={getSourceLabel}
      />
    </View>
  );
}
