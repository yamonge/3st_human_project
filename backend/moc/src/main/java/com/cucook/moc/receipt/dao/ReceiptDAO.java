package com.cucook.moc.receipt.dao;

import com.cucook.moc.receipt.vo.ReceiptVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ReceiptDAO {

    /**
     * 영수증 메타 정보를 데이터베이스에 저장합니다.
     * `ReceiptMapper.xml`의 `<insert id="insertReceipt">`와 매핑됩니다.
     *
     * @param vo 저장할 ReceiptVO 객체 (user_id, camera_session_id, storeName 등 포함)
     * @return 삽입된 레코드 수
     */
    int insertReceipt(ReceiptVO vo);

    /**
     * 특정 영수증 ID로 단일 영수증 정보를 조회합니다.
     * `ReceiptMapper.xml`의 `<select id="selectReceiptById">`와 매핑됩니다.
     *
     * @param receiptId 조회할 영수증의 ID
     * @return 해당 영수증의 ReceiptVO 객체 또는 null
     */
    ReceiptVO selectReceiptById(Long receiptId);

    /**
     * 특정 사용자의 모든 영수증 목록을 조회합니다.
     * `ReceiptMapper.xml`의 `<select id="selectReceiptsByUserId">`와 매핑됩니다.
     *
     * @param userId 조회할 사용자의 ID
     * @return 해당 사용자의 ReceiptVO 리스트
     */
    List<ReceiptVO> selectReceiptsByUserId(Long userId);

    /**
     * 특정 영수증 정보를 수정합니다.
     * `ReceiptMapper.xml`의 `<update id="updateReceipt">`와 매핑됩니다.
     *
     * @param vo 수정할 ReceiptVO 객체
     * @return 수정된 레코드 수
     */
    int updateReceipt(ReceiptVO vo);

    /**
     * 특정 영수증을 삭제합니다.
     * `ReceiptMapper.xml`의 `<delete id="deleteReceipt">`와 매핑됩니다.
     * `@Param` 사용 시 Map을 생성할 필요 없이 명확합니다.
     *
     * @param receiptId 삭제할 영수증의 ID
     * @param userId 삭제를 요청하는 사용자의 ID (권한 확인용)
     * @return 삭제된 레코드 수
     */
    int deleteReceipt(@Param("receiptId") Long receiptId, @Param("userId") Long userId);

    /**
     * 특정 사용자의 영수증 총 개수를 조회합니다.
     * `ReceiptMapper.xml`의 `<select id="countReceiptsByUserId">`와 매핑됩니다.
     *
     * @param userId 조회할 사용자의 ID
     * @return 영수증의 총 개수
     */
    int countReceiptsByUserId(Long userId);
}