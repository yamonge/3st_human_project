package com.cucook.moc.user.vo; // ⭐ user 패키지 아래에 vo를 생성

import lombok.Data;
import java.sql.Timestamp;

@Data
public class UserReviewVO {

    private Long reviewId;          // DDL: user_review_id NUMBER(19) -> Java Long
    private Long targetUserId;      // DDL: target_user_id NUMBER(19) -> Java Long
    private Long writerUserId;      // DDL: writer_user_id NUMBER(19) -> Java Long
    private Long shoppingPostId;    // DDL: shopping_post_id NUMBER(19) -> Java Long
    private Integer rating;         // DDL: rating NUMBER(2)          -> Java Integer (1~5점)
    private String userReviewComment; // DDL: user_review_comment VARCHAR2(1000) -> Java String
    private Timestamp createdDate;  // DDL: created_date TIMESTAMP(6)   -> Java Timestamp
}