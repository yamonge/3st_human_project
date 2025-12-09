package com.cucook.moc.receipt.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptRequestDTO {
    private Long receiptId;
    private Long cameraSessionId;
    private String storeName;
    private String storeAddress;
    private BigDecimal payAmount;
    private Timestamp payDate;
    private String rawText;
}