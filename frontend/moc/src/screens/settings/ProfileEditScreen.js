import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import {ArrowLeft, Mail} from 'lucide-react-native';
import styles from '../../styles/screens/settings/ProfileEditStyles';
import {colors} from '../../styles/common';
import {getUserInfo, updateProfile} from '../../api/settings';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 사진 업로드 기능 제거 — 관련 컴포넌트 사용 안 함

/**
 * 프로필 수정 화면
 *
 * 구조:
 * - 상단 헤더: 뒤로가기 + "프로필 수정" 타이틀
 * - 프로필 사진 영역: 원형 아바타 + 카메라 버튼
 * - 입력 폼: 이름, 닉네임, 이메일(읽기전용)
 * - 하단 저장 버튼: 그라데이션 버튼
 */
export default function ProfileEditScreen({navigation, route}) {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    nickname: '',
    email: '',
  });

  useEffect(() => {
    loadProfileData();

    // 화면 진입 시 데이터 다시 로드 (수정 취소 시 원래 데이터로 복원)
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfileData();
    });

    return unsubscribe;
  }, [navigation]);

  // 프로필 데이터 로드
  const loadProfileData = async () => {
    try {
      setLoading(true);
      const data = await getUserInfo();
      setProfileData({
        name: data.name || '',
        nickname: data.nickname || '',
        email: data.email || '',
      });
    } catch (error) {
      console.error('프로필 데이터 로드 실패:', error);
      Alert.alert('오류', '프로필 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 사진 업로드 기능 제거 — 갤러리로 이동하지 않음

  // 프로필 저장
  const handleSaveProfile = async () => {
    // 유효성 검사
    if (!profileData.name.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }

    if (!profileData.nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      // API 호출
      await updateProfile({
        name: profileData.name,
        nickname: profileData.nickname,
      });

      // AsyncStorage 업데이트
      await AsyncStorage.setItem('userNickname', profileData.nickname);
      // profileImage handling removed

      Alert.alert('완료', '프로필이 수정되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.navigate('Settings'),
        },
      ]);
    } catch (error) {
      console.error('프로필 저장 실패:', error);
      Alert.alert('오류', '프로필 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.email) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Settings')}>
          <ArrowLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
      </View>

      {/* 스크롤 영역 */}
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}>
        {/* 프로필 사진 영역 제거 (사진 업로드 기능 없음) */}

        {/* 입력 폼 */}
        <View style={styles.formContainer}>
          {/* 이름 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>이름</Text>
            <TextInput
              style={styles.input}
              placeholder="홍길동"
              placeholderTextColor="rgba(10, 10, 10, 0.5)"
              value={profileData.name}
              onChangeText={text =>
                setProfileData({...profileData, name: text})
              }
              autoCapitalize="none"
            />
          </View>

          {/* 닉네임 */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>닉네임</Text>
            <TextInput
              style={styles.input}
              placeholder="길동이"
              placeholderTextColor="rgba(10, 10, 10, 0.5)"
              value={profileData.nickname}
              onChangeText={text =>
                setProfileData({...profileData, nickname: text})
              }
              autoCapitalize="none"
            />
          </View>

          {/* 이메일 (읽기 전용) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>이메일</Text>
            <View style={styles.emailInputContainer}>
              <TextInput
                style={[styles.input, styles.emailInput]}
                value={profileData.email}
                editable={false}
                placeholderTextColor={colors.textGray}
              />
              <View style={styles.emailIcon}>
                <Mail size={16} color={colors.textGray} strokeWidth={2} />
              </View>
            </View>
            <Text style={styles.emailHint}>이메일은 변경할 수 없습니다</Text>
          </View>
        </View>

        {/* 저장 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={loading}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#00B8DB', '#155DFC']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.saveButtonGradient}>
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>저장하기</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* 사진 업로드 관련 UI 제거 */}
    </View>
  );
}
