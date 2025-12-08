package com.cucook.moc.receipt.service.impl;

import com.cucook.moc.receipt.dao.ReceiptItemDAO;
import com.cucook.moc.receipt.dto.request.ReceiptItemRequestDTO;
import com.cucook.moc.receipt.dto.response.ReceiptItemListResponseDTO;
import com.cucook.moc.receipt.dto.response.ReceiptItemResponseDTO;
import com.cucook.moc.receipt.service.ReceiptItemService;
import com.cucook.moc.receipt.vo.ReceiptItemVO;
import com.cucook.moc.user.dto.request.UserIngredientRequestDTO;
import com.cucook.moc.user.dto.response.UserIngredientResponseDTO;
import com.cucook.moc.user.service.UserIngredientService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReceiptItemServiceImpl implements ReceiptItemService {

    private final ReceiptItemDAO receiptItemDAO;
    private final UserIngredientService userIngredientService;

    @Autowired
    public ReceiptItemServiceImpl(ReceiptItemDAO receiptItemDAO,
                                  UserIngredientService userIngredientService) {
        this.receiptItemDAO = receiptItemDAO;
        this.userIngredientService = userIngredientService;
    }

    /**
     * 영수증 품목 하나를 추가합니다. (예: 수동으로 재료 추가 모달에서 사용)
     *
     * @param receiptId 해당 품목이 속할 영수증의 ID (아직 tb_receipt 테이블이 없으므로 임시로 이 ID를 사용)
     * @param requestDTO 추가할 품목 정보를 담은 요청 DTO
     * @param createdId 품목을 생성하는 사용자의 ID
     * @return 추가된 품목 정보를 담은 응답 DTO
     */
    @Override // ⭐ 인터페이스 구현 명시
    @Transactional // 데이터 변경 트랜잭션 적용
    public ReceiptItemResponseDTO addReceiptItem(Long receiptId, ReceiptItemRequestDTO requestDTO, Long createdId) {
        ReceiptItemVO vo = new ReceiptItemVO();
        // receiptItemId는 시퀀스 자동 생성을 위해 VO에 값을 설정하지 않음 (INSERT 쿼리의 selectKey가 처리)
        vo.setReceiptId(receiptId);
        vo.setItemName(requestDTO.getItemName());
        vo.setItemQuantity(requestDTO.getItemQuantity());
        vo.setItemUnitPrice(requestDTO.getItemUnitPrice());
        vo.setItemTotalPrice(requestDTO.getItemTotalPrice());
        vo.setMappedIngredientName(requestDTO.getMappedIngredientName());
        vo.setCreatedId(createdId);

        int insertedCount = receiptItemDAO.insertReceiptItem(vo);
        if (insertedCount == 0 || vo.getReceiptItemId() == null) {
            throw new RuntimeException("영수증 품목 추가에 실패했습니다.");
        }

        return ReceiptItemResponseDTO.from(vo);
    }

    /**
     * 여러 영수증 품목을 일괄적으로 추가합니다. (예: OCR/AI 인식 결과 일괄 저장 시 사용)
     *
     * @param receiptId 해당 품목들이 속할 영수증의 ID
     * @param requestDTOs 일괄 추가할 품목 정보를 담은 요청 DTO 리스트
     * @param createdId 품목들을 생성하는 사용자의 ID
     * @return 일괄 추가된 품목 정보들을 담은 응답 DTO 리스트
     */
    @Override // ⭐ 인터페이스 구현 명시
    @Transactional // 데이터 변경 트랜잭션 적용
    public List<ReceiptItemResponseDTO> addReceiptItemsBatch(Long receiptId, List<ReceiptItemRequestDTO> requestDTOs, Long createdId) {
        if (requestDTOs == null || requestDTOs.isEmpty()) {
            return new ArrayList<>();
        }

        List<ReceiptItemVO> voList = requestDTOs.stream()
                .map(dto -> {
                    ReceiptItemVO vo = new ReceiptItemVO();
                    // receiptItemId는 시퀀스 자동 생성을 위해 DTO에서 받아도 VO에 설정하지 않음
                    vo.setReceiptId(receiptId);
                    vo.setItemName(dto.getItemName());
                    vo.setItemQuantity(dto.getItemQuantity());
                    vo.setItemUnitPrice(dto.getItemUnitPrice());
                    vo.setItemTotalPrice(dto.getItemTotalPrice());
                    vo.setMappedIngredientName(dto.getMappedIngredientName());
                    vo.setCreatedId(createdId);
                    return vo;
                })
                .collect(Collectors.toList());

        int insertedCount = receiptItemDAO.insertReceiptItemsBatch(voList);
        if (insertedCount != voList.size()) {
            System.err.println("경고: 일부 영수증 품목이 일괄 추가에 실패했습니다. (성공: " + insertedCount + ", 요청: " + voList.size() + ")");
        }

        // 일괄 삽입 후에는 VO에 시퀀스 ID가 채워지지 않으므로, 다시 조회하여 DTO로 반환합니다.
        // 이는 성능상 비효율적일 수 있으나, 정확한 ID를 포함한 응답을 위해 필요합니다.
        return receiptItemDAO.selectReceiptItemsByReceiptId(receiptId).stream()
                .map(ReceiptItemResponseDTO::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 영수증 ID에 해당하는 모든 품목 목록을 조회합니다.
     * @param receiptId 품목 목록을 조회할 영수증의 ID
     * @return 해당 영수증 품목 목록과 총 개수를 담은 응답 DTO
     */
    @Override // ⭐ 인터페이스 구현 명시
    @Transactional(readOnly = true)
    public ReceiptItemListResponseDTO getReceiptItemsByReceiptId(Long receiptId) {
        List<ReceiptItemVO> voList = receiptItemDAO.selectReceiptItemsByReceiptId(receiptId);
        List<ReceiptItemResponseDTO> dtoList = voList.stream()
                .map(ReceiptItemResponseDTO::from)
                .collect(Collectors.toList());
        return new ReceiptItemListResponseDTO(dtoList, dtoList.size());
    }

    /**
     * 특정 영수증 품목의 상세 정보를 조회합니다.
     * @param receiptItemId 조회할 품목의 ID
     * @return 상세 품목 정보를 담은 응답 DTO 또는 null (해당 품목이 없을 경우)
     */
    @Override // ⭐ 인터페이스 구현 명시
    @Transactional(readOnly = true)
    public ReceiptItemResponseDTO getReceiptItemDetail(Long receiptItemId) {
        ReceiptItemVO vo = receiptItemDAO.selectReceiptItemById(receiptItemId);
        if (vo == null) {
            throw new IllegalArgumentException("해당 영수증 품목을 찾을 수 없습니다.");
        }
        return ReceiptItemResponseDTO.from(vo);
    }

    /**
     * 기존 영수증 품목 정보를 수정합니다.
     * @param receiptItemId 수정할 품목의 ID
     * @param requestDTO 수정할 품목 정보를 담은 요청 DTO
     * @param updatedId 품목을 수정하는 사용자의 ID
     * @return 수정된 품목 정보를 담은 응답 DTO
     * @throws IllegalArgumentException 해당 품목을 찾을 수 없을 경우
     */
    @Override // ⭐ 인터페이스 구현 명시
    @Transactional
    public ReceiptItemResponseDTO updateReceiptItem(Long receiptItemId, ReceiptItemRequestDTO requestDTO, Long updatedId) {
        ReceiptItemVO existingVo = receiptItemDAO.selectReceiptItemById(receiptItemId);
        if (existingVo == null) {
            throw new IllegalArgumentException("수정할 영수증 품목을 찾을 수 없습니다.");
        }

        // DTO의 필드가 null이 아닌 경우에만 업데이트 (Partial Update)
        Optional.ofNullable(requestDTO.getItemName()).filter(name -> !name.isEmpty()).ifPresent(existingVo::setItemName);
        Optional.ofNullable(requestDTO.getItemQuantity()).ifPresent(existingVo::setItemQuantity);
        Optional.ofNullable(requestDTO.getItemUnitPrice()).ifPresent(existingVo::setItemUnitPrice);
        Optional.ofNullable(requestDTO.getItemTotalPrice()).ifPresent(existingVo::setItemTotalPrice);
        Optional.ofNullable(requestDTO.getMappedIngredientName()).ifPresent(existingVo::setMappedIngredientName);
        existingVo.setUpdatedId(updatedId);
        // existingVo.setReceiptId(requestDTO.getReceiptId()); // receiptId는 변경되지 않는다고 가정

        int updatedCount = receiptItemDAO.updateReceiptItem(existingVo);
        if (updatedCount == 0) {
            throw new RuntimeException("영수증 품목 정보 수정에 실패했습니다.");
        }

        return ReceiptItemResponseDTO.from(existingVo);
    }

    /**
     * 특정 영수증 품목을 삭제합니다.
     * @param receiptItemId 삭제할 품목의 ID
     * @return 삭제 성공 여부 (true/false)
     * @throws IllegalArgumentException 해당 품목을 찾을 수 없을 경우
     */
    @Override // ⭐ 인터페이스 구현 명시
    @Transactional
    public boolean deleteReceiptItem(Long receiptItemId) {
        ReceiptItemVO existingVo = receiptItemDAO.selectReceiptItemById(receiptItemId);
        if (existingVo == null) {
            throw new IllegalArgumentException("삭제할 영수증 품목을 찾을 수 없습니다.");
        }
        int deletedCount = receiptItemDAO.deleteReceiptItem(receiptItemId);
        return deletedCount > 0;
    }

    /**
     * 특정 영수증에 속하는 모든 품목을 삭제합니다.
     * @param receiptId 모든 품목을 삭제할 영수증의 ID
     * @return 삭제된 품목의 총 개수
     */
    @Override // ⭐ 인터페이스 구현 명시
    @Transactional
    public int deleteReceiptItemsByReceiptId(Long receiptId) {
        return receiptItemDAO.deleteReceiptItemsByReceiptId(receiptId);
    }

    /**
     * 특정 영수증의 품목들을 사용자의 '내 재료'로 전환하여 등록합니다.
     * @param userId 품목을 '내 재료'로 등록할 사용자의 ID
     * @param receiptId 품목들을 가져올 영수증의 ID
     * @return 사용자의 '내 재료'로 추가된 품목 정보를 담은 응답 DTO 리스트
     */
    @Override // ⭐ 인터페이스 구현 명시
    @Transactional // 여러 DB 작업(조회 후 삽입)이므로 트랜잭션 적용
    public List<UserIngredientResponseDTO> convertToUserIngredients(Long userId, Long receiptId) {
        // 1. 특정 영수증에 해당하는 모든 품목(ReceiptItemVO)을 DB에서 조회
        List<ReceiptItemVO> receiptItems = receiptItemDAO.selectReceiptItemsByReceiptId(receiptId);

        if (receiptItems.isEmpty()) {
            return new ArrayList<>();
        }

        // 2. 각 ReceiptItemVO를 UserIngredientRequestDTO로 변환
        List<UserIngredientRequestDTO> userIngredientRequests = receiptItems.stream()
                .map(item -> {
                    UserIngredientRequestDTO request = new UserIngredientRequestDTO();
                    request.setIngredientName(item.getMappedIngredientName() != null && !item.getMappedIngredientName().isEmpty() ? item.getMappedIngredientName() : item.getItemName());

                    // quantityDesc는 ReceiptItemVO의 quantity를 문자열로 변환
                    if (item.getItemQuantity() != null && item.getItemQuantity().compareTo(BigDecimal.ZERO) > 0) {
                        request.setQuantityDesc(item.getItemQuantity().toPlainString() + "개"); // 예시: "1.5개"
                    } else {
                        request.setQuantityDesc(null);
                    }

                    request.setCategoryCd(null); // 영수증 품목에는 카테고리 정보가 없으므로 null 또는 기본값.
                    request.setUsedFlag("N"); // 새로 추가되므로 미사용

                    request.setExpiredDate(LocalDate.now().plusMonths(1)); // 예시: 한달 뒤로 기본 유통기한 설정

                    request.setMemo("영수증 인식으로 추가됨 (품목: " + item.getItemName() + ")");
                    return request;
                })
                .collect(Collectors.toList());

        // 3. UserIngredientService를 사용하여 '내 재료'로 일괄 추가
        List<UserIngredientResponseDTO> addedUserIngredients = new ArrayList<>();
        for (UserIngredientRequestDTO request : userIngredientRequests) {
            try {
                UserIngredientResponseDTO response = userIngredientService.addUserIngredient(userId, request);
                addedUserIngredients.add(response);
            } catch (Exception e) {
                System.err.println("영수증 품목 ('" + request.getIngredientName() + "')을 사용자 재료로 추가 실패: " + e.getMessage());
            }
        }
        return addedUserIngredients;
    }
}