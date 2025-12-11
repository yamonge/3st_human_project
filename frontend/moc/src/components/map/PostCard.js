import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {
  Clock,
  Users,
  ShoppingCart,
  User,
  ChevronDown,
  ChevronUp,
  MapPin,
} from 'lucide-react-native';
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';
import styles from '../../styles/components/map/PostCardStyles';
import {colors} from '../../styles/common';

/**
 * 게시물 카드 컴포넌트
 * - 축소 상태: 기본 정보 + "상세보기" 버튼
 * - 확장 상태: 기본 정보 + "접기" 버튼 + 상세 내용 + "참여하기" 버튼
 */
export default function PostCard({post, onJoin}) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleJoin = () => {
    if (onJoin) {
      onJoin(post);
    }
  };

  // createdAt으로 자동 계산
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <View style={styles.card}>
      {/* 카드 내용 */}
      <View style={styles.cardContent}>
        {/* 상단 헤더 (마트명 + 거리) */}
        <View style={styles.cardHeader}>
          <View style={styles.leftSection}>
            <Text style={styles.storeName}>{post.storeName}</Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
          <View style={styles.distanceContainer}>
            <MapPin size={14} color={colors.textGray} />
            <Text style={styles.distanceText}>{post.distance}</Text>
          </View>
        </View>

        {/* 정보 그리드 */}
        <View style={styles.infoGrid}>
          {/* 1행: 시간 + 인원수 */}
          <View style={{flexDirection: 'row', gap: 12}}>
            {/* 시간 */}
            <View style={{flex: 1, flexDirection: 'row', gap: 8}}>
              <View style={styles.iconBox}>
                <Clock size={16} color={colors.textGray} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>시간</Text>
                <Text style={styles.infoValue}>{post.meetTime}</Text>
              </View>
            </View>

            {/* 인원수 */}
            <View style={{flex: 1, flexDirection: 'row', gap: 8}}>
              <View style={styles.iconBox}>
                <Users size={16} color={colors.textGray} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>인원수</Text>
                <Text style={styles.infoValue}>
                  {post.currentCount}/{post.maxCount}명
                </Text>
              </View>
            </View>
          </View>

          {/* 2행: 구매 항목 */}
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <ShoppingCart size={16} color={colors.textGray} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>구매 항목</Text>
              <Text style={styles.infoValue}>{post.items}</Text>
            </View>
          </View>

          {/* 3행: 작성자 */}
          <View style={styles.infoRow}>
            <View style={styles.iconBox}>
              <User size={16} color={colors.textGray} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>작성자</Text>
              <Text style={styles.infoValue}>{post.author}</Text>
            </View>
          </View>
        </View>

        {/* 상세보기/접기 버튼 */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleExpand}
          activeOpacity={0.8}>
          <Text style={styles.toggleButtonText}>
            {expanded ? '접기' : '상세보기'}
          </Text>
          {expanded ? (
            <ChevronUp size={16} color={'#ffffff'} />
          ) : (
            <ChevronDown size={16} color={'#ffffff'} />
          )}
        </TouchableOpacity>
      </View>

      {/* 확장된 콘텐츠 */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* 상세 내용 */}
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>상세 내용</Text>
            <View style={styles.detailBox}>
              <Text style={styles.detailText}>{post.description}</Text>
            </View>
          </View>

          {/* 참여하기 버튼 */}
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoin}
            activeOpacity={0.8}>
            <Users size={18} color={colors.white} />
            <Text style={styles.joinButtonText}>참여하기</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
