package com.cucook.moc.receipt.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptResponseDTO {
    private Long receiptId;
    private Long userId;
    private Long cameraSessionId;
    private String storeName;
    private String storeAddress;
    private BigDecimal payAmount;
    private Timestamp payDate;
    private String payDateFormatted;
    private String rawText;
    private Long createdId;
    private Timestamp createdDate;
    private String createdDateFormatted;
    private Long updatedId;
    private Timestamp updatedDate;
    private String updatedDateFormatted;

    public static ReceiptResponseDTO from(com.cucook.moc.receipt.vo.ReceiptVO vo) {
        ReceiptResponseDTO dto = new ReceiptResponseDTO();
        dto.setReceiptId(vo.getReceiptId());
        dto.setUserId(vo.getUserId());
        dto.setCameraSessionId(vo.getCameraSessionId());
        dto.setStoreName(vo.getStoreName());
        dto.setStoreAddress(vo.getStoreAddress());
        dto.setPayAmount(vo.getPayAmount());
        dto.setPayDate(vo.getPayDate());
        dto.setRawText(vo.getRawText());
        dto.setCreatedId(vo.getCreatedId());
        dto.setCreatedDate(vo.getCreatedDate());
        dto.setUpdatedId(vo.getUpdatedId());
        dto.setUpdatedDate(vo.getUpdatedDate());

        // UI 표시용 날짜 포맷팅
        if (vo.getPayDate() != null) {
            // ⭐ Timestamp to LocalDateTime 변환 후 포맷팅
            dto.setPayDateFormatted(vo.getPayDate().toLocalDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        if (vo.getCreatedDate() != null) {
            dto.setCreatedDateFormatted(vo.getCreatedDate().toLocalDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        if (vo.getUpdatedDate() != null) {
            dto.setUpdatedDateFormatted(vo.getUpdatedDate().toLocalDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        return dto;
    }
}