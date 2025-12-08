package com.cucook.moc.receipt.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
public class ReceiptItemVO {

    private Long receiptItemId;
    private Long receiptId;
    private String itemName;
    private BigDecimal itemQuantity;
    private BigDecimal itemUnitPrice;
    private BigDecimal itemTotalPrice;
    private String mappedIngredientName;
    private Long createdId;
    private Timestamp createdDate;
    private Long updatedId;
    private Timestamp updatedDate;
}