package com.cucook.moc.chat.dao;

import com.cucook.moc.chat.dto.ChatParticipantDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ChatParticipantDAO {

    // 참여자 등록용
    void insertParticipant(@Param("chatRoomId") Long chatRoomId,
                           @Param("userId") Long userId);

    boolean existsByRoomAndUser(@Param("chatRoomId") Long chatRoomId,
                                @Param("userId") Long userId);

    //  채팅방 참가자 목록 (닉네임/평점 조회용)
    List<ChatParticipantDTO> selectParticipantInfos(@Param("chatRoomId") Long chatRoomId);
}
