package com.cucook.moc.receipt.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptListResponseDTO {
    private List<ReceiptResponseDTO> receipts;
    private int totalCount;
}