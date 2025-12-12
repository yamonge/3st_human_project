package com.cucook.moc.admin.service;

import com.cucook.moc.admin.dao.AdminRecipeDAO;
import com.cucook.moc.admin.dto.request.AdminRecipeSearchRequestDTO;
import com.cucook.moc.admin.dto.response.AdminRecipeListItemResponseDTO;
import com.cucook.moc.admin.vo.AdminRecipeVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 관리자 레시피(게시글) 관리 비즈니스 로직 구현체
 */
@Service
@RequiredArgsConstructor
public class AdminRecipeServiceImpl implements AdminRecipeService {

    private final AdminRecipeDAO adminRecipeDAO;

    @Override
    public List<AdminRecipeListItemResponseDTO> getRecipeList(AdminRecipeSearchRequestDTO searchDTO) {

        List<AdminRecipeVO> voList = adminRecipeDAO.selectAdminRecipeList(searchDTO);
        List<AdminRecipeListItemResponseDTO> dtoList = new ArrayList<>();

        for (AdminRecipeVO vo : voList) {
            AdminRecipeListItemResponseDTO dto = new AdminRecipeListItemResponseDTO();
            dto.setRecipeId(vo.getRecipeId());
            dto.setTitle(vo.getTitle());
            dto.setOwnerNickname(vo.getOwnerNickname());
            dto.setIsPublic(vo.getIsPublic());
            dto.setReportCnt(vo.getReportCnt());
            dto.setCreatedDate(vo.getCreatedDate());
            dtoList.add(dto);
        }

        return dtoList;
    }

    @Override
    public void hideRecipe(Long recipeId) {
        adminRecipeDAO.updateRecipeVisibility(recipeId, "N");
    }

    @Override
    public void showRecipe(Long recipeId) {
        adminRecipeDAO.updateRecipeVisibility(recipeId, "Y");
    }

    @Override
    public void deleteRecipe(Long recipeId) {
        adminRecipeDAO.softDeleteRecipe(recipeId);
    }
}
