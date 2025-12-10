import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import {X, Clock} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import {Portal} from '@gorhom/portal';
import styles from '../../styles/components/map/PostFilterModalStyles';
import {colors} from '../../styles/common';

/**
 * 게시물 필터 모달
 * - 재료 선택 (다중 선택)
 * - 인원수 슬라이더 (2~10명)
 * - 만날 시간 선택 (추후 구현)
 */
export default function PostFilterModal({visible, onClose, onApply}) {
  console.log('[PostFilterModal] visible:', visible);

  // 필터 상태
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [peopleCount, setPeopleCount] = useState(2);
  const [selectedTime, setSelectedTime] = useState(null); // TODO: 시간 선택 기능 추가

  // 재료 목록
  const ingredients = [
    {id: 'meat', label: '🥩 육류'},
    {id: 'dairy', label: '🥛 유제품'},
    {id: 'vegetable', label: '🥬 채소'},
    {id: 'fruit', label: '🍎 과일'},
    {id: 'snack', label: '🍫 간식'},
    {id: 'icecream', label: '🍦 아이스크림'},
  ];

  /**
   * 재료 선택/해제
   */
  const toggleIngredient = id => {
    if (selectedIngredients.includes(id)) {
      setSelectedIngredients(selectedIngredients.filter(item => item !== id));
    } else {
      setSelectedIngredients([...selectedIngredients, id]);
    }
  };

  /**
   * 초기화
   */
  const handleReset = () => {
    setSelectedIngredients([]);
    setPeopleCount(2);
    setSelectedTime(null);
  };

  /**
   * 적용하기
   */
  const handleApply = () => {
    const filters = {
      ingredients: selectedIngredients,
      peopleCount: peopleCount,
      time: selectedTime,
    };
    console.log('[필터 적용]', filters);
    onApply(filters);
    onClose();
  };

  /**
   * 만날 시간 선택 (추후 구현)
   */
  const handleTimePress = () => {
    console.log('[시간 선택 모달 열기] - TODO');
    // TODO: 시간 선택 모달 구현
  };

  if (!visible) return null;

  return (
    <Portal>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}>
        <TouchableOpacity
          style={{flex: 1}}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>게시물 필터</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <X size={24} color={colors.textBlack} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>재료</Text>
              <View style={styles.ingredientGrid}>
                {ingredients.map(ingredient => {
                  const isSelected = selectedIngredients.includes(
                    ingredient.id,
                  );
                  return (
                    <TouchableOpacity
                      key={ingredient.id}
                      style={[
                        styles.ingredientButton,
                        isSelected && styles.ingredientButtonSelected,
                      ]}
                      onPress={() => toggleIngredient(ingredient.id)}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.ingredientText,
                          isSelected && styles.ingredientTextSelected,
                        ]}>
                        {ingredient.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>인원수: {peopleCount}명</Text>
              <Slider
                style={styles.slider}
                minimumValue={2}
                maximumValue={10}
                step={1}
                value={peopleCount}
                onValueChange={setPeopleCount}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.borderGray}
                thumbTintColor={colors.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>2명</Text>
                <Text style={styles.sliderLabel}>10명</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>만날 시간</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={handleTimePress}
                activeOpacity={0.7}>
                <Clock size={20} color={colors.textLight} strokeWidth={2} />
                <Text style={styles.timeButtonText}>
                  {selectedTime || '시간 선택'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}>
              <Text style={styles.resetButtonText}>초기화</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}>
              <Text style={styles.applyButtonText}>적용하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Portal>
  );
}
