import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {ArrowLeft, ImageIcon} from 'lucide-react-native';
import styles from '../../styles/screens/admin/NoticeFormStyles';
import {colors} from '../../styles/common';
// import {createNotice, updateNotice, getNoticeDetail} from '../../api/admin';

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
  const selectedImage = route?.params?.selectedImage; // 갤러리에서 선택한 이미지
  const currentTitle = route?.params?.currentTitle; // 갤러리에서 복귀 시 제목
  const currentContent = route?.params?.currentContent; // 갤러리에서 복귀 시 내용
  const currentImage = route?.params?.currentImage; // 갤러리에서 복귀 시 기존 이미지

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  // 화면 포커스 시 초기화 및 로드
  useFocusEffect(
    useCallback(() => {
      console.log('🔍 NoticeFormScreen focused - params:', {
        mode,
        noticeId,
        selectedImage,
        currentTitle,
        currentContent,
        currentImage,
      });

      // 갤러리에서 복귀한 경우 (selectedImage가 있거나 current* 값이 있음)
      const isFromGallery = selectedImage || currentTitle !== undefined;

      if (isFromGallery) {
        // 갤러리에서 복귀 시 기존 입력값 복원
        if (currentTitle !== undefined) {
          setTitle(currentTitle);
        }
        if (currentContent !== undefined) {
          setContent(currentContent);
        }
        if (currentImage !== undefined) {
          setImageUri(currentImage);
        }

        // 새로 선택한 이미지 적용
        if (selectedImage) {
          setImageUri(selectedImage);
        }
      } else {
        // 갤러리에서 온 게 아닐 때
        if (mode === 'create') {
          // 작성 모드: 완전 초기화
          console.log('✨ 작성 모드 - 초기화');
          setTitle('');
          setContent('');
          setImageUri(null);
        } else if (mode === 'edit' && noticeId) {
          // 수정 모드: 데이터 로드
          console.log('✏️ 수정 모드 - 데이터 로드');
          loadNoticeDetail();
        }
      }
    }, [
      mode,
      noticeId,
      selectedImage,
      currentTitle,
      currentContent,
      currentImage,
    ]),
  );

  // 공지사항 상세 로드 (수정 모드)
  const loadNoticeDetail = async () => {
    try {
      setLoading(true);
      // const data = await getNoticeDetail(noticeId);
      // setTitle(data.title);
      // setContent(data.content);
      // setImageUri(data.imageUrl);

      // 임시 데이터 (API 연동 전)
      setTitle('서비스 이용약관 개정 안내');
      setContent('서비스 이용약관이 개정되었습니다.');
      setImageUri(null); // 원래 이미지로 초기화 (API 연동 시 data.imageUrl 사용)
    } catch (error) {
      console.error('공지사항 로드 실패:', error);
      Alert.alert('오류', '공지사항을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 이미지 선택 (GalleryScreen으로 이동)
  const handleSelectImage = () => {
    navigation.navigate('Gallery', {
      from: 'notice', // 공지사항 작성에서 왔음을 표시
      mode: mode, // 작성/수정 모드 전달
      noticeId: noticeId, // 수정 시 공지사항 ID 전달
      currentTitle: title, // 현재 입력된 제목
      currentContent: content, // 현재 입력된 내용
      currentImage: imageUri, // 현재 선택된 이미지
    });
  };

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
    if (title || content || imageUri) {
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

    try {
      setLoading(true);

      const formData = {
        title: title.trim(),
        content: content.trim(),
        imageUri: imageUri,
      };

      if (mode === 'create') {
        // await createNotice(formData);
        Alert.alert('성공', '공지사항이 작성되었습니다.', [
          {text: '확인', onPress: () => navigation.goBack()},
        ]);
      } else {
        // await updateNotice(noticeId, formData);
        Alert.alert('성공', '공지사항이 수정되었습니다.', [
          {text: '확인', onPress: () => navigation.goBack()},
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

        {/* 이미지 업로드 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>이미지</Text>
          <TouchableOpacity
            style={styles.imageUploadBox}
            onPress={handleSelectImage}
            activeOpacity={0.7}
            disabled={loading}>
            {imageUri ? (
              <Image source={{uri: imageUri}} style={styles.uploadedImage} />
            ) : (
              <>
                <ImageIcon size={32} color={colors.textLightGray} />
                <Text style={styles.uploadText}>이미지 업로드</Text>
                <Text style={styles.uploadSubText}>클릭하여 파일 선택</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

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
