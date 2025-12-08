package com.cucook.moc.receipt.dto.request; // ⭐ receipt 패키지

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptItemRequestDTO {
    private Long receiptItemId; // 품목 수정 시 사용 (생성 시에는 null)
    private Long receiptId;
    private String itemName;
    private BigDecimal itemQuantity;
    private BigDecimal itemUnitPrice;
    private BigDecimal itemTotalPrice;
    private String mappedIngredientName;
}