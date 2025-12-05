//package com.cucook.moc.recipe.service.impl;
//
//import com.cucook.moc.recipe.dao.AiRecipeLogDAO;
//import com.cucook.moc.recipe.service.AiRecipeLogService;
//import com.cucook.moc.recipe.vo.AiRecipeLogVO;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//
//@Service
//public class AiRecipeLogServiceImpl implements AiRecipeLogService {
//
//    private final AiRecipeLogDAO aiRecipeLogDAO;
//
//    @Autowired
//    public AiRecipeLogServiceImpl(AiRecipeLogDAO aiRecipeLogDAO) {
//        this.aiRecipeLogDAO = aiRecipeLogDAO;
//    }
//
//    /**
//     * AI 레시피 생성 로그를 저장합니다.
//     * 이 메서드는 워크플로우의 '7단계: AI 생성 로그 저장 (디버깅용)'에 해당하며,
//     * AI 레시피 생성 후 그 과정을 기록하는 데 사용됩니다.
//     *
//     * @param aiRecipeLogVO 저장할 AiRecipeLogVO 객체
//     * @return 삽입 성공 여부 (1 이상이면 성공)
//     */
//    @Override
//    @Transactional
//    public int saveAiRecipeLog(AiRecipeLogVO aiRecipeLogVO) {
//        return aiRecipeLogDAO.insertAiRecipeLog(aiRecipeLogVO);
//    }
//
//    /**
//     * 특정 조건에 맞는 AI 레시피 생성 로그 목록을 조회합니다.
//     * 이 메서드는 주로 관리자 페이지나 디버깅 목적으로 로그를 검색할 때 사용될 수 있습니다.
//     *
//     * @param searchVO 검색 조건을 담은 AiRecipeLogVO 객체
//     * @return 검색 조건에 맞는 AiRecipeLogVO 리스트
//     */
//    @Override
//    @Transactional(readOnly = true)
//    public List<AiRecipeLogVO> getAiRecipeLogs(AiRecipeLogVO searchVO) {
//        return aiRecipeLogDAO.searchAiRecipeLogs(searchVO);
//    }
//}