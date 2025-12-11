package com.cucook.moc.admin.service;

import com.cucook.moc.admin.dto.request.AdminNoticeSaveRequestDTO;
import com.cucook.moc.admin.dto.request.AdminNoticeSearchRequestDTO;
import com.cucook.moc.admin.dto.response.AdminNoticeDetailResponseDTO;
import com.cucook.moc.admin.dto.response.AdminNoticeListItemResponseDTO;

import java.util.List;

/**
 * 공지사항 관리 비즈니스 로직 인터페이스
 */
public interface AdminNoticeService {

    List<AdminNoticeListItemResponseDTO> getNoticeList(AdminNoticeSearchRequestDTO searchDTO);

    AdminNoticeDetailResponseDTO getNoticeDetail(Long noticeId);

    Long createNotice(AdminNoticeSaveRequestDTO requestDTO);

    void updateNotice(Long noticeId, AdminNoticeSaveRequestDTO requestDTO);

    void pinNotice(Long noticeId, Long adminUserId);

    void unpinNotice(Long noticeId, Long adminUserId);

    void deleteNotice(Long noticeId);
}
