import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {ArrowLeft} from 'lucide-react-native';
import styles from '../../styles/screens/admin/NoticeFormStyles';
import {colors} from '../../styles/common';
import {createNotice, updateNotice, getNoticeDetail} from '../../api/admin';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 공지사항 작성/수정 화면
 *
 * Props:
 * - route.params.mode: 'create' | 'edit'
 * - route.params.noticeId: 수정 시 공지사항 ID
 *
 * 구조:
 * - 상단 헤더: 뒤로가기 + "공지사항 작성" or "공지사항 수정"
 * - 입력 폼:
 *   - 제목 입력 필드
 *   - 내용 입력 필드 (멀티라인)
 *   - 이미지 업로드 영역 (점선 테두리)
 * - 하단 버튼:
 *   - 취소 버튼 (회색)
 *   - 작성 완료 / 수정 완료 버튼 (파란색)
 */
export default function NoticeFormScreen({navigation, route}) {
  const mode = route?.params?.mode || 'create'; // 'create' | 'edit'
  const noticeId = route?.params?.noticeId;
  // 이미지 업로드 제거 - 관련 route params 무시
  const currentTitle = route?.params?.currentTitle; // 갤러리에서 복귀 시 제목 (무시 가능)
  const currentContent = route?.params?.currentContent; // 갤러리에서 복귀 시 내용 (무시 가능)

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // imageUri removed
  const [loading, setLoading] = useState(false);
  const [isadmin, setIsadmin] = useState('N');
  // 화면 마운트시 관리자 여부 확인
  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('userType');
      setIsadmin(t || 'N');
    })();
  }, []);

  // 화면 포커스 시 초기화 및 로드
  useFocusEffect(
    useCallback(() => {
      console.log('🔍 NoticeFormScreen focused - params:', {mode, noticeId});

      // 갤러리에서의 이미지 핸들링 제거
      if (mode === 'create') {
        setTitle('');
        setContent('');
      } else if (mode === 'edit' && noticeId) {
        loadNoticeDetail();
      }
    }, [mode, noticeId, currentTitle, currentContent]),
  );

  // 공지사항 상세 로드 (수정 모드)
  const loadNoticeDetail = async () => {
    try {
      setLoading(true);
      const data = await getNoticeDetail(noticeId);
      setTitle(data.title);
      setContent(data.content);
      // imageUrl ignored (image upload removed)
    } catch (error) {
      console.error('공지사항 로드 실패:', error);
      Alert.alert('오류', '공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 이미지 업로드 제거 — 더 이상 Gallery로 이동하지 않음

  // 유효성 검사
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return false;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return false;
    }
    return true;
  };

  // 취소
  const handleCancel = () => {
    if (title || content) {
      Alert.alert('확인', '작성 중인 내용이 있습니다. 정말 취소하시겠습니까?', [
        {text: '계속 작성', style: 'cancel'},
        {
          text: '취소',
          onPress: () => navigation.navigate('NoticeManagement'),
          style: 'destructive',
        },
      ]);
    } else {
      navigation.navigate('NoticeManagement');
    }
  };

  // 작성/수정 완료
  const handleSubmit = async () => {
    if (!validateForm()) return;
    // 관리자 사용자 ID 확인
    if (isadmin === 'N') {
      Alert.alert('오류', '관리자가 아닙니다. 로그인 상태를 확인해주세요.');
      return;
    }
    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        content: content.trim(),
      };

      if (mode === 'create') {
        await createNotice(payload);
        Alert.alert('성공', '공지사항이 작성되었습니다.', [
          {
            text: '확인',
            onPress: () =>
              navigation.navigate('NoticeManagement', {refresh: Date.now()}),
          },
        ]);
      } else {
        await updateNotice(noticeId, payload);
        Alert.alert('성공', '공지사항이 수정되었습니다.', [
          {
            text: '확인',
            onPress: () =>
              navigation.navigate('NoticeManagement', {refresh: Date.now()}),
          },
        ]);
      }
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      Alert.alert(
        '오류',
        mode === 'create'
          ? '공지사항 작성에 실패했습니다.'
          : '공지사항 수정에 실패했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
          activeOpacity={0.7}>
          <ArrowLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === 'create' ? '공지사항 작성' : '공지사항 수정'}
        </Text>
      </View>

      {/* 스크롤 영역 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* 제목 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="공지사항 제목을 입력하세요"
            placeholderTextColor="rgba(10, 10, 10, 0.5)"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />
        </View>

        {/* 내용 입력 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>내용</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="공지사항 내용을 입력하세요"
            placeholderTextColor="rgba(10, 10, 10, 0.5)"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        {/* 이미지 업로드 UI 제거 */}

        {/* 하단 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.7}
            disabled={loading}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            activeOpacity={0.7}
            disabled={loading}>
            <Text style={styles.submitButtonText}>
              {mode === 'create' ? '작성 완료' : '수정 완료'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
