import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {ArrowLeft, Search, CheckSquare, Square} from 'lucide-react-native';
import styles from '../../styles/screens/admin/UserManagementStyles';
import {colors} from '../../styles/common';
import {getUserList} from '../../api/admin';
import UserManagementModal from '../../components/admin/UserManagementModal';

/**
 * 회원 관리 화면
 *
 * 구조:
 * - 상단 헤더: 뒤로가기 + "회원 관리" 타이틀
 * - 검색 바: 이메일 또는 닉네임 검색
 * - 필터 탭: 전체, 활동중, 정지
 * - 회원 목록: 전체 선택 + 회원 카드 리스트
 *   - 체크박스, 이름, 닉네임, 가입일, 신고 횟수, 상태 배지
 */
export default function UserManagementScreen({navigation}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'active', 'suspended'
  const [selectedUsers, setSelectedUsers] = useState([]); // 선택된 회원 ID 배열
  const [selectAll, setSelectAll] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // 선택된 회원 (모달용)
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [selectedFilter]);

  // 회원 목록 로드
  const loadUsers = async () => {
    try {
      setLoading(true);

      // TODO: 실제 API 연동 (주석 해제)
      // const params = {
      //   status: selectedFilter === 'all' ? null : selectedFilter,
      //   search: searchQuery,
      // };
      // const response = await getUserList(params);
      // setUsers(response.users || []);

      // 임시 더미 데이터
      const dummyUsers = [
        {
          id: 1,
          name: '홍길동',
          nickname: '길동이',
          email: 'hong@example.com',
          joinDate: '2024.11.20',
          reportCount: 0,
          status: 'active',
        },
        {
          id: 2,
          name: '김철수',
          nickname: '철수',
          email: 'kim@example.com',
          joinDate: '2024.11.18',
          reportCount: 2,
          status: 'active',
        },
        {
          id: 3,
          name: '이영희',
          nickname: '영희',
          email: 'lee@example.com',
          joinDate: '2024.11.15',
          reportCount: 5,
          status: 'suspended',
        },
        {
          id: 4,
          name: '박민수',
          nickname: '민수야',
          email: 'park@example.com',
          joinDate: '2024.11.10',
          reportCount: 1,
          status: 'active',
        },
        {
          id: 5,
          name: '최지우',
          nickname: '지우짱',
          email: 'choi@example.com',
          joinDate: '2024.11.08',
          reportCount: 0,
          status: 'active',
        },
        {
          id: 6,
          name: '정수민',
          nickname: '수민',
          email: 'jung@example.com',
          joinDate: '2024.11.05',
          reportCount: 3,
          status: 'suspended',
        },
        {
          id: 7,
          name: '강태양',
          nickname: '태양',
          email: 'kang@example.com',
          joinDate: '2024.11.01',
          reportCount: 0,
          status: 'active',
        },
        {
          id: 8,
          name: '윤서연',
          nickname: '서연이',
          email: 'yoon@example.com',
          joinDate: '2024.10.28',
          reportCount: 1,
          status: 'active',
        },
      ];

      // 필터 적용
      let filteredUsers = dummyUsers;
      if (selectedFilter !== 'all') {
        filteredUsers = dummyUsers.filter(
          user => user.status === selectedFilter,
        );
      }

      // 검색 적용
      if (searchQuery.trim()) {
        filteredUsers = filteredUsers.filter(
          user =>
            user.name.includes(searchQuery) ||
            user.nickname.includes(searchQuery) ||
            user.email.includes(searchQuery),
        );
      }

      setUsers(filteredUsers);
    } catch (error) {
      console.error('회원 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 검색
  const handleSearch = () => {
    loadUsers();
  };

  // 필터 변경
  const handleFilterChange = filter => {
    setSelectedFilter(filter);
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  // 개별 선택/해제
  const handleSelectUser = userId => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      setSelectAll(false);
    } else {
      const newSelected = [...selectedUsers, userId];
      setSelectedUsers(newSelected);
      if (newSelected.length === users.length) {
        setSelectAll(true);
      }
    }
  };

  // 회원 카드 클릭 (모달 열기)
  const handleUserPress = user => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  // 회원 정보 업데이트
  const handleUpdateUser = () => {
    loadUsers();
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

  // 상태 배지 렌더링
  const StatusBadge = ({status}) => {
    const isActive = status === 'active';
    return (
      <View
        style={[
          styles.statusBadge,
          isActive ? styles.statusBadgeActive : styles.statusBadgeSuspended,
        ]}>
        <Text
          style={[
            styles.statusBadgeText,
            isActive
              ? styles.statusBadgeTextActive
              : styles.statusBadgeTextSuspended,
          ]}>
          {isActive ? '활동중' : '정지'}
        </Text>
      </View>
    );
  };

  // 회원 카드 렌더링
  const UserCard = ({user}) => {
    const isSelected = selectedUsers.includes(user.id);
    const CheckIcon = isSelected ? CheckSquare : Square;

    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => handleUserPress(user)}
        activeOpacity={0.7}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={e => {
            e.stopPropagation();
            handleSelectUser(user.id);
          }}
          activeOpacity={0.7}>
          <CheckIcon
            size={16}
            color={isSelected ? colors.primary : '#9ca3af'}
          />
        </TouchableOpacity>

        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userNickname}>@{user.nickname}</Text>
          </View>
          <View style={styles.userMetaRow}>
            <Text style={styles.userJoinDate}>가입일: {user.joinDate}</Text>
            {user.reportCount > 0 && (
              <Text style={styles.userReportCount}>
                신고 {user.reportCount}회
              </Text>
            )}
          </View>
        </View>

        <StatusBadge status={user.status} />
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
        <Text style={styles.headerTitle}>회원 관리</Text>
      </View>

      {/* 검색 및 필터 영역 */}
      <View style={styles.searchSection}>
        {/* 검색 바 */}
        <View style={styles.searchBar}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="이메일 또는 닉네임 검색"
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
          <FilterButton label="활동중" value="active" />
          <FilterButton label="정지" value="suspended" />
        </View>
      </View>

      {/* 회원 목록 */}
      <View style={styles.listContainer}>
        {/* 전체 선택 헤더 */}
        <View style={styles.selectAllHeader}>
          <TouchableOpacity
            style={styles.selectAllButton}
            onPress={handleSelectAll}
            activeOpacity={0.7}>
            {selectAll ? (
              <CheckSquare size={16} color={colors.primary} />
            ) : (
              <Square size={16} color="#9ca3af" />
            )}
            <Text style={styles.selectAllText}>전체 선택</Text>
          </TouchableOpacity>
        </View>

        {/* 회원 리스트 */}
        <ScrollView
          style={styles.userList}
          contentContainerStyle={styles.userListContent}
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : users.length > 0 ? (
            users.map(user => <UserCard key={user.id} user={user} />)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>회원이 없습니다.</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* 회원 관리 모달 */}
      <UserManagementModal
        visible={modalVisible}
        user={selectedUser}
        onClose={handleCloseModal}
        onUpdate={handleUpdateUser}
      />
    </View>
  );
}
