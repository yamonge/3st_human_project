import React, {useState} from 'react';
import {View, Text, TouchableOpacity, TextInput, Platform} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Portal} from '@gorhom/portal';
import {AlertTriangle, X} from 'lucide-react-native';
import styles from '../../styles/components/ReportModalStyles';

const ReportModal = ({visible, onClose, reportTarget, onSubmit}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [detailContent, setDetailContent] = useState('');

  const reportReasons = [
    {id: 'PROFANITY', label: '욕설 또는 혐오 발언'},
    {id: 'INAPPROPRIATE_BEHAVIOR', label: '부적절한 행동'},
    {id: 'FRAUD', label: '사기 또는 금전 요구'},
    {id: 'NO_SHOW', label: '약속 불이행'},
    {id: 'FAKE_PROFILE', label: '허위 프로필'},
    {id: 'OTHER', label: '기타'},
  ];

  const handleSubmit = async () => {
    if (!selectedReason) {
      if (Platform.OS === 'web') {
        window.alert('신고 사유를 선택해주세요');
      } else {
        const {Alert} = require('react-native');
        Alert.alert('알림', '신고 사유를 선택해주세요');
      }
      return;
    }

    if (onSubmit) {
      await onSubmit({
        reason: selectedReason,
        detail: detailContent.trim(),
      });
    }

    // 초기화
    setSelectedReason('');
    setDetailContent('');
    onClose();
  };

  const handleCancel = () => {
    setSelectedReason('');
    setDetailContent('');
    onClose();
  };

  if (!visible) return null;

  return (
    <Portal>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleCancel}>
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={e => e.stopPropagation()}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <AlertTriangle size={24} color="#EF4444" />
              <Text style={styles.headerTitle}>사용자 신고</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCancel}
              activeOpacity={0.7}>
              <X size={24} color="#171717" />
            </TouchableOpacity>
          </View>

          {/* 콘텐츠 */}
          <KeyboardAwareScrollView
            style={styles.content}
            contentContainerStyle={{paddingBottom: 20}}
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
            extraScrollHeight={100}>
            {/* 신고 대상 */}
            <View style={styles.targetSection}>
              <Text style={styles.targetLabel}>신고 대상</Text>
              <Text style={styles.targetName}>
                {reportTarget?.nickname || reportTarget?.name || '알 수 없음'}
              </Text>
            </View>

            {/* 신고 사유 */}
            <View style={styles.reasonSection}>
              <View style={styles.reasonHeader}>
                <Text style={styles.reasonTitle}>신고 사유</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <View style={styles.reasonList}>
                {reportReasons.map(reason => (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.reasonButton,
                      selectedReason === reason.id &&
                        styles.reasonButtonSelected,
                    ]}
                    onPress={() => setSelectedReason(reason.id)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.reasonButtonText,
                        selectedReason === reason.id &&
                          styles.reasonButtonTextSelected,
                      ]}>
                      {reason.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 상세 내용 */}
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>상세 내용 (선택)</Text>
              <TextInput
                style={styles.detailInput}
                placeholder="추가로 전달하고 싶은 내용을 입력해주세요"
                placeholderTextColor="rgba(23, 23, 23, 0.5)"
                value={detailContent}
                onChangeText={setDetailContent}
                multiline
                maxLength={200}
                textAlignVertical="top"
              />
            </View>

            {/* 경고 문구 */}
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                허위 신고 시 서비스 이용이 제한될 수 있습니다. 신고 내용은 검토
                후 처리됩니다.
              </Text>
            </View>
          </KeyboardAwareScrollView>

          {/* 하단 버튼 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.7}>
              <Text style={styles.submitButtonText}>신고하기</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Portal>
  );
};

export default ReportModal;
