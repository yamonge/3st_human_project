import React, {useState} from 'react';
import {View, Text, Modal, TouchableOpacity, StyleSheet} from 'react-native';
import WheelPicker from 'react-native-wheely';
import {X} from 'lucide-react-native';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../../styles/common';

/**
 * 생년월일 선택 모달 (Bottom Sheet)
 *
 * @param {boolean} visible - 모달 표시 여부
 * @param {function} onClose - 닫기 버튼 클릭 시 호출되는 함수
 * @param {function} onConfirm - 완료 버튼 클릭 시 호출되는 함수 (선택된 날짜 전달)
 * @param {Date} initialDate - 초기 날짜 (선택사항)
 */
export default function DatePickerModal({
  visible,
  onClose,
  onConfirm,
  initialDate,
}) {
  // 현재 날짜 또는 초기 날짜
  const now = initialDate || new Date();

  // 년도 목록 생성 (1926년 ~ 현재년도)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 1926; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse(); // 최신년도가 위로
  };

  const yearOptions = generateYears();
  const monthOptions = Array.from({length: 12}, (_, i) => i + 1);

  // 일 목록 (선택된 년/월에 따라 동적 생성)
  const getDaysInMonth = (year, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({length: daysInMonth}, (_, i) => i + 1);
  };

  // 선택된 년/월/일 인덱스
  const [selectedYearIndex, setSelectedYearIndex] = useState(
    yearOptions.indexOf(now.getFullYear()),
  );
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(now.getMonth());
  const [selectedDayIndex, setSelectedDayIndex] = useState(now.getDate() - 1);

  const selectedYear = yearOptions[selectedYearIndex];
  const selectedMonth = monthOptions[selectedMonthIndex];
  const dayOptions = getDaysInMonth(selectedYear, selectedMonth);

  // 완료 버튼 클릭
  const handleConfirm = () => {
    const selectedDay = dayOptions[selectedDayIndex];
    const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    onConfirm(selectedDate);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      {/* 배경 오버레이 */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        {/* Bottom Sheet */}
        <TouchableOpacity
          style={styles.bottomSheet}
          activeOpacity={1}
          onPress={e => e.stopPropagation()} // 클릭 이벤트 전파 방지
        >
          {/* 헤더 */}
          <View style={styles.header}>
            {/* 닫기 버튼 */}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textDark} />
            </TouchableOpacity>

            {/* 타이틀 */}
            <Text style={styles.title}>생년월일 선택</Text>

            {/* 완료 버튼 */}
            <TouchableOpacity
              onPress={handleConfirm}
              style={styles.confirmButton}>
              <Text style={styles.confirmText}>완료</Text>
            </TouchableOpacity>
          </View>

          {/* 휠 피커 영역 */}
          <View style={styles.pickerContainer}>
            {/* 년도 */}
            <View style={styles.pickerColumn}>
              <WheelPicker
                selectedIndex={selectedYearIndex}
                options={yearOptions.map(y => `${y}년`)}
                onChange={setSelectedYearIndex}
                itemHeight={40}
                containerStyle={styles.wheelContainer}
                itemTextStyle={styles.wheelText}
                selectedIndicatorStyle={styles.selectedIndicator}
              />
            </View>

            {/* 월 */}
            <View style={styles.pickerColumn}>
              <WheelPicker
                selectedIndex={selectedMonthIndex}
                options={monthOptions.map(m => `${m}월`)}
                onChange={setSelectedMonthIndex}
                itemHeight={40}
                containerStyle={styles.wheelContainer}
                itemTextStyle={styles.wheelText}
                selectedIndicatorStyle={styles.selectedIndicator}
              />
            </View>

            {/* 일 */}
            <View style={styles.pickerColumn}>
              <WheelPicker
                selectedIndex={selectedDayIndex}
                options={dayOptions.map(d => `${d}일`)}
                onChange={setSelectedDayIndex}
                itemHeight={40}
                containerStyle={styles.wheelContainer}
                itemTextStyle={styles.wheelText}
                selectedIndicatorStyle={styles.selectedIndicator}
              />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.blackOverlay,
    justifyContent: 'flex-end',
  },

  bottomSheet: {
    backgroundColor: colors.bgWhite,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingBottom: spacing.xl,
    ...shadows.cardLarge,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGray,
  },

  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    ...typography.subtitle,
    color: colors.textDark,
  },

  confirmButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmText: {
    ...typography.button,
    color: colors.primary,
  },

  pickerContainer: {
    flexDirection: 'row',
    height: 200,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },

  pickerColumn: {
    flex: 1,
  },

  wheelContainer: {
    flex: 1,
  },

  wheelText: {
    fontSize: 18,
    color: colors.textDark,
  },

  selectedIndicator: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: borderRadius.sm,
  },
});
