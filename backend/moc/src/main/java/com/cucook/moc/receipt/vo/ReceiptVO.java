package com.cucook.moc.receipt.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;

@Data
public class ReceiptVO {

    private Long receiptId;
    private Long userId;
    private Long cameraSessionId;
    private String storeName;
    private String storeAddress;
    private BigDecimal payAmount;
    private LocalDate payDate;
    private String rawText;
    private Long createdId;
    private Timestamp createdDate;
    private Long updatedId;
    private Timestamp updatedDate;
}