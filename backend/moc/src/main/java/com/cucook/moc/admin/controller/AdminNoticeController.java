package com.cucook.moc.admin.controller;

import com.cucook.moc.admin.dto.request.AdminNoticeSaveRequestDTO;
import com.cucook.moc.admin.dto.request.AdminNoticeSearchRequestDTO;
import com.cucook.moc.admin.dto.response.AdminNoticeDetailResponseDTO;
import com.cucook.moc.admin.dto.response.AdminNoticeListItemResponseDTO;
import com.cucook.moc.admin.service.AdminNoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 공지사항 관리 API 컨트롤러
 */
@RestController
@RequestMapping("/api/admin/notices")
@RequiredArgsConstructor
public class AdminNoticeController {

    private final AdminNoticeService adminNoticeService;

    /**
     * 공지사항 목록 조회 (cursor 기반)
     */
    @GetMapping
    public List<AdminNoticeListItemResponseDTO> getNoticeList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long lastNoticeId,
            @RequestParam(defaultValue = "20") Integer limit
    ) {
        AdminNoticeSearchRequestDTO searchDTO = new AdminNoticeSearchRequestDTO();
        searchDTO.setKeyword(keyword);
        searchDTO.setLastNoticeId(lastNoticeId);
        searchDTO.setLimit(limit);

        return adminNoticeService.getNoticeList(searchDTO);
    }

    /**
     * 공지사항 상세 조회
     */
    @GetMapping("/{noticeId}")
    public AdminNoticeDetailResponseDTO getNoticeDetail(@PathVariable Long noticeId) {
        return adminNoticeService.getNoticeDetail(noticeId);
    }

    /**
     * 공지사항 작성
     */
    @PostMapping
    public Long createNotice(@RequestBody AdminNoticeSaveRequestDTO requestDTO) {
        return adminNoticeService.createNotice(requestDTO);
    }

    /**
     * 공지사항 수정
     */
    @PutMapping("/{noticeId}")
    public void updateNotice(
            @PathVariable Long noticeId,
            @RequestBody AdminNoticeSaveRequestDTO requestDTO
    ) {
        adminNoticeService.updateNotice(noticeId, requestDTO);
    }

    /**
     * 공지사항 상단 고정
     */
    @PostMapping("/{noticeId}/pin")
    public void pinNotice(
            @PathVariable Long noticeId,
            @RequestParam Long adminUserId
    ) {
        adminNoticeService.pinNotice(noticeId, adminUserId);
    }

    /**
     * 공지사항 상단 고정 해제
     */
    @PostMapping("/{noticeId}/unpin")
    public void unpinNotice(
            @PathVariable Long noticeId,
            @RequestParam Long adminUserId
    ) {
        adminNoticeService.unpinNotice(noticeId, adminUserId);
    }

    /**
     * 공지사항 삭제
     */
    @DeleteMapping("/{noticeId}")
    public void deleteNotice(@PathVariable Long noticeId) {
        adminNoticeService.deleteNotice(noticeId);
    }
}

