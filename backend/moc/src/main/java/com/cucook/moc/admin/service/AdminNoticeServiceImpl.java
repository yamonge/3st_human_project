package com.cucook.moc.admin.service;

import com.cucook.moc.admin.dao.AdminNoticeDAO;
import com.cucook.moc.admin.dto.request.AdminNoticeSaveRequestDTO;
import com.cucook.moc.admin.dto.request.AdminNoticeSearchRequestDTO;
import com.cucook.moc.admin.dto.response.AdminNoticeDetailResponseDTO;
import com.cucook.moc.admin.dto.response.AdminNoticeListItemResponseDTO;
import com.cucook.moc.admin.vo.AdminNoticeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 공지사항 관리 비즈니스 로직 구현체
 */
@Service
@RequiredArgsConstructor
public class AdminNoticeServiceImpl implements AdminNoticeService {

    private final AdminNoticeDAO adminNoticeDAO;

    @Override
    public List<AdminNoticeListItemResponseDTO> getNoticeList(AdminNoticeSearchRequestDTO searchDTO) {

        List<AdminNoticeVO> voList = adminNoticeDAO.selectNoticeList(searchDTO);
        List<AdminNoticeListItemResponseDTO> dtoList = new ArrayList<>();

        for (AdminNoticeVO vo : voList) {
            AdminNoticeListItemResponseDTO dto = new AdminNoticeListItemResponseDTO();
            dto.setNoticeId(vo.getNoticeId());
            dto.setTitle(vo.getTitle());
            dto.setPinned("Y".equals(vo.getIsPinned()));
            dto.setCreatedDate(vo.getCreatedDate());
            dtoList.add(dto);
        }

        return dtoList;
    }

    @Override
    public AdminNoticeDetailResponseDTO getNoticeDetail(Long noticeId) {
        AdminNoticeVO vo = adminNoticeDAO.selectNoticeById(noticeId);
        if (vo == null) {
            return null;
        }

        AdminNoticeDetailResponseDTO dto = new AdminNoticeDetailResponseDTO();
        dto.setNoticeId(vo.getNoticeId());
        dto.setTitle(vo.getTitle());
        dto.setContent(vo.getContent());
        dto.setImageUrl(vo.getImageUrl());
        dto.setPinned("Y".equals(vo.getIsPinned()));
        dto.setCreatedDate(vo.getCreatedDate());
        dto.setUpdatedDate(vo.getUpdatedDate());

        return dto;
    }

    @Override
    public Long createNotice(AdminNoticeSaveRequestDTO requestDTO) {

        AdminNoticeVO vo = new AdminNoticeVO();
        vo.setTitle(requestDTO.getTitle());
        vo.setContent(requestDTO.getContent());
        vo.setImageUrl(requestDTO.getImageUrl());
        vo.setIsPinned(requestDTO.isPinned() ? "Y" : "N");
        vo.setIsVisible("Y");
        vo.setCreatedId(requestDTO.getAdminUserId());

        adminNoticeDAO.insertNotice(vo);
        return vo.getNoticeId();
    }

    @Override
    public void updateNotice(Long noticeId, AdminNoticeSaveRequestDTO requestDTO) {

        AdminNoticeVO vo = new AdminNoticeVO();
        vo.setNoticeId(noticeId);
        vo.setTitle(requestDTO.getTitle());
        vo.setContent(requestDTO.getContent());
        vo.setImageUrl(requestDTO.getImageUrl());
        vo.setIsPinned(requestDTO.isPinned() ? "Y" : "N");
        vo.setUpdatedId(requestDTO.getAdminUserId());

        adminNoticeDAO.updateNotice(vo);
    }

    @Override
    public void pinNotice(Long noticeId, Long adminUserId) {
        adminNoticeDAO.updateNoticePin(noticeId, "Y", adminUserId);
    }

    @Override
    public void unpinNotice(Long noticeId, Long adminUserId) {
        adminNoticeDAO.updateNoticePin(noticeId, "N", adminUserId);
    }

    @Override
    public void deleteNotice(Long noticeId) {
        adminNoticeDAO.deleteNotice(noticeId);
    }
}
