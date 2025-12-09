package com.cucook.moc.user.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PublicProfileDTO {
    private Long userId;                // 유저 식별용
    private String userNickname;        // 닉네임 (타인이 보는 이름)
    private Double ratingScore;         // 평균 평점 (tb_user.rating_score)
    private Integer shoppingCompletedCnt; // 장보기 완료 횟수 (tb_user.shopping_completed_cnt)
}
