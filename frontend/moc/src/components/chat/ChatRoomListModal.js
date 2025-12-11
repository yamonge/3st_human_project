import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {
  MessageCircle,
  X,
  Check,
  XCircle,
  Star,
  Trash2,
} from 'lucide-react-native';
// import {getMyChatRooms, deleteChatRoom} from '../../api/chat';
import {colors} from '../../styles/common';
import styles from '../../styles/components/chat/ChatRoomListModalStyles';
import ChatRoomDetail from './ChatRoomDetail';

// 더미 데이터
const DUMMY_CHAT_ROOMS = [
  {
    chatRoomId: 1,
    placeName: '이마트 쌍용점',
    lastMessage: '12시 35분에 만나요!',
    lastSenderNickname: '돌리',
    unreadCount: 3,
    statusCd: 'OPEN',
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    chatRoomId: 2,
    placeName: '롯데마트 신촌점',
    lastMessage: '채소 먼저 사고 과일 볼게요',
    lastSenderNickname: '또치',
    unreadCount: 1,
    statusCd: 'OPEN',
    updatedAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    chatRoomId: 3,
    placeName: '이마트 월드컵점',
    lastMessage: '수고하셨습니다~',
    lastSenderNickname: '나',
    unreadCount: 0,
    statusCd: 'DONE',
    updatedAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
  },
  {
    chatRoomId: 4,
    placeName: '천안 터미널 마트',
    lastMessage: '죄송합니다 일정이 안 맞아서...',
    lastSenderNickname: '둘리',
    unreadCount: 0,
    statusCd: 'CANCELED',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
  },
];

/**
 * 채팅방 목록 모달
 */
export default function ChatRoomListModal({visible, onClose, navigation}) {
  const [chatRooms, setChatRooms] = useState(DUMMY_CHAT_ROOMS);
  const [loading, setLoading] = useState(false);
  const [showChatRoom, setShowChatRoom] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const userId = 1;

  useEffect(() => {
    if (visible) {
      fetchChatRooms();
    }
  }, [visible]);

  const fetchChatRooms = async () => {
    setLoading(true);
    try {
      // const data = await getMyChatRooms(userId);
      // setChatRooms(data);
      setTimeout(() => {
        setChatRooms(DUMMY_CHAT_ROOMS);
        setLoading(false);
      }, 500);
    } catch (error) {
      Alert.alert('오류', '채팅방 목록을 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleDelete = chatRoomId => {
    Alert.alert('확인', '채팅방을 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            // await deleteChatRoom(chatRoomId);
            setChatRooms(prev =>
              prev.filter(room => room.chatRoomId !== chatRoomId),
            );
            Alert.alert('완료', '채팅방이 삭제되었습니다.');
          } catch (error) {
            Alert.alert('오류', '채팅방 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleReviewPress = chatRoomId => {
    console.log('후기 작성:', chatRoomId);
    onClose();
  };

  const handleChatRoomPress = chatRoomId => {
    const chatRoom = chatRooms.find(room => room.chatRoomId === chatRoomId);
    setSelectedChatRoom(chatRoom);
    setShowChatRoom(true);
  };

  const handleCloseChatRoom = () => {
    setShowChatRoom(false);
    setSelectedChatRoom(null);
  };

  const formatTime = timestamp => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays === 1) return '어제';
    return `${diffDays}일 전`;
  };

  const renderChatRoomCard = ({item}) => {
    const {
      chatRoomId,
      placeName,
      lastMessage,
      unreadCount,
      statusCd,
      updatedAt,
    } = item;
    const isActive = statusCd === 'OPEN';
    const isDone = statusCd === 'DONE';
    const isCanceled = statusCd === 'CANCELED';

    return (
      <TouchableOpacity
        style={styles.chatRoomCard}
        onPress={() => handleChatRoomPress(chatRoomId)}
        activeOpacity={0.8}>
        <View style={styles.cardContent}>
          <View style={styles.topRow}>
            <View style={styles.leftInfo}>
              {isActive && (
                <View style={[styles.statusDot, styles.statusDotActive]} />
              )}
              {isDone && (
                <View style={styles.iconContainer}>
                  <Check
                    size={18}
                    color={colors.primaryBlue}
                    strokeWidth={2.5}
                  />
                </View>
              )}
              {isCanceled && (
                <View style={styles.iconContainer}>
                  <XCircle size={18} color="#E7000B" strokeWidth={2.5} />
                </View>
              )}
              <Text style={styles.storeName}>{placeName}</Text>
            </View>
            <View style={styles.rightInfo}>
              <Text style={styles.timeText}>{formatTime(updatedAt)}</Text>
              {isActive && unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.bottomRow}>
            <Text
              style={[
                styles.statusText,
                isActive && styles.statusActive,
                isDone && styles.statusDone,
                isCanceled && styles.statusCanceled,
              ]}>
              {isActive && '진행중'}
              {isDone && '완료'}
              {isCanceled && '취소됨'}
            </Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessage}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHiddenItem = ({item}) => {
    const isDone = item.statusCd === 'DONE';

    return (
      <View style={styles.hiddenContainer}>
        {isDone && (
          <TouchableOpacity
            style={[styles.hiddenButton, styles.reviewHiddenButton]}
            onPress={() => handleReviewPress(item.chatRoomId)}>
            <Star size={20} color="#BB4D00" strokeWidth={2} />
            <Text
              style={[styles.hiddenButtonText, styles.reviewHiddenButtonText]}>
              후기 작성
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.hiddenButton, styles.deleteHiddenButton]}
          onPress={() => handleDelete(item.chatRoomId)}>
          <Trash2 size={20} color={colors.textWhite} strokeWidth={2} />
          <Text style={styles.hiddenButtonText}>삭제</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MessageCircle
                size={24}
                color={colors.primaryBlue}
                strokeWidth={2}
              />
              <Text style={styles.headerTitle}>채팅방 목록</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <X size={20} color={colors.textBlack} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primaryBlue} />
            </View>
          ) : chatRooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>참여한 채팅방이 없습니다</Text>
            </View>
          ) : (
            <SwipeListView
              data={chatRooms}
              keyExtractor={item => item.chatRoomId.toString()}
              renderItem={renderChatRoomCard}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-160}
              disableRightSwipe
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              style={styles.listContainer}
            />
          )}
        </View>
      </View>
      <ChatRoomDetail
        visible={showChatRoom}
        onClose={handleCloseChatRoom}
        chatRoomId={selectedChatRoom?.chatRoomId}
        placeName={selectedChatRoom?.placeName}
        statusCd={selectedChatRoom?.statusCd}
      />
    </>
  );
}
