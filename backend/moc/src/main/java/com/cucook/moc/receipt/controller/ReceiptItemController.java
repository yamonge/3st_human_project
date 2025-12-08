package com.cucook.moc.receipt.controller;

import com.cucook.moc.receipt.dto.request.ReceiptItemRequestDTO;
import com.cucook.moc.receipt.dto.response.ReceiptItemListResponseDTO;
import com.cucook.moc.receipt.dto.response.ReceiptItemResponseDTO;
import com.cucook.moc.receipt.service.ReceiptItemService;
import com.cucook.moc.user.dto.response.UserIngredientResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 영수증 품목 정보(인식 결과)에 대한 REST API를 처리하는 컨트롤러입니다.
 * 영수증 인식 후 '재료 인식 결과 수정 화면'의 기능을 담당합니다.
 *
 * (주의: 현재 tb_receipt 테이블이 없으므로, receiptId는 논리적인 그룹핑 ID로 사용됨)
 */
@RestController
// ⭐ RequestMapping 경로 수정: userId를 포함하여 계층 구조를 명확히 함
@RequestMapping("/api/v1/users/{userId}/receipts/{receiptId}/items")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ReceiptItemController {

    private final ReceiptItemService receiptItemService;

    @Autowired
    public ReceiptItemController(ReceiptItemService receiptItemService) {
        this.receiptItemService = receiptItemService;
    }

    /**
     * 영수증 품목 하나를 추가합니다. (예: 수동으로 재료 추가 모달에서 사용)
     * POST /api/v1/users/{userId}/receipts/{receiptId}/items
     *
     * @param userId 경로 변수에서 가져온 사용자 ID
     * @param receiptId 경로 변수에서 가져온 영수증 ID
     * @param requestDTO 추가할 품목 정보를 담은 요청 DTO
     * @return 추가된 품목 정보를 담은 응답 DTO와 HTTP 상태 코드
     */
    @PostMapping
    public ResponseEntity<ReceiptItemResponseDTO> addReceiptItem(
            @PathVariable("userId") Long userId, // ⭐ userId 경로 변수 추가
            @PathVariable("receiptId") Long receiptId,
            @RequestBody ReceiptItemRequestDTO requestDTO) {
        try {
            ReceiptItemResponseDTO response = receiptItemService.addReceiptItem(receiptId, requestDTO, userId); // ⭐ createdId로 userId 전달
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            System.err.println("영수증 품목 추가 중 오류: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("영수증 품목 추가 중 예상치 못한 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 여러 영수증 품목을 일괄적으로 추가합니다. (예: OCR/AI 인식 결과 일괄 저장 시 사용)
     * POST /api/v1/users/{userId}/receipts/{receiptId}/items/batch
     *
     * @param userId 경로 변수에서 가져온 사용자 ID
     * @param receiptId 경로 변수에서 가져온 영수증 ID
     * @param requestDTOs 일괄 추가할 품목 정보를 담은 요청 DTO 리스트
     * @return 일괄 추가된 품목 정보들을 담은 응답 DTO 리스트와 HTTP 상태 코드
     */
    @PostMapping("/batch")
    public ResponseEntity<List<ReceiptItemResponseDTO>> addReceiptItemsBatch(
            @PathVariable("userId") Long userId, // ⭐ userId 경로 변수 추가
            @PathVariable("receiptId") Long receiptId,
            @RequestBody List<ReceiptItemRequestDTO> requestDTOs) {
        try {
            List<ReceiptItemResponseDTO> responses = receiptItemService.addReceiptItemsBatch(receiptId, requestDTOs, userId); // ⭐ createdId로 userId 전달
            if (responses.isEmpty() && !requestDTOs.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(responses, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            System.err.println("영수증 품목 일괄 추가 중 오류: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("영수증 품목 일괄 추가 중 예상치 못한 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 영수증 ID에 해당하는 모든 품목 목록을 조회합니다.
     * GET /api/v1/users/{userId}/receipts/{receiptId}/items
     *
     * @param userId 경로 변수에서 가져온 사용자 ID (권한 확인용)
     * @param receiptId 경로 변수에서 가져온 영수증 ID
     * @return 해당 영수증 품목 목록과 총 개수를 담은 응답 DTO와 HTTP 상태 코드
     */
    @GetMapping
    public ResponseEntity<ReceiptItemListResponseDTO> getReceiptItemsByReceiptId(
            @PathVariable("userId") Long userId, // ⭐ userId 경로 변수 추가
            @PathVariable("receiptId") Long receiptId) {
        try {
            // TODO: 실제 구현 시, 조회된 품목의 receiptId에 연결된 영수증의 userId가 path variable의 userId와 일치하는지 확인
            ReceiptItemListResponseDTO response = receiptItemService.getReceiptItemsByReceiptId(receiptId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("영수증 품목 목록 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 영수증 품목의 상세 정보를 조회합니다.
     * GET /api/v1/users/{userId}/receipts/{receiptId}/items/{receiptItemId}
     *
     * @param userId 경로 변수에서 가져온 사용자 ID (권한 확인용)
     * @param receiptId 경로 변수에서 가져온 영수증 ID (소유자 확인용)
     * @param receiptItemId 경로 변수에서 가져온 품목 ID
     * @return 상세 품목 정보를 담은 응답 DTO와 HTTP 상태 코드
     */
    @GetMapping("/{receiptItemId}")
    public ResponseEntity<ReceiptItemResponseDTO> getReceiptItemDetail(
            @PathVariable("userId") Long userId, // ⭐ userId 경로 변수 추가
            @PathVariable("receiptId") Long receiptId,
            @PathVariable("receiptItemId") Long receiptItemId) {
        try {
            ReceiptItemResponseDTO response = receiptItemService.getReceiptItemDetail(receiptItemId);
            // TODO: 실제 구현 시, 조회된 품목의 receiptId에 연결된 영수증의 userId가 path variable의 userId와 일치하는지 확인
            // if (!response.getReceiptId().equals(receiptId) || !영수증_소유자_ID.equals(userId)) { throw new AccessDeniedException("접근 권한 없음"); }
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            System.err.println("영수증 품목 상세 조회 중 오류: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("영수증 품목 상세 조회 중 예상치 못한 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 기존 영수증 품목 정보를 수정합니다.
     * PUT /api/v1/users/{userId}/receipts/{receiptId}/items/{receiptItemId}
     *
     * @param userId 경로 변수에서 가져온 사용자 ID (권한 확인용)
     * @param receiptId 경로 변수에서 가져온 영수증 ID (소유자 확인용)
     * @param receiptItemId 경로 변수에서 가져온 품목 ID
     * @param requestDTO 수정할 품목 정보를 담은 요청 DTO
     * @return 수정된 품목 정보를 담은 응답 DTO와 HTTP 상태 코드
     */
    @PutMapping("/{receiptItemId}")
    public ResponseEntity<ReceiptItemResponseDTO> updateReceiptItem(
            @PathVariable("userId") Long userId, // ⭐ userId 경로 변수 추가
            @PathVariable("receiptId") Long receiptId,
            @PathVariable("receiptItemId") Long receiptItemId,
            @RequestBody ReceiptItemRequestDTO requestDTO) {
        try {
            ReceiptItemResponseDTO response = receiptItemService.updateReceiptItem(receiptItemId, requestDTO, userId); // ⭐ updatedId로 userId 전달
            // TODO: 실제 구현 시, 수정된 품목의 receiptId에 연결된 영수증의 userId가 path variable의 userId와 일치하는지 확인
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            System.err.println("영수증 품목 수정 중 오류: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("영수증 품목 수정 중 예상치 못한 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 영수증 품목을 삭제합니다.
     * DELETE /api/v1/users/{userId}/receipts/{receiptId}/items/{receiptItemId}
     *
     * @param userId 경로 변수에서 가져온 사용자 ID (권한 확인용)
     * @param receiptId 경로 변수에서 가져온 영수증 ID (소유자 확인용)
     * @param receiptItemId 경로 변수에서 가져온 품목 ID
     * @return HTTP 상태 코드 (204 No Content 또는 404 Not Found)
     */
    @DeleteMapping("/{receiptItemId}")
    public ResponseEntity<Void> deleteReceiptItem(
            @PathVariable("userId") Long userId, // ⭐ userId 경로 변수 추가
            @PathVariable("receiptId") Long receiptId,
            @PathVariable("receiptItemId") Long receiptItemId) {
        try {
            boolean deleted = receiptItemService.deleteReceiptItem(receiptItemId);
            // TODO: 실제 구현 시, 삭제 대상 품목의 receiptId에 연결된 영수증의 userId가 path variable의 userId와 일치하는지 확인
            if (deleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            System.err.println("영수증 품목 삭제 중 오류: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            System.err.println("영수증 품목 삭제 중 예상치 못한 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 영수증에 속하는 모든 품목을 삭제합니다. (영수증 자체 삭제 시 활용)
     * DELETE /api/v1/users/{userId}/receipts/{receiptId}/items
     *
     * @param userId 경로 변수에서 가져온 사용자 ID (권한 확인용)
     * @param receiptId 경로 변수에서 가져온 영수증 ID
     * @return 삭제된 품목의 총 개수와 HTTP 상태 코드 (200 OK)
     */
    @DeleteMapping // ⭐ 이 경로의 DELETE 요청은 모든 품목 삭제로 간주 (주의 필요)
    public ResponseEntity<Integer> deleteReceiptItemsByReceiptId(
            @PathVariable("userId") Long userId, // ⭐ userId 경로 변수 추가
            @PathVariable("receiptId") Long receiptId) {
        try {
            int deletedCount = receiptItemService.deleteReceiptItemsByReceiptId(receiptId);
            // TODO: 실제 구현 시, 삭제 대상 품목들의 receiptId에 연결된 영수증의 userId가 path variable의 userId와 일치하는지 확인
            return new ResponseEntity<>(deletedCount, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("영수증 품목 일괄 삭제 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 특정 영수증의 품목들을 사용자의 '내 재료'로 전환하여 등록합니다.
     * POST /api/v1/users/{userId}/receipts/{receiptId}/items/convert-to-user-ingredients
     *
     * @param userId 경로 변수에서 가져온 사용자 ID
     * @param receiptId 경로 변수에서 가져온 영수증 ID
     * @return 사용자의 '내 재료'로 추가된 품목 정보를 담은 응답 DTO 리스트
     */
    @PostMapping("/convert-to-user-ingredients")
    public ResponseEntity<List<UserIngredientResponseDTO>> convertReceiptItemsToUserIngredients(
            @PathVariable("userId") Long userId, // ⭐ userId 경로 변수 추가
            @PathVariable("receiptId") Long receiptId) {
        try {
            List<UserIngredientResponseDTO> responses = receiptItemService.convertToUserIngredients(userId, receiptId); // ⭐ 서비스 메서드에 userId 전달
            if (responses.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(responses, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("영수증 품목을 내 재료로 전환 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}