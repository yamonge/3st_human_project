package com.cucook.moc.notice.controller;

import com.cucook.moc.notice.dto.request.NoticeSaveRequestDTO;
import com.cucook.moc.notice.dto.request.NoticeSearchRequestDTO;
import com.cucook.moc.notice.dto.response.NoticeDetailResponseDTO;
import com.cucook.moc.notice.dto.response.NoticeListItemResponseDTO;
import com.cucook.moc.notice.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notices")
@RequiredArgsConstructor
public class AdminNoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ResponseEntity<List<NoticeListItemResponseDTO>> getNoticeList(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "lastNoticeId", required = false) Long lastNoticeId,
            @RequestParam(value = "limit", required = false) Integer limit) {

        NoticeSearchRequestDTO dto = new NoticeSearchRequestDTO();
        dto.setKeyword(keyword);
        dto.setLastNoticeId(lastNoticeId);
        dto.setLimit(limit);

        return ResponseEntity.ok(noticeService.getNoticeList(dto));
    }

    @GetMapping("/{noticeId}")
    public ResponseEntity<NoticeDetailResponseDTO> getNoticeDetail(@PathVariable Long noticeId) {
        NoticeDetailResponseDTO detail = noticeService.getNoticeDetail(noticeId);
        if (detail == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(detail);
    }

    @PostMapping
    public ResponseEntity<Long> createNotice(@RequestBody(required = false) NoticeSaveRequestDTO requestDTO) {
        return ResponseEntity.ok(noticeService.createNotice(requestDTO));
    }

    @PutMapping("/{noticeId}")
    public ResponseEntity<Void> updateNotice(@PathVariable Long noticeId,
                                             @RequestBody(required = false) NoticeSaveRequestDTO requestDTO) {
        noticeService.updateNotice(noticeId, requestDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{noticeId}/pin")
    public ResponseEntity<Void> pin(@PathVariable Long noticeId) {
        noticeService.pinNotice(noticeId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{noticeId}/unpin")
    public ResponseEntity<Void> unpin(@PathVariable Long noticeId) {
        noticeService.unpinNotice(noticeId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{noticeId}")
    public ResponseEntity<Void> delete(@PathVariable Long noticeId) {
        noticeService.deleteNotice(noticeId);
        return ResponseEntity.ok().build();
    }
}
