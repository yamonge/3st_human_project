package com.cucook.moc.receipt.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptItemListResponseDTO {
    private List<ReceiptItemResponseDTO> receiptItems;
    private int totalCount;
}