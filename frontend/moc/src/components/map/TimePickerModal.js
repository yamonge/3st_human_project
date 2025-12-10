import React, {useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Modal} from 'react-native';
import {X, Clock} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../../styles/components/map/TimePickerModalStyles';
import {colors} from '../../styles/common';

/**
 * 시간 선택 모달
 * - 날짜 선택 (오늘, 내일, 이번 주)
 * - 오전/오후 선택
 * - 시간 선택 (1~12)
 * - 분 선택 (00, 05, 10, ..., 55)
 */
export default function TimePickerModal({visible, onClose, onConfirm}) {
  // 날짜 옵션
  const dateOptions = [
    {id: 'today', label: '오늘'},
    {id: 'tomorrow', label: '내일'},
    {id: 'dec2', label: '12월 2일 (화)'},
    {id: 'dec3', label: '12월 3일 (수)'},
    {id: 'dec4', label: '12월 4일 (목)'},
    {id: 'dec5', label: '12월 5일 (금)'},
    {id: 'dec6', label: '12월 6일 (토)'},
    {id: 'dec7', label: '12월 7일 (일)'},
    {id: 'dec8', label: '12월 8일 (월)'},
  ];

  // 시간 (1~12)
  const hours = Array.from({length: 12}, (_, i) => i + 1);

  // 분 (0, 5, 10, ..., 55)
  const minutes = Array.from({length: 12}, (_, i) => i * 5);

  // 선택된 값
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedPeriod, setSelectedPeriod] = useState('pm'); // am or pm
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);

  /**
   * 선택된 시간 텍스트
   */
  const getSelectedTimeText = () => {
    const dateLabel = dateOptions.find(d => d.id === selectedDate)?.label;
    const periodLabel = selectedPeriod === 'am' ? '오전' : '오후';
    const minuteText = selectedMinute.toString().padStart(2, '0');
    return `${dateLabel} ${periodLabel} ${selectedHour}:${minuteText}`;
  };

  /**
   * 확인 버튼
   */
  const handleConfirm = () => {
    const timeData = {
      date: selectedDate,
      period: selectedPeriod,
      hour: selectedHour,
      minute: selectedMinute,
      text: getSelectedTimeText(),
    };
    console.log('[시간 선택 완료]', timeData);
    onConfirm(timeData);
    onClose();
  };

  /**
   * 취소 버튼
   */
  const handleCancel = () => {
    console.log('[시간 선택 취소]');
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      {/* 배경 터치 영역 */}
      <TouchableOpacity
        style={styles.background}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* 모달 컨텐츠 */}
      <View style={styles.modalContainer}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Clock size={24} color={colors.textBlack} strokeWidth={2} />
            <Text style={styles.headerTitle}>만날 시간 선택</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <X size={24} color={colors.textBlack} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* 스크롤 컨텐츠 */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}>
          {/* 날짜 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>날짜</Text>
            <View style={styles.dateGrid}>
              {dateOptions.map(date => {
                const isSelected = selectedDate === date.id;
                return (
                  <TouchableOpacity
                    key={date.id}
                    style={[
                      styles.dateButton,
                      isSelected && styles.dateButtonSelected,
                    ]}
                    onPress={() => setSelectedDate(date.id)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.dateButtonText,
                        isSelected && styles.dateButtonTextSelected,
                      ]}>
                      {date.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 오전/오후 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>시간</Text>
            <View style={styles.periodRow}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === 'am' && styles.periodButtonSelected,
                ]}
                onPress={() => setSelectedPeriod('am')}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === 'am' && styles.periodButtonTextSelected,
                  ]}>
                  오전
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === 'pm' && styles.periodButtonSelected,
                ]}
                onPress={() => setSelectedPeriod('pm')}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === 'pm' && styles.periodButtonTextSelected,
                  ]}>
                  오후
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 시 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>시</Text>
            <View style={styles.timeGrid}>
              {hours.map(hour => {
                const isSelected = selectedHour === hour;
                return (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.timeButton,
                      isSelected && styles.timeButtonSelected,
                    ]}
                    onPress={() => setSelectedHour(hour)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.timeButtonText,
                        isSelected && styles.timeButtonTextSelected,
                      ]}>
                      {hour}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 분 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>분</Text>
            <View style={styles.timeGrid}>
              {minutes.map(minute => {
                const isSelected = selectedMinute === minute;
                return (
                  <TouchableOpacity
                    key={minute}
                    style={[
                      styles.timeButton,
                      isSelected && styles.timeButtonSelected,
                    ]}
                    onPress={() => setSelectedMinute(minute)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.timeButtonText,
                        isSelected && styles.timeButtonTextSelected,
                      ]}>
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 선택된 시간 표시 */}
          <View style={styles.selectedTimeContainer}>
            <Text style={styles.selectedTimeLabel}>선택된 시간</Text>
            <Text style={styles.selectedTimeText}>{getSelectedTimeText()}</Text>
          </View>
        </ScrollView>

        {/* 푸터 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButtonWrapper}
            onPress={handleConfirm}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#00B8DB', '#155DFC']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>확인</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
