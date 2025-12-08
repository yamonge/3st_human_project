package com.cucook.moc.receipt.dao;

import com.cucook.moc.receipt.vo.ReceiptItemVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ReceiptItemDAO {

    /**
     * 영수증 품목 정보를 데이터베이스에 저장합니다.
     * `ReceiptItemMapper.xml`의 `<insert id="insertReceiptItem">`와 매핑됩니다.
     *
     * @param vo 저장할 ReceiptItemVO 객체
     * @return 삽입된 레코드 수
     */
    int insertReceiptItem(ReceiptItemVO vo);

    /**
     * 여러 영수증 품목 정보를 한 번에 저장합니다.
     * `ReceiptItemMapper.xml`의 `<insert id="insertReceiptItemsBatch">`와 매핑됩니다.
     *
     * @param items 저장할 ReceiptItemVO 객체 리스트
     * @return 총 삽입된 레코드 수
     */
    int insertReceiptItemsBatch(@Param("list") List<ReceiptItemVO> items); // ⭐ collection="list"와 일치하도록 @Param("list") 사용

    /**
     * 특정 영수증 ID에 해당하는 모든 품목 목록을 조회합니다.
     * `ReceiptItemMapper.xml`의 `<select id="selectReceiptItemsByReceiptId">`와 매핑됩니다.
     *
     * @param receiptId 조회할 영수증의 ID
     * @return 해당 영수증의 ReceiptItemVO 리스트
     */
    List<ReceiptItemVO> selectReceiptItemsByReceiptId(Long receiptId);

    /**
     * 특정 영수증 품목 ID로 단일 품목 정보를 조회합니다.
     * `ReceiptItemMapper.xml`의 `<select id="selectReceiptItemById">`와 매핑됩니다.
     *
     * @param receiptItemId 조회할 품목의 ID
     * @return 해당 품목의 ReceiptItemVO 객체 또는 null
     */
    ReceiptItemVO selectReceiptItemById(Long receiptItemId);

    /**
     * 특정 영수증 품목 정보를 수정합니다.
     * `ReceiptItemMapper.xml`의 `<update id="updateReceiptItem">`와 매핑됩니다.
     *
     * @param vo 수정할 ReceiptItemVO 객체
     * @return 수정된 레코드 수
     */
    int updateReceiptItem(ReceiptItemVO vo);

    /**
     * 특정 영수증 품목을 삭제합니다.
     * `ReceiptItemMapper.xml`의 `<delete id="deleteReceiptItem">`와 매핑됩니다.
     *
     * @param receiptItemId 삭제할 품목의 ID
     * @return 삭제된 레코드 수
     */
    int deleteReceiptItem(Long receiptItemId);

    /**
     * 특정 영수증 ID에 속하는 모든 품목을 삭제합니다.
     * `ReceiptItemMapper.xml`의 `<delete id="deleteReceiptItemsByReceiptId">`와 매핑됩니다.
     *
     * @param receiptId 삭제할 영수증의 ID
     * @return 삭제된 레코드 수
     */
    int deleteReceiptItemsByReceiptId(Long receiptId);
}