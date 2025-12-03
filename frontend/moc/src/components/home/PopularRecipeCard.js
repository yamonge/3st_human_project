import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {User, Clock, Heart} from 'lucide-react-native';
import {homeStyles} from '../../styles/homeStyles';
import {colors, spacing} from '../../styles/common';

/**
 * 인기 레시피 카드 컴포넌트
 *
 * @param {object} recipe - 레시피 데이터
 * @param {number} rank - 순위 (1, 2, 3...)
 * @param {function} onPress - 카드 클릭 핸들러
 * @param {function} onLike - 좋아요 클릭 핸들러
 */
export default function PopularRecipeCard({recipe, rank, onPress, onLike}) {
  // 순위 배지 이미지 (1위, 2위만 표시)
  const getRankBadge = () => {
    if (rank === 1) {
      return require('../../assets/images/main/1stBadge.svg');
    } else if (rank === 2) {
      return require('../../assets/images/main/2stBadge.svg');
    }
    return null;
  };

  const rankBadge = getRankBadge();

  // 난이도 색상
  const getDifficultyColor = () => {
    switch (recipe.difficulty) {
      case '하':
        return '#00A63E';
      case '중':
        return '#FF9500';
      case '상':
        return '#FF3B30';
      default:
        return colors.textLight;
    }
  };

  // 표시할 재료 (최대 3개)
  const displayIngredients = recipe.ingredients?.slice(0, 3) || [];
  const moreIngredientsCount = Math.max(
    0,
    (recipe.ingredients?.length || 0) - 3,
  );

  return (
    <TouchableOpacity
      style={homeStyles.popularRecipeCard}
      onPress={onPress}
      activeOpacity={0.8}>
      {/* 레시피 이미지 */}
      <Image
        source={{uri: recipe.imageUrl}}
        style={homeStyles.recipeImage}
        defaultSource={require('../../assets/images/noImage.svg')}
      />

      {/* 레시피 정보 */}
      <View style={homeStyles.recipeInfo}>
        {/* 순위 배지 */}
        {rankBadge && <Image source={rankBadge} style={homeStyles.rankBadge} />}

        {/* 제목 */}
        <Text style={homeStyles.recipeTitle} numberOfLines={1}>
          {recipe.title}
        </Text>

        {/* 작성자 */}
        <View style={homeStyles.recipeAuthor}>
          <User size={12} color={colors.textLight} />
          <Text style={homeStyles.recipeAuthorText} numberOfLines={1}>
            {recipe.author}
          </Text>
        </View>

        {/* 시간 & 난이도 */}
        <View style={homeStyles.recipeMetadata}>
          <View style={homeStyles.recipeTime}>
            <Clock size={12} color="#4A5565" />
            <Text style={homeStyles.recipeMetadataText}>
              {recipe.cookingTime}분
            </Text>
          </View>

          <View style={homeStyles.recipeDifficulty}>
            <Text style={homeStyles.recipeMetadataText}>난이도: </Text>
            <Text
              style={[
                homeStyles.difficultyText,
                {color: getDifficultyColor()},
              ]}>
              {recipe.difficulty}
            </Text>
          </View>
        </View>

        {/* 재료 태그 */}
        <View style={homeStyles.ingredientTags}>
          {displayIngredients.map((ingredient, index) => (
            <View key={index} style={homeStyles.ingredientTag}>
              <Text style={homeStyles.ingredientTagText}>{ingredient}</Text>
            </View>
          ))}
          {moreIngredientsCount > 0 && (
            <View
              style={[homeStyles.ingredientTag, homeStyles.moreIngredientsTag]}>
              <Text style={homeStyles.moreIngredientsText}>
                +{moreIngredientsCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* 좋아요 */}
      <View style={homeStyles.likeSection}>
        <TouchableOpacity
          style={homeStyles.likeButton}
          onPress={onLike}
          activeOpacity={0.7}>
          <Heart
            size={20}
            color={recipe.isLiked ? '#FF3B8E' : colors.textLight}
            fill={recipe.isLiked ? '#FF3B8E' : 'none'}
          />
        </TouchableOpacity>
        <Text style={homeStyles.likeCount}>
          {recipe.likeCount >= 1000 ? '999+' : recipe.likeCount}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
