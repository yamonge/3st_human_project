package com.cucook.moc.notice.service;

import com.cucook.moc.notice.dao.NoticeDAO;
import com.cucook.moc.notice.dto.request.NoticeDeleteRequestDTO;
import com.cucook.moc.notice.dto.request.NoticeSaveRequestDTO;
import com.cucook.moc.notice.dto.request.NoticeSearchRequestDTO;
import com.cucook.moc.notice.dto.response.NoticeDetailResponseDTO;
import com.cucook.moc.notice.dto.response.NoticeListItemResponseDTO;
import com.cucook.moc.notice.vo.NoticeVO;
import com.cucook.moc.user.dao.UserDAO;
import com.cucook.moc.user.vo.UserVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * 공지사항 비즈니스 로직 구현체
 */
@Service
@Transactional
@RequiredArgsConstructor
public class NoticeServiceImpl implements NoticeService {

    private final NoticeDAO noticeDAO;
    private final UserDAO userDAO;

    // ------------------------------
    // 목록 조회 (일반 사용자도 사용 가능)
    // ------------------------------
    @Override
    @Transactional(readOnly = true)
    public List<NoticeListItemResponseDTO> getNoticeList(NoticeSearchRequestDTO searchDTO) {

        if (searchDTO.getLimit() == null || searchDTO.getLimit() <= 0) {
            searchDTO.setLimit(20); // 기본 20개
        }

        List<NoticeVO> voList = noticeDAO.selectNoticeList(searchDTO);
        List<NoticeListItemResponseDTO> dtoList = new ArrayList<>();

        for (NoticeVO vo : voList) {
            NoticeListItemResponseDTO dto = new NoticeListItemResponseDTO();
            dto.setNoticeId(vo.getNoticeId());
            dto.setTitle(vo.getTitle());
            dto.setPinned("Y".equalsIgnoreCase(vo.getIsPinned()));
            dto.setViewCount(vo.getViewCnt() != null ? vo.getViewCnt() : 0L);
            dto.setCreatedDate(vo.getCreatedDate());
            dtoList.add(dto);
        }

        return dtoList;
    }

    // ------------------------------
    // 상세 조회 (+ 조회수 증가)
    // ------------------------------
    @Override
    public NoticeDetailResponseDTO getNoticeDetail(Long noticeId) {

        if (noticeId == null) {
            throw new IllegalArgumentException("noticeId 는 필수입니다.");
        }

        NoticeVO vo = noticeDAO.selectNoticeById(noticeId);
        if (vo == null || !"Y".equalsIgnoreCase(vo.getIsVisible())) {
            return null;
        }

        // 조회수 +1
        noticeDAO.increaseViewCount(noticeId);

        NoticeDetailResponseDTO dto = new NoticeDetailResponseDTO();
        dto.setNoticeId(vo.getNoticeId());
        dto.setTitle(vo.getTitle());
        dto.setContent(vo.getContent());
        dto.setImageUrl(vo.getImageUrl());
        dto.setPinned("Y".equalsIgnoreCase(vo.getIsPinned()));
        dto.setVisible("Y".equalsIgnoreCase(vo.getIsVisible()));
        dto.setViewCount((vo.getViewCnt() != null ? vo.getViewCnt() : 0L) + 1L);
        dto.setCreatedDate(vo.getCreatedDate());
        dto.setUpdatedDate(vo.getUpdatedDate());

        return dto;
    }

    // ------------------------------
    // 공지 작성 (관리자)
    // ------------------------------
    @Override
    public Long createNotice(NoticeSaveRequestDTO requestDTO) {

        validateBaseFields(requestDTO);
        UserVO admin = validateAdmin(requestDTO.getAdminUserId());

        String isPinned = Boolean.TRUE.equals(requestDTO.getPinned()) ? "Y" : "N";
        String isVisible = (requestDTO.getVisible() == null || requestDTO.getVisible())
                ? "Y" : "N";

        Timestamp now = new Timestamp(System.currentTimeMillis());

        NoticeVO vo = new NoticeVO();
        vo.setTitle(requestDTO.getTitle());
        vo.setContent(requestDTO.getContent());
        vo.setImageUrl(requestDTO.getImageUrl());
        vo.setViewCnt(0L);
        vo.setIsPinned(isPinned);
        vo.setIsVisible(isVisible);
        vo.setCreatedId(admin.getUserId());
        vo.setCreatedDate(now);

        noticeDAO.insertNotice(vo);
        return vo.getNoticeId();
    }

    // ------------------------------
    // 공지 수정 (관리자)
    // ------------------------------
    @Override
    public void updateNotice(Long noticeId, NoticeSaveRequestDTO requestDTO) {

        if (noticeId == null) {
            throw new IllegalArgumentException("noticeId 는 필수입니다.");
        }
        validateBaseFields(requestDTO);
        UserVO admin = validateAdmin(requestDTO.getAdminUserId());

        NoticeVO existing = noticeDAO.selectNoticeById(noticeId);
        if (existing == null) {
            throw new IllegalArgumentException("존재하지 않는 공지사항입니다.");
        }

        String isPinned = Boolean.TRUE.equals(requestDTO.getPinned()) ? "Y" : "N";
        String isVisible = (requestDTO.getVisible() == null || requestDTO.getVisible())
                ? "Y" : "N";

        // 이미지 처리 정책
        // - requestDTO.getImageUrl() == null : 기존 이미지 유지
        // - ""(빈 문자열)                    : 이미지 제거 (NULL)
        // - 그 외 문자열                     : 새 URL로 교체
        String newImageUrl;
        if (requestDTO.getImageUrl() == null) {
            newImageUrl = existing.getImageUrl();
        } else if (requestDTO.getImageUrl().isEmpty()) {
            newImageUrl = null;
        } else {
            newImageUrl = requestDTO.getImageUrl();
        }

        Timestamp now = new Timestamp(System.currentTimeMillis());

        NoticeVO vo = new NoticeVO();
        vo.setNoticeId(noticeId);
        vo.setTitle(requestDTO.getTitle());
        vo.setContent(requestDTO.getContent());
        vo.setImageUrl(newImageUrl);
        vo.setIsPinned(isPinned);
        vo.setIsVisible(isVisible);
        vo.setUpdatedId(admin.getUserId());
        vo.setUpdatedDate(now);

        noticeDAO.updateNotice(vo);
    }

    // ------------------------------
    // 상단 고정 (관리자)
    // ------------------------------
    @Override
    public void pinNotice(Long noticeId, Long adminUserId) {

        if (noticeId == null) {
            throw new IllegalArgumentException("noticeId 는 필수입니다.");
        }
        validateAdmin(adminUserId);

        noticeDAO.updateNoticePin(noticeId, "Y", adminUserId);
    }

    // ------------------------------
    // 상단 고정 해제 (관리자)
    // ------------------------------
    @Override
    public void unpinNotice(Long noticeId, Long adminUserId) {

        if (noticeId == null) {
            throw new IllegalArgumentException("noticeId 는 필수입니다.");
        }
        validateAdmin(adminUserId);

        noticeDAO.updateNoticePin(noticeId, "N", adminUserId);
    }

    // ------------------------------
    // 공지 삭제 (소프트 삭제, 관리자)
    // ------------------------------
    @Override
    public void deleteNotice(Long noticeId, NoticeDeleteRequestDTO requestDTO) {

        if (noticeId == null) {
            throw new IllegalArgumentException("noticeId 는 필수입니다.");
        }
        if (requestDTO == null || requestDTO.getAdminUserId() == null) {
            throw new IllegalArgumentException("adminUserId 는 필수입니다.");
        }

        Long adminUserId = requestDTO.getAdminUserId();
        validateAdmin(adminUserId);

        NoticeVO existing = noticeDAO.selectNoticeById(noticeId);
        if (existing == null) {
            throw new IllegalArgumentException("존재하지 않는 공지사항입니다.");
        }

        noticeDAO.softDeleteNotice(noticeId, adminUserId);
    }

    // ------------------------------
    // 내부 공통 검증 메서드
    // ------------------------------
    private void validateBaseFields(NoticeSaveRequestDTO requestDTO) {

        if (requestDTO == null) {
            throw new IllegalArgumentException("요청 정보가 없습니다.");
        }
        if (requestDTO.getAdminUserId() == null) {
            throw new IllegalArgumentException("adminUserId 는 필수입니다.");
        }
        if (requestDTO.getTitle() == null || requestDTO.getTitle().isBlank()) {
            throw new IllegalArgumentException("공지 제목은 필수입니다.");
        }
        if (requestDTO.getContent() == null || requestDTO.getContent().isBlank()) {
            throw new IllegalArgumentException("공지 내용은 필수입니다.");
        }
    }

    private UserVO validateAdmin(Long adminUserId) {

        UserVO admin = userDAO.selectById(adminUserId);
        if (admin == null) {
            throw new IllegalArgumentException("존재하지 않는 사용자입니다.");
        }
        if (!"Y".equalsIgnoreCase(admin.getUserType())) {
            throw new IllegalStateException("관리자만 공지사항을 관리할 수 있습니다.");
        }
        return admin;
    }
}
