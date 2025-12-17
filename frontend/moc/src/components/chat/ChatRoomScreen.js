import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {Portal} from '@gorhom/portal';
import {
  ChevronLeft,
  Users,
  Trash2,
  AlertTriangle,
  UserX,
} from 'lucide-react-native';
import {useKeyboard} from '../../utils/useKeyboard';
import styles from '../../styles/components/chat/ChatRoomScreenStyles';
import ParticipantProfileBottomSheet from './ParticipantProfileBottomSheet';
import ReportModal from '../common/ReportModal';
import {reportUser} from '../../api/report';

const ChatRoomScreen = ({visible, onClose, placeName, statusCd}) => {
  const {keyboardHeight} = useKeyboard();
  const roomName = placeName || '이마트 쌍용점';
  const status =
    statusCd === 'OPEN' ? '진행중' : statusCd === 'DONE' ? '완료' : '취소됨';
  const [message, setMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showProfileBottomSheet, setShowProfileBottomSheet] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [isRoomOwner, setIsRoomOwner] = useState(true); // 임시: 방장 여부 (실제로는 props나 API에서 받아야 함)
  const [participants, setParticipants] = useState([
    {userId: 1, nickname: '둘리', avatar: '👽', isMe: false},
    {userId: 2, nickname: '나', avatar: '😊', isMe: true},
    {userId: 3, nickname: '또치', avatar: '🦊', isMe: false},
  ]);
  const messageInputRef = useRef(null); // 한글 입력 문제 해결을 위한 ref
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: '둘리',
      text: '안녕하세요! 같이 장보러 가요!',
      time: '10:30',
      isMe: false,
    },
    {
      id: 2,
      sender: 'me',
      text: '네 좋아요! 몇 시에 만날까요?',
      time: '10:32',
      isMe: true,
    },
    {
      id: 3,
      sender: '둘리',
      text: '12시 35분에 정문 앞에서 만나요!',
      time: '10:33',
      isMe: false,
    },
  ]);
  const scrollViewRef = useRef(null);

  const handleSend = () => {
    // ref에서 직접 텍스트 가져오기 (한글 입력 문제 해결)
    const messageText =
      messageInputRef.current?.value || messageInputRef.current?.text || '';

    if (messageText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'me',
        text: messageText.trim(),
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        isMe: true,
      };
      setMessages([...messages, newMessage]);

      // 입력창 초기화
      if (messageInputRef.current) {
        messageInputRef.current.clear();
        setMessage(''); // 상태도 초기화
      }

      // 메시지 전송 후 스크롤을 맨 아래로
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    }
  };

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
  };

  const handleLeaveChatRoom = () => {
    if (isRoomOwner) {
      // 방장인 경우 - 채팅방 폐기
      // Alert 추가 확인
      if (Platform.OS === 'web') {
        const confirmed = window.confirm(
          '채팅방을 폐기하시겠습니까?\n모든 참여자가 나가게 됩니다.',
        );
        if (confirmed) {
          // TODO: API 호출 - 채팅방 폐기
          // await deleteChatRoom(chatRoomId);
          console.log('채팅방 폐기');
          onClose();
        }
      } else {
        const {Alert} = require('react-native');
        Alert.alert(
          '채팅방 폐기',
          '채팅방을 폐기하시겠습니까?\n모든 참여자가 나가게 됩니다.',
          [
            {text: '취소', style: 'cancel'},
            {
              text: '폐기',
              style: 'destructive',
              onPress: () => {
                // TODO: API 호출 - 채팅방 폐기
                // await deleteChatRoom(chatRoomId);
                console.log('채팅방 폐기');
                onClose();
              },
            },
          ],
        );
      }
    } else {
      // 일반 참여자인 경우 - 채팅방 나가기
      if (Platform.OS === 'web') {
        const confirmed = window.confirm('채팅방을 나가시겠습니까?');
        if (confirmed) {
          // TODO: API 호출 - 채팅방 나가기
          // await leaveChatRoom(chatRoomId, userId);
          console.log('채팅방 나가기');
          onClose();
        }
      } else {
        const {Alert} = require('react-native');
        Alert.alert('채팅방 나가기', '채팅방을 나가시겠습니까?', [
          {text: '취소', style: 'cancel'},
          {
            text: '나가기',
            style: 'destructive',
            onPress: () => {
              // TODO: API 호출 - 채팅방 나가기
              // await leaveChatRoom(chatRoomId, userId);
              console.log('채팅방 나가기');
              onClose();
            },
          },
        ]);
      }
    }
  };

  const handleKickParticipant = participantId => {
    // 강퇴 기능 (방장만)
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('이 참여자를 강퇴하시겠습니까?');
      if (confirmed) {
        // TODO: API 호출 - 참여자 강퇴
        console.log('참여자 강퇴:', participantId);
      }
    } else {
      const {Alert} = require('react-native');
      Alert.alert('참여자 강퇴', '이 참여자를 강퇴하시겠습니까?', [
        {text: '취소', style: 'cancel'},
        {
          text: '강퇴',
          style: 'destructive',
          onPress: () => {
            // TODO: API 호출 - 참여자 강퇴
            console.log('참여자 강퇴:', participantId);
          },
        },
      ]);
    }
  };

  const handleShowProfile = participant => {
    // 프로필 바텀시트 열기
    setSelectedParticipant(participant);
    setShowProfileBottomSheet(true);
    setShowParticipants(false); // 참여자 목록 닫기
  };

  const handleReportUser = participant => {
    // 신고 모달 열기
    setReportTarget(participant);
    setShowReportModal(true);
    setShowParticipants(false); // 참여자 목록 닫기
  };

  const handleSubmitReport = async reportData => {
    try {
      await reportUser(
        reportTarget.userId,
        reportData.reason,
        reportData.detail,
      );

      // 성공 알림
      if (Platform.OS === 'web') {
        window.alert('신고가 접수되었습니다.');
      } else {
        const {Alert} = require('react-native');
        Alert.alert('신고 완료', '신고가 접수되었습니다.');
      }
    } catch (error) {
      console.error('신고 실패:', error);
      // 실패 알림
      if (Platform.OS === 'web') {
        window.alert('신고 처리 중 오류가 발생했습니다.');
      } else {
        const {Alert} = require('react-native');
        Alert.alert('오류', '신고 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // 참여자 목록 조회 (실제 API 호출 - 주석처리)
  // useEffect(() => {
  //   const fetchParticipants = async () => {
  //     try {
  //       const data = await getChatRoomParticipants(chatRoomId);
  //       setParticipants(data);
  //     } catch (error) {
  //       console.error('참여자 목록 조회 실패:', error);
  //     }
  //   };
  //   if (visible) {
  //     fetchParticipants();
  //   }
  // }, [visible]);

  const renderMessage = msg => {
    if (msg.isMe) {
      return (
        <View key={msg.id} style={styles.myMessageContainer}>
          <View style={styles.myMessageBubble}>
            <Text style={styles.myMessageText}>{msg.text}</Text>
          </View>
          <Text style={styles.messageTime}>{msg.time}</Text>
        </View>
      );
    } else {
      return (
        <View key={msg.id} style={styles.otherMessageContainer}>
          <Text style={styles.senderName}>{msg.sender}</Text>
          <View style={styles.otherMessageBubble}>
            <Text style={styles.otherMessageText}>{msg.text}</Text>
          </View>
          <Text style={styles.messageTime}>{msg.time}</Text>
        </View>
      );
    }
  };

  if (!visible) return null;

  return (
    <Portal>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.7}>
              <ChevronLeft size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.roomName}>{roomName}</Text>
              <Text style={styles.roomStatus}>🟢 {status}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={toggleParticipants}>
              <Users size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={handleLeaveChatRoom}>
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
        {/* 채팅 메시지 영역 */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageArea}
          contentContainerStyle={[
            styles.messageContent,
            {paddingBottom: keyboardHeight + 16},
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({animated: true})
          }>
          {messages.map(renderMessage)}
        </ScrollView>

        {/* 참여자 목록 뷰 */}
        {showParticipants && (
          <TouchableOpacity
            style={styles.participantsOverlay}
            activeOpacity={1}
            onPress={toggleParticipants}>
            <TouchableOpacity
              style={styles.participantsContainer}
              activeOpacity={1}
              onPress={e => e.stopPropagation()}>
              <View style={styles.participantsHeader}>
                <Text style={styles.participantsTitle}>
                  참여자 ({participants.length}명)
                </Text>
              </View>
              <ScrollView
                style={styles.participantsList}
                showsVerticalScrollIndicator={false}>
                {participants.map(participant => (
                  <TouchableOpacity
                    key={participant.userId}
                    style={styles.participantCard}
                    activeOpacity={0.7}
                    onPress={() => handleShowProfile(participant)}>
                    <View style={styles.participantInfo}>
                      <View style={styles.participantAvatar}>
                        <Text style={styles.participantAvatarText}>
                          {participant.avatar}
                        </Text>
                      </View>
                      <Text style={styles.participantNickname}>
                        {participant.nickname}
                      </Text>
                    </View>
                    {!participant.isMe && (
                      <View style={styles.participantActions}>
                        <TouchableOpacity
                          style={styles.participantActionButton}
                          activeOpacity={0.7}
                          onPress={e => {
                            e.stopPropagation();
                            handleReportUser(participant);
                          }}>
                          <AlertTriangle size={16} color="#FFA500" />
                        </TouchableOpacity>
                        {isRoomOwner && (
                          <TouchableOpacity
                            style={styles.participantActionButton}
                            activeOpacity={0.7}
                            onPress={e => {
                              e.stopPropagation();
                              handleKickParticipant(participant.userId);
                            }}>
                            <UserX size={16} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* 하단 입력창 */}
        <View style={[styles.inputContainer, {bottom: keyboardHeight}]}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={messageInputRef}
              style={styles.input}
              placeholder="메시지를 입력하세요"
              placeholderTextColor="rgba(23, 23, 23, 0.5)"
              defaultValue=""
              onChangeText={setMessage}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>

        {/* 참여자 프로필 바텀시트 */}
        <ParticipantProfileBottomSheet
          visible={showProfileBottomSheet}
          onClose={() => setShowProfileBottomSheet(false)}
          participant={selectedParticipant}
        />

        {/* 신고 모달 */}
        <ReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportTarget={reportTarget}
          onSubmit={handleSubmitReport}
        />
      </View>
    </Portal>
  );
};

export default ChatRoomScreen;
