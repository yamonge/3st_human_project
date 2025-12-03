import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {ChevronRight} from 'lucide-react-native';
import {homeStyles} from '../../styles/homeStyles';
import {colors, spacing} from '../../styles/common';

/**
 * 메인 홈 화면의 메뉴 카드 컴포넌트
 * 4가지 타입: 냉장고털기, 레시피찾기, 레시피게시판, 같이장보기
 *
 * @param {string} type - 카드 타입 ('fridge', 'search', 'board', 'shopping')
 * @param {string} title - 카드 제목
 * @param {string} subtitle - 카드 부제목
 * @param {function} onPress - 카드 클릭 핸들러
 * @param {object} style - 추가 스타일
 */
export default function MenuCard({type, title, subtitle, onPress, style}) {
  // 타입별 설정
  const getCardConfig = () => {
    switch (type) {
      case 'fridge':
        return {
          cardStyle: homeStyles.fridgeCard,
          image: require('../../assets/images/main/fryingPan.svg'),
          imageStyle: homeStyles.fridgeImage,
          isDark: false,
        };
      case 'search':
        return {
          cardStyle: homeStyles.recipeSearchCard,
          image: require('../../assets/images/main/mice.svg'),
          imageStyle: homeStyles.recipeSearchImage,
          isDark: false,
        };
      case 'board':
        return {
          cardStyle: homeStyles.recipeBoardCard,
          image: require('../../assets/images/main/board.svg'),
          imageStyle: homeStyles.recipeBoardImage,
          isDark: false,
        };
      case 'shopping':
        return {
          cardStyle: homeStyles.shoppingCard,
          image: require('../../assets/images/main/shoppingCart.svg'),
          imageStyle: homeStyles.shoppingImage,
          isDark: true,
        };
      default:
        return {
          cardStyle: {},
          image: null,
          imageStyle: {},
          isDark: false,
        };
    }
  };

  const config = getCardConfig();

  return (
    <TouchableOpacity
      style={[homeStyles.menuCard, config.cardStyle, style]}
      onPress={onPress}
      activeOpacity={0.8}>
      {/* 화살표 아이콘 */}
      <View style={homeStyles.arrowIcon}>
        <ChevronRight
          size={16}
          color={config.isDark ? '#12175E' : colors.textWhite}
          strokeWidth={3}
        />
      </View>

      {/* 3D 이미지 (박스 밖으로 넘침) */}
      {config.image && (
        <Image
          source={config.image}
          style={[homeStyles.menuCard3DImage, config.imageStyle]}
        />
      )}

      {/* 텍스트 */}
      <View style={{zIndex: 1}}>
        <Text
          style={[
            homeStyles.menuCardTitle,
            config.isDark && homeStyles.menuCardTitleDark,
          ]}>
          {title}
        </Text>
        <Text
          style={[
            homeStyles.menuCardSubtitle,
            config.isDark && homeStyles.menuCardSubtitleDark,
          ]}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
