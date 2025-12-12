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
import {ChevronLeft, Users, Menu} from 'lucide-react-native';
import {useKeyboard} from '../../utils/useKeyboard';
import styles from '../../styles/components/chat/ChatRoomScreenStyles';

const ChatRoomScreen = ({visible, onClose, placeName, statusCd}) => {
  const {keyboardHeight} = useKeyboard();
  const roomName = placeName || '이마트 쌍용점';
  const status =
    statusCd === 'OPEN' ? '진행중' : statusCd === 'DONE' ? '완료' : '취소됨';
  const [message, setMessage] = useState('');
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
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'me',
        text: message.trim(),
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        isMe: true,
      };
      setMessages([...messages, newMessage]);
      setMessage('');

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
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Users size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Menu size={20} color="#000" />
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

        {/* 하단 입력창 */}
        <View style={[styles.inputContainer, {bottom: keyboardHeight}]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="메시지를 입력하세요"
              placeholderTextColor="rgba(23, 23, 23, 0.5)"
              value={message}
              onChangeText={setMessage}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
          </View>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Portal>
  );
};

export default ChatRoomScreen;
