package com.cucook.moc.receipt.dto.response; // ⭐ receipt 패키지

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptItemResponseDTO {
    private Long receiptItemId;
    private Long receiptId;
    private String itemName;
    private BigDecimal itemQuantity;
    private BigDecimal itemUnitPrice;
    private BigDecimal itemTotalPrice;
    private String mappedIngredientName;
    private Long createdId;
    private Timestamp createdDate;
    private String createdDateFormatted; // UI 표시용: "YYYY-MM-DD HH:mm:ss" 포맷
    private Long updatedId;
    private Timestamp updatedDate;
    private String updatedDateFormatted; // UI 표시용: "YYYY-MM-DD HH:mm:ss" 포맷

    // ⭐ ReceiptItemVO를 기반으로 DTO를 생성하는 편의 메서드 ⭐
    public static ReceiptItemResponseDTO from(com.cucook.moc.receipt.vo.ReceiptItemVO vo) {
        ReceiptItemResponseDTO dto = new ReceiptItemResponseDTO();
        dto.setReceiptItemId(vo.getReceiptItemId());
        dto.setReceiptId(vo.getReceiptId());
        dto.setItemName(vo.getItemName());
        dto.setItemQuantity(vo.getItemQuantity());
        dto.setItemUnitPrice(vo.getItemUnitPrice());
        dto.setItemTotalPrice(vo.getItemTotalPrice()); // getTotalPrice()가 맞는지 VO 확인

        // mappedIngredientName은 OCR 후 백엔드에서 매핑 로직을 통해 채워질 수 있습니다.
        dto.setMappedIngredientName(vo.getMappedIngredientName());

        dto.setCreatedId(vo.getCreatedId());
        dto.setCreatedDate(vo.getCreatedDate());
        if (vo.getCreatedDate() != null) {
            dto.setCreatedDateFormatted(vo.getCreatedDate().toLocalDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }

        dto.setUpdatedId(vo.getUpdatedId());
        dto.setUpdatedDate(vo.getUpdatedDate());
        if (vo.getUpdatedDate() != null) {
            dto.setUpdatedDateFormatted(vo.getUpdatedDate().toLocalDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        return dto;
    }
}