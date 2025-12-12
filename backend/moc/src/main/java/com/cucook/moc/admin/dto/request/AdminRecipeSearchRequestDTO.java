package com.cucook.moc.admin.dto.request;

import lombok.*;

/**
 * 레시피(게시글) 목록 검색 조건 DTO (cursor 기반)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AdminRecipeSearchRequestDTO {

    /** 제목 또는 작성자 닉네임 검색 */
    private String keyword;

    /** ALL / PUBLIC / HIDDEN (tb_recipe.is_public 값에 매핑) */
    private String visibility;

    /** 마지막으로 조회한 recipe_id (첫 요청 시 null) */
    private Long lastRecipeId;

    /** 한 번에 조회할 데이터 수 */
    private Integer limit;
}