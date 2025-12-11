package com.cucook.moc.notice.controller;

import com.cucook.moc.notice.dto.request.NoticeDeleteRequestDTO;
import com.cucook.moc.notice.dto.request.NoticeSaveRequestDTO;
import com.cucook.moc.notice.dto.request.NoticeSearchRequestDTO;
import com.cucook.moc.notice.dto.response.NoticeDetailResponseDTO;
import com.cucook.moc.notice.dto.response.NoticeListItemResponseDTO;
import com.cucook.moc.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 관리자 전용 공지사항 관리 컨트롤러
 * - URL: /api/admin/notices
 */
@RestController
@RequestMapping("/api/admin/notices")
@RequiredArgsConstructor
public class AdminNoticeController {

    private final NoticeService noticeService;

    /**
     * 공지 목록 조회 (cursor 기반)
     * GET /api/admin/notices?keyword=&lastNoticeId=&limit=
     */
    @GetMapping
    public ResponseEntity<List<NoticeListItemResponseDTO>> getNoticeList(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "lastNoticeId", required = false) Long lastNoticeId,
            @RequestParam(value = "limit", required = false) Integer limit) {

        NoticeSearchRequestDTO searchDTO = new NoticeSearchRequestDTO();
        searchDTO.setKeyword(keyword);
        searchDTO.setLastNoticeId(lastNoticeId);
        searchDTO.setLimit(limit);

        List<NoticeListItemResponseDTO> list = noticeService.getNoticeList(searchDTO);
        return ResponseEntity.ok(list);
    }

    /**
     * 공지 상세 조회
     * GET /api/admin/notices/{noticeId}
     */
    @GetMapping("/{noticeId}")
    public ResponseEntity<NoticeDetailResponseDTO> getNoticeDetail(
            @PathVariable("noticeId") Long noticeId) {

        NoticeDetailResponseDTO detail = noticeService.getNoticeDetail(noticeId);
        if (detail == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(detail);
    }

    /**
     * 공지 등록
     * POST /api/admin/notices
     */
    @PostMapping
    public ResponseEntity<Long> createNotice(
            @RequestBody NoticeSaveRequestDTO requestDTO) {

        Long noticeId = noticeService.createNotice(requestDTO);
        return ResponseEntity.ok(noticeId);
    }

    /**
     * 공지 수정
     * PUT /api/admin/notices/{noticeId}
     */
    @PutMapping("/{noticeId}")
    public ResponseEntity<Void> updateNotice(
            @PathVariable("noticeId") Long noticeId,
            @RequestBody NoticeSaveRequestDTO requestDTO) {

        noticeService.updateNotice(noticeId, requestDTO);
        return ResponseEntity.ok().build();
    }

    /**
     * 상단 고정
     * POST /api/admin/notices/{noticeId}/pin
     */
    @PostMapping("/{noticeId}/pin")
    public ResponseEntity<Void> pinNotice(
            @PathVariable("noticeId") Long noticeId,
            @RequestParam("adminUserId") Long adminUserId) {

        noticeService.pinNotice(noticeId, adminUserId);
        return ResponseEntity.ok().build();
    }

    /**
     * 상단 고정 해제
     * POST /api/admin/notices/{noticeId}/unpin
     */
    @PostMapping("/{noticeId}/unpin")
    public ResponseEntity<Void> unpinNotice(
            @PathVariable("noticeId") Long noticeId,
            @RequestParam("adminUserId") Long adminUserId) {

        noticeService.unpinNotice(noticeId, adminUserId);
        return ResponseEntity.ok().build();
    }

    /**
     * 공지 삭제 (소프트 삭제)
     * DELETE /api/admin/notices/{noticeId}
     * Body: { "adminUserId": 1 }
     */
    @DeleteMapping("/{noticeId}")
    public ResponseEntity<Void> deleteNotice(
            @PathVariable("noticeId") Long noticeId,
            @RequestBody NoticeDeleteRequestDTO requestDTO) {

        noticeService.deleteNotice(noticeId, requestDTO);
        return ResponseEntity.ok().build();
    }
}
