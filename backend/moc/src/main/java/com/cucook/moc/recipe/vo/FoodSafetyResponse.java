package com.cucook.moc.recipe.vo;

import lombok.Data;

import java.util.List;

@Data
public class FoodSafetyResponse {
    private COOKRCP01 COOKRCP01; // API 응답의 루트 객체명

    @Data
    public static class COOKRCP01 {
        private String total_count;
        private List<RecipeVO> row; // 실제 레시피 데이터 목록
        private Result result;
    }

    @Data
    public static class RecipeVO {
        private String RCP_SEQ;           // 일련번호
        private String RCP_NM;            // 메뉴명
        private String RCP_PARTS_DTLS;    // 재료정보
        private String RCP_WAY2;          // 조리방법
        // ... 실제 API 응답 필드 모두 정의 ...
    }

    @Data
    public static class Result {
        private String MSG;
        private String CODE;
    }
}