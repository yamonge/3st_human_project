import React, {useState, useEffect, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MenuCard from '../../components/mypage/MenuCard';
import styles from '../../styles/screens/mypage/ProfileScreenStyles';

/**
 * 마이페이지 메인 화면
 *
 * 구조:
 * - 상단: 프로필 영역 (사진, 닉네임, 이메일, 로그아웃)
 * - 하단: 6개 메뉴 카드 그리드 (2x3)
 */
export default function ProfileScreen({navigation}) {
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    email: '',
    profileImage: null,
  });

  const [menuCounts, setMenuCounts] = useState({
    ingredients: 6,
    savedRecipes: 8,
    sharedRecipes: 3,
    reviews: 4,
    reports: 0,
  });

  // ✅ 화면이 다시 보일 때(포커스될 때)마다 최신 값 재로딩
  useFocusEffect(
    useCallback(() => {
      loadUserInfo();
      // 메뉴카운트도 최신화가 필요하면 같이 호출
      // loadMenuCounts();
    }, []),
  );

  // 사용자 정보 로드
  const loadUserInfo = async () => {
    try {
      const nickname = await AsyncStorage.getItem('userNickname');
      const email = await AsyncStorage.getItem('userEmail');
      const profileImage = await AsyncStorage.getItem('profileImage');

      // ✅ 조건 걸지 말고 항상 set (이전 값이 남는 문제 방지)
      setUserInfo({
        nickname: nickname || '둘리',
        email: email || 'dooly@gmail.com',
        profileImage: profileImage,
      });
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    }
  };

  // 메뉴 카운트 로드 (추후 API 연동)
  const loadMenuCounts = async () => {
    // TODO: API 연동
    // const counts = await fetchMenuCounts();
    // setMenuCounts(counts);
  };

  // 로그아웃 처리
  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove([
              'accessToken',
              'refreshToken',
              'userNickname',
              'userEmail',
              'profileImage',
            ]);
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
          } catch (error) {
            console.error('로그아웃 실패:', error);
            Alert.alert('오류', '로그아웃에 실패했습니다.');
          }
        },
      },
    ]);
  };

  // 메뉴 카드 데이터
  const menuItems = [
    {
      id: 'ingredients',
      title: '재료 관리',
      count: menuCounts.ingredients,
      backgroundColor: 'rgba(94,119,174,0.25)',
      icon: 'clipboard',
      screen: 'IngredientManagement',
    },
    {
      id: 'savedRecipes',
      title: '저장된 게시글',
      count: menuCounts.savedRecipes,
      backgroundColor: 'rgba(127,201,231,0.25)',
      icon: 'star',
      screen: 'SavedRecipes',
    },
    {
      id: 'sharedRecipes',
      title: '공유한 게시글',
      count: menuCounts.sharedRecipes,
      backgroundColor: 'rgba(152,166,191,0.25)',
      icon: 'send',
      screen: 'SharedRecipes',
    },
    {
      id: 'reviews',
      title: '받은 후기 목록',
      count: menuCounts.reviews,
      backgroundColor: 'rgba(255,145,240,0.25)',
      icon: 'mail',
      screen: 'ReceivedReviews',
    },
    {
      id: 'reports',
      title: '신고 내역',
      count: menuCounts.reports,
      backgroundColor: '#f9e0e0',
      icon: 'alert-triangle',
      screen: 'ReportHistory',
    },
    {
      id: 'settings',
      title: '설정',
      count: '0', // 설정은 카운트 없음
      backgroundColor: '#e2e2e2',
      icon: 'settings',
      screen: 'Settings',
    },
  ];

  // 메뉴 카드 클릭 핸들러
  const handleMenuPress = item => {
    if (item.screen === 'IngredientManagement') {
      navigation.navigate('IngredientManagement');
    } else if (item.screen === 'ReceivedReviews') {
      navigation.navigate('ReceivedReviews');
    } else if (item.screen === 'SavedRecipes') {
      navigation.navigate('SavedRecipes');
    } else if (item.screen === 'SharedRecipes') {
      navigation.navigate('SharedRecipes');
    } else if (item.screen === 'ReportHistory') {
      navigation.navigate('ReportHistory');
    } else if (item.screen === 'Settings') {
      navigation.navigate('Settings');
    } else {
      // TODO: 다른 화면들 구현 후 연결
      Alert.alert('개발 중', `${item.title} 화면은 개발 중입니다.`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 프로필 영역 */}
        <View style={styles.profileSection}>
          {/* 프로필 이미지 */}
          <View style={styles.profileImageContainer}>
            {userInfo.profileImage ? (
              <Image
                source={{uri: userInfo.profileImage}}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>
                  {userInfo.nickname.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          {/* 닉네임 */}
          <Text style={styles.nickname}>{userInfo.nickname}</Text>

          {/* 이메일 */}
          <Text style={styles.email}>{userInfo.email}</Text>

          {/* 로그아웃 버튼 */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}>
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        {/* 메뉴 카드 그리드 */}
        <View style={styles.menuGrid}>
          {menuItems.map(item => (
            <View key={item.id} style={styles.menuCardWrapper}>
              <MenuCard
                title={item.title}
                count={item.count}
                backgroundColor={item.backgroundColor}
                icon={item.icon}
                onPress={() => handleMenuPress(item)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}