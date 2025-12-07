package com.cucook.moc.recipe.vo;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class RecipeVO {

    private Long recipeId;          // DDL: NUMBER(19) -> VO: Long (정상 매핑)
    private Long ownerUserId;       // DDL: NUMBER(19) -> VO: Long (정상 매핑)
    private String sourceType;      // DDL: VARCHAR2(20) -> VO: String (정상 매핑)
    private String externalRefId;   // DDL: VARCHAR2(100) -> VO: String (정상 매핑)
    private String title;           // DDL: VARCHAR2(200) -> VO: String (정상 매핑)
    private String summary;         // DDL: VARCHAR2(1000) -> VO: String (정상 매핑)
    private String thumbnailUrl;    // DDL: VARCHAR2(500) -> VO: String (정상 매핑)
    private String difficultyCd;    // DDL: VARCHAR2(20) -> VO: String (정상 매핑)
    private Integer cookTimeMin;    // DDL: NUMBER(5) -> VO: Integer (정상 매핑)
    private String cuisineStyleCd;  // DDL: VARCHAR2(20) -> VO: String (정상 매핑)
    private String category;
    private String isPublic;        // DDL: CHAR(1) -> VO: String (정상 매핑)
    private String isDeleted;       // DDL: CHAR(1) -> VO: String (정상 매핑)
    private Integer viewCnt;        // DDL: NUMBER(10) -> VO: Integer (정상 매핑)
    private Integer likeCnt;        // DDL: NUMBER(10) -> VO: Integer (정상 매핑)
    private Integer reportCnt;      // DDL: NUMBER(10) -> VO: Integer (정상 매핑)
    private Long createdId;         // DDL: NUMBER(19) -> VO: Long (정상 매핑)
    private Timestamp createdDate;  // DDL: TIMESTAMP(6) -> VO: Timestamp (정상 매핑)
    private Long updatedId;         // DDL: NUMBER(19) -> VO: Long (정상 매핑)
    private Timestamp updatedDate;  // DDL: TIMESTAMP(6) -> VO: Timestamp (정상 매핑)
}