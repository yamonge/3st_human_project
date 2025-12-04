package com.cucook.moc.recipe.vo;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class RecipeVO {

    private Long recipeId;          // 레시피 ID (Oracle 시퀀스 사용)
    private String ownerUserId;     // 레시피 소유자 사용자 ID
    private String sourceType;      // 레시피 출처 타입 (예: AI_GENERATED, GOV_API, USER_UPLOAD)
    private String externalRefId;   // 외부 참조 ID (예: 정부 API 레시피 ID)
    private String title;           // 레시피 제목
    private String summary;         // 레시피 요약/간략 설명
    private String thumbnailUrl;    // 레시피 대표 썸네일 이미지 URL
    private String difficultyCd;    // 난이도 코드 (예: EASY, NORMAL, HARD)
    private Integer cookTimeMin;    // 조리 시간 (분 단위)
    private String cuisineStyleCd;  // 요리 스타일 코드 (예: KOR, CHN, JPN, WES)
    private String isPublic;        // 공개 여부 (Y/N)
    private String isDeleted;       // 삭제 여부 (Y/N)
    private Integer viewCnt;        // 조회수
    private Integer likeCnt;        // 좋아요 수
    private Integer reportCnt;      // 신고 수
    private String createdId;       // 생성자 ID
    private Timestamp createdDate;  // 생성 일시 (DB 자동 입력)
    private String updatedId;       // 최종 수정자 ID
    private Timestamp updatedDate;  // 최종 수정 일시
    private String category;
}