package com.cucook.moc.receipt.service; // ⭐ receipt 패키지

import com.cucook.moc.receipt.dto.request.ReceiptItemRequestDTO; // Request DTO 사용
import com.cucook.moc.receipt.dto.response.ReceiptItemListResponseDTO; // List Response DTO 사용
import com.cucook.moc.receipt.dto.response.ReceiptItemResponseDTO; // Response DTO 사용
import com.cucook.moc.user.dto.response.UserIngredientResponseDTO;

import java.util.List;

/**
 * 영수증 품목 정보(인식 결과)와 관련된 비즈니스 로직을 정의하는 서비스 인터페이스입니다.
 * 영수증 인식 후 '재료 인식 결과 수정 화면'의 기능을 담당합니다.
 */
public interface ReceiptItemService {

    /**
     * 영수증 품목 하나를 추가합니다. (예: 수동으로 재료 추가 모달에서 사용)
     *
     * @param receiptId 해당 품목이 속할 영수증의 ID (아직 tb_receipt 테이블이 없으므로 임시로 이 ID를 사용)
     * @param requestDTO 추가할 품목 정보를 담은 요청 DTO
     * @param createdId 품목을 생성하는 사용자의 ID
     * @return 추가된 품목 정보를 담은 응답 DTO
     */
    ReceiptItemResponseDTO addReceiptItem(Long receiptId, ReceiptItemRequestDTO requestDTO, Long createdId);

    /**
     * 여러 영수증 품목을 일괄적으로 추가합니다. (예: OCR/AI 인식 결과 일괄 저장 시 사용)
     *
     * @param receiptId 해당 품목들이 속할 영수증의 ID
     * @param requestDTOs 일괄 추가할 품목 정보를 담은 요청 DTO 리스트
     * @param createdId 품목들을 생성하는 사용자의 ID
     * @return 일괄 추가된 품목 정보들을 담은 응답 DTO 리스트
     */
    List<ReceiptItemResponseDTO> addReceiptItemsBatch(Long receiptId, List<ReceiptItemRequestDTO> requestDTOs, Long createdId);


    /**
     * 특정 영수증 ID에 해당하는 모든 품목 목록을 조회합니다.
     * '재료 인식 결과 수정 화면'에 목록을 표시할 때 사용됩니다.
     *
     * @param receiptId 품목 목록을 조회할 영수증의 ID
     * @return 해당 영수증 품목 목록과 총 개수를 담은 응답 DTO
     */
    ReceiptItemListResponseDTO getReceiptItemsByReceiptId(Long receiptId);

    /**
     * 특정 영수증 품목의 상세 정보를 조회합니다.
     * '재료 수정 모달'이 열릴 때 해당 품목의 상세 정보를 가져오는 데 사용됩니다.
     *
     * @param receiptItemId 조회할 품목의 ID
     * @return 상세 품목 정보를 담은 응답 DTO 또는 null (해당 품목이 없을 경우)
     */
    ReceiptItemResponseDTO getReceiptItemDetail(Long receiptItemId);

    /**
     * 기존 영수증 품목 정보를 수정합니다.
     * '재료 수정 모달'에서 사용자가 품목 정보를 변경하고 저장할 때 사용됩니다.
     *
     * @param receiptItemId 수정할 품목의 ID
     * @param requestDTO 수정할 품목 정보를 담은 요청 DTO
     * @param updatedId 품목을 수정하는 사용자의 ID
     * @return 수정된 품목 정보를 담은 응답 DTO
     * @throws IllegalArgumentException 해당 품목을 찾을 수 없을 경우
     */
    ReceiptItemResponseDTO updateReceiptItem(Long receiptItemId, ReceiptItemRequestDTO requestDTO, Long updatedId);

    /**
     * 특정 영수증 품목을 삭제합니다.
     * '재료 삭제 확인 모달'에서 사용자가 품목 삭제를 확정할 때 사용됩니다.
     *
     * @param receiptItemId 삭제할 품목의 ID
     * @return 삭제 성공 여부 (true/false)
     * @throws IllegalArgumentException 해당 품목을 찾을 수 없을 경우
     */
    boolean deleteReceiptItem(Long receiptItemId);

    /**
     * 특정 영수증에 속하는 모든 품목을 삭제합니다.
     * (예: 상위 영수증(`tb_receipt`)이 삭제될 때 함께 호출되거나, 영수증 전체 재처리 시 사용)
     *
     * @param receiptId 모든 품목을 삭제할 영수증의 ID
     * @return 삭제된 품목의 총 개수
     */
    int deleteReceiptItemsByReceiptId(Long receiptId);

    //영수증 품목을 '내 재료'로 전환하는 비즈니스 로직
     List<UserIngredientResponseDTO> convertToUserIngredients(Long userId, Long receiptId);
}