package com.cucook.moc.user.service;

import com.cucook.moc.user.dto.request.UserIngredientRequestDTO;
import com.cucook.moc.user.dto.response.UserIngredientListResponseDTO;
import com.cucook.moc.user.dto.response.UserIngredientResponseDTO;

import java.util.List;

public interface UserIngredientService {

    /**
     * 새로운 사용자 재료를 추가합니다.
     *
     * @param userId 요청을 수행하는 사용자의 ID
     * @param requestDTO 추가할 재료 정보를 담은 요청 DTO
     * @return 추가된 재료 정보를 담은 응답 DTO
     */
    UserIngredientResponseDTO addUserIngredient(Long userId, UserIngredientRequestDTO requestDTO);

    /**
     * 특정 사용자의 모든 재료 목록을 조회합니다.
     * 마이페이지의 '재료 관리' 카드에 표시될 총 개수와 상세 목록을 제공합니다.
     *
     * @param userId 재료를 조회할 사용자의 ID
     * @return 사용자 재료 목록과 총 개수를 담은 응답 DTO
     */
    UserIngredientListResponseDTO getUserIngredients(Long userId);

    /**
     * 특정 사용자 재료의 상세 정보를 조회합니다.
     *
     * @param userId 요청을 수행하는 사용자의 ID (권한 확인용)
     * @param userIngredientId 조회할 특정 재료의 ID
     * @return 상세 재료 정보를 담은 응답 DTO 또는 null (해당 재료가 없을 경우)
     */
    UserIngredientResponseDTO getUserIngredientDetail(Long userId, Long userIngredientId);

    /**
     * 기존 사용자 재료 정보를 수정합니다.
     *
     * @param userId 요청을 수행하는 사용자의 ID (권한 확인용)
     * @param userIngredientId 수정할 특정 재료의 ID
     * @param requestDTO 수정할 재료 정보를 담은 요청 DTO
     * @return 수정된 재료 정보를 담은 응답 DTO
     * @throws IllegalArgumentException 해당 재료가 없거나 권한이 없을 경우
     */
    UserIngredientResponseDTO updateUserIngredient(Long userId, Long userIngredientId, UserIngredientRequestDTO requestDTO);

    /**
     * 특정 사용자 재료를 삭제합니다.
     *
     * @param userId 요청을 수행하는 사용자의 ID (권한 확인용)
     * @param userIngredientId 삭제할 특정 재료의 ID
     * @return 삭제 성공 여부 (true/false)
     * @throws IllegalArgumentException 해당 재료가 없거나 권한이 없을 경우
     */
    boolean deleteUserIngredient(Long userId, Long userIngredientId);

    /**
     * 특정 사용자가 보유한 재료의 총 개수를 조회합니다.
     * 마이페이지 메인 화면의 '재료 관리' 카드에 표시됩니다.
     *
     * @param userId 재료 개수를 조회할 사용자의 ID
     * @return 보유 재료의 총 개수
     */
    int countUserIngredients(Long userId);
}