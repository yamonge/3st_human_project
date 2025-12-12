package com.cucook.moc.notice.service;

import com.cucook.moc.notice.dto.request.NoticeDeleteRequestDTO;
import com.cucook.moc.notice.dto.request.NoticeSaveRequestDTO;
import com.cucook.moc.notice.dto.request.NoticeSearchRequestDTO;
import com.cucook.moc.notice.dto.response.NoticeDetailResponseDTO;
import com.cucook.moc.notice.dto.response.NoticeListItemResponseDTO;

import java.util.List;

/**
 * 공지사항 비즈니스 인터페이스
 */
public interface NoticeService {

    // 목록 조회
    List<NoticeListItemResponseDTO> getNoticeList(NoticeSearchRequestDTO searchDTO);

    // 상세 조회 (+ 조회수 증가)
    NoticeDetailResponseDTO getNoticeDetail(Long noticeId);

    // 공지 등록 (관리자)
    Long createNotice(NoticeSaveRequestDTO requestDTO);

    // 공지 수정 (관리자)
    void updateNotice(Long noticeId, NoticeSaveRequestDTO requestDTO);

    // 상단 고정 / 해제 (관리자)
    void pinNotice(Long noticeId, Long adminUserId);
    void unpinNotice(Long noticeId, Long adminUserId);

    // 공지 삭제 (소프트 삭제, 관리자)
    void deleteNotice(Long noticeId, NoticeDeleteRequestDTO requestDTO);
}
