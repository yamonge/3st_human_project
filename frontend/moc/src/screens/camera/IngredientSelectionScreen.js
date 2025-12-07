import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import {ChevronLeft, ChevronRight, Check} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import {styles} from '../../../styles/screens/camera/ingredientSelectionStyles';

export default function IngredientSelectionScreen({route, navigation}) {
  const {ingredients = [], filters = {}} = route.params || {};

  // 각 재료의 선택 상태
  const [ingredientStates, setIngredientStates] = useState(
    ingredients.map((ingredient, index) => ({
      ...ingredient,
      checked: index < 3, // 처음 3개는 기본 선택
      usage: '전부 사용',
      amount: '중간',
    })),
  );

  // 체크박스 토글
  const toggleIngredient = id => {
    setIngredientStates(prev =>
      prev.map(item =>
        item.id === id ? {...item, checked: !item.checked} : item,
      ),
    );
  };

  // 사용량 선택 (일부/전부)
  const selectUsage = (id, usage) => {
    setIngredientStates(prev =>
      prev.map(item => (item.id === id ? {...item, usage} : item)),
    );
  };

  // 양 선택 (조금/중간/많이)
  const selectAmount = (id, amount) => {
    setIngredientStates(prev =>
      prev.map(item => (item.id === id ? {...item, amount} : item)),
    );
  };

  // 레시피 추천받기
  const handleRecommend = () => {
    const selectedIngredients = ingredientStates
      .filter(item => item.checked)
      .map(item => ({
        id: item.id,
        name: item.name,
        usage: item.usage,
        amount: item.amount,
      }));

    console.log('선택된 재료:', selectedIngredients);
    console.log('필터:', filters);
    // TODO: 레시피 추천 결과 화면으로 이동
    // navigation.navigate('RecipeResult', { ingredients: selectedIngredients, filters });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* 상단 헤더 */}
      <LinearGradient
        colors={['#00B8DB', '#155DFC']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('RecipeFilter', route.params)}>
            <ChevronLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>재료 선택</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      {/* 콘텐츠 영역 */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{paddingBottom: 250}}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          각 재료를 얼마나 사용할지 선택해주세요
        </Text>

        {/* 재료 카드 목록 */}
        {ingredientStates.map(ingredient => (
          <View
            key={ingredient.id}
            style={[
              styles.ingredientCard,
              ingredient.checked && styles.ingredientCardSelected,
            ]}>
            {/* 재료 헤더 (체크박스 + 이름) */}
            <TouchableOpacity
              style={styles.ingredientHeader}
              onPress={() => toggleIngredient(ingredient.id)}
              activeOpacity={0.7}>
              {ingredient.checked ? (
                <LinearGradient
                  colors={['#00B8DB', '#155DFC']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[styles.checkbox, styles.checkboxChecked]}>
                  <Check color="#FFFFFF" size={20} />
                </LinearGradient>
              ) : (
                <View style={[styles.checkbox, styles.checkboxUnchecked]} />
              )}
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
            </TouchableOpacity>

            {/* 사용량 선택 영역 (선택된 재료만 표시) */}
            {ingredient.checked && (
              <View style={styles.selectionArea}>
                {/* 일부/전부 사용 */}
                <View style={styles.usageRow}>
                  <TouchableOpacity
                    style={{flex: 1}}
                    onPress={() => selectUsage(ingredient.id, '일부 사용')}
                    activeOpacity={0.7}>
                    {ingredient.usage === '일부 사용' ? (
                      <LinearGradient
                        colors={['#00B8DB', '#155DFC']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={styles.optionButton}>
                        <Text
                          style={[
                            styles.optionButtonText,
                            styles.optionButtonTextSelected,
                          ]}>
                          일부 사용
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={[
                          styles.optionButton,
                          styles.optionButtonUnselected,
                        ]}>
                        <Text
                          style={[
                            styles.optionButtonText,
                            styles.optionButtonTextUnselected,
                          ]}>
                          일부 사용
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{flex: 1}}
                    onPress={() => selectUsage(ingredient.id, '전부 사용')}
                    activeOpacity={0.7}>
                    {ingredient.usage === '전부 사용' ? (
                      <LinearGradient
                        colors={['#00B8DB', '#155DFC']}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={styles.optionButton}>
                        <Text
                          style={[
                            styles.optionButtonText,
                            styles.optionButtonTextSelected,
                          ]}>
                          전부 사용
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={[
                          styles.optionButton,
                          styles.optionButtonUnselected,
                        ]}>
                        <Text
                          style={[
                            styles.optionButtonText,
                            styles.optionButtonTextUnselected,
                          ]}>
                          전부 사용
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* 조금/중간/많이 */}
                <View style={styles.amountRow}>
                  {['조금', '중간', '많이'].map(amount => (
                    <TouchableOpacity
                      key={amount}
                      style={{flex: 1}}
                      onPress={() => selectAmount(ingredient.id, amount)}
                      activeOpacity={0.7}>
                      {ingredient.amount === amount ? (
                        <LinearGradient
                          colors={['#00D084', '#00B86D']}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          style={styles.optionButton}>
                          <Text
                            style={[
                              styles.optionButtonText,
                              styles.optionButtonTextSelected,
                            ]}>
                            {amount}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View
                          style={[
                            styles.optionButton,
                            styles.optionButtonUnselected,
                          ]}>
                          <Text
                            style={[
                              styles.optionButtonText,
                              styles.optionButtonTextUnselected,
                            ]}>
                            {amount}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* 하단 레시피 추천받기 버튼 */}
      <View style={styles.bottomButtonContainer}>
        <LinearGradient
          colors={['#E879F9', '#C026D3']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.recommendButton}>
          <TouchableOpacity
            onPress={handleRecommend}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}>
            <Text style={styles.recommendButtonText}>레시피 추천받기</Text>
            <ChevronRight color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}
