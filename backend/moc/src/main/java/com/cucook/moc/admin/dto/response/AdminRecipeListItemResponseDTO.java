package com.cucook.moc.admin.dto.response;

import lombok.*;
import java.sql.Timestamp;

/**
 * 레시피(게시글) 목록 응답 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AdminRecipeListItemResponseDTO {

    private Long recipeId;
    private String title;
    private String ownerNickname;

    /** tb_recipe.is_public 값 그대로 (Y/N) */
    private String isPublic;

    private Integer reportCnt;
    private Timestamp createdDate;
}
