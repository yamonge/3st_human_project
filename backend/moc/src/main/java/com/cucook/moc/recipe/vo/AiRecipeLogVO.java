package com.cucook.moc.recipe.vo;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class AiRecipeLogVO {

    private Long aiRecipeLogId;         // AI 레시피 로그 ID (Oracle 시퀀스 사용)
    private String userId;              // 사용자 ID
    private String baseSourceCd;        // 기본 재료 소스 코드 (예: CAMERA, MANUAL)
    private String cameraSessionId;     // 카메라 세션 ID (카메라로 재료 입력 시)
    private String manualIngredients;   // 수동 입력 재료 목록 (콤마 구분 또는 JSON 형태)
    private String filterCuisineCd;     // 필터: 요리 스타일 코드 (예: KOR, CHN, JPN)
    private String filterDiffCd;        // 필터: 난이도 코드 (예: EASY, NORMAL, HARD)
    private String filterTimeCd;        // 필터: 조리 시간 코드 (예: 10M, 30M, 1H)
    private String govApiRaw;           // 정부 API 원본 응답 데이터 (JSON/XML)
    private String aiRequest;           // Gemini AI 요청 프롬프트
    private String aiResponse;          // Gemini AI 응답 데이터 (JSON)
    private Integer resultCnt;          // AI 레시피 추천 결과 개수
    private String createdId;           // 생성자 ID
    private Timestamp createdDate;      // 생성 일시 (DB 자동 입력)
}