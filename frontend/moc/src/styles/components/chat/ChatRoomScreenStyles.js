import {StyleSheet} from 'react-native';
import {colors, spacing} from '../../common';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.bgWhite,
  },

  scrollContainer: {
    flexGrow: 1,
  },

  // 헤더 스타일
  header: {
    height: 75,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 1,
  },

  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerInfo: {
    flex: 1,
  },

  roomName: {
    fontSize: 16,
    fontFamily: 'NotoSansKR-Bold',
    color: '#171717',
    lineHeight: 24,
  },

  roomStatus: {
    fontSize: 12,
    fontFamily: 'NotoSansKR-Regular',
    color: '#737373',
    lineHeight: 18,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 메시지 영역 스타일
  messageArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  messageContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },

  // 상대방 메시지 스타일
  otherMessageContainer: {
    alignItems: 'flex-start',
    gap: 4,
  },

  senderName: {
    fontSize: 12,
    fontFamily: 'NotoSansKR-Medium',
    color: '#737373',
    lineHeight: 18,
    paddingHorizontal: 8,
  },

  otherMessageBubble: {
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 17,
    maxWidth: '75%',
  },

  otherMessageText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR-Regular',
    color: '#171717',
    lineHeight: 20,
  },

  // 내 메시지 스타일
  myMessageContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },

  myMessageBubble: {
    backgroundColor: '#155DFC',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: '75%',
  },

  myMessageText: {
    fontSize: 14,
    fontFamily: 'NotoSansKR-Regular',
    color: colors.textWhite,
    lineHeight: 20,
  },

  messageTime: {
    fontSize: 11,
    fontFamily: 'NotoSansKR-Regular',
    color: '#A1A1A1',
    lineHeight: 16.5,
    paddingHorizontal: 8,
  },

  // 입력창 스타일
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bgWhite,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: 77,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  inputWrapper: {
    flex: 1,
    height: 44,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 22,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },

  input: {
    fontSize: 14,
    fontFamily: 'NotoSansKR-Regular',
    color: '#171717',
    padding: 0,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#155DFC',
    backgroundImage: 'linear-gradient(to right, #00B8DB, #155DFC)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  sendIcon: {
    fontSize: 20,
    color: colors.textWhite,
    fontWeight: 'bold',
  },
});

export default styles;
