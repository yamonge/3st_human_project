package com.cucook.moc.recipe.service.impl;

import com.cucook.moc.recipe.dao.AiRecipeLogDAO;
import com.cucook.moc.recipe.service.AiRecipeLogService;
import com.cucook.moc.recipe.vo.AiRecipeLogVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.slf4j.Logger; // Logger 임포트
import org.slf4j.LoggerFactory; // LoggerFactory 임포트

@Service
public class AiRecipeLogServiceImpl implements AiRecipeLogService {

    private static final Logger logger = LoggerFactory.getLogger(AiRecipeLogServiceImpl.class); // 로거 선언

    private final AiRecipeLogDAO aiRecipeLogDAO;

    @Autowired
    public AiRecipeLogServiceImpl(AiRecipeLogDAO aiRecipeLogDAO) {
        this.aiRecipeLogDAO = aiRecipeLogDAO;
    }

    /**
     * AI 레시피 생성 로그를 저장합니다.
     * 이 메서드는 워크플로우의 '7단계: AI 생성 로그 저장 (디버깅용)'에 해당하며,
     * AI 레시피 생성 후 그 과정을 기록하는 데 사용됩니다.
     *
     * @param aiRecipeLogVO 저장할 AiRecipeLogVO 객체
     * @return 삽입 성공 여부 (1 이상이면 성공)
     */
    @Override
    @Transactional
    public int saveAiRecipeLog(AiRecipeLogVO aiRecipeLogVO) {
        // --- 여기부터 디버깅을 위한 로그 추가 ---
        if (aiRecipeLogVO != null) {
            logger.info("Saving AiRecipeLog: aiRecipeLogId={}, userId={}, resultCnt={}",
                    aiRecipeLogVO.getAiRecipeLogId(),
                    aiRecipeLogVO.getUserId(),
                    aiRecipeLogVO.getResultCnt()); // resultCnt 값 출력
            if (aiRecipeLogVO.getResultCnt() != null) {
                if (aiRecipeLogVO.getResultCnt() > 99999 || aiRecipeLogVO.getResultCnt() < -99999) {
                    logger.error("!!! Critical: resultCnt value {} is out of NUMBER(5,0) range in Oracle DB. !!!",
                            aiRecipeLogVO.getResultCnt());
                }
            } else {
                // resultCnt가 null인 경우에도 로그를 남깁니다.
                // 컬럼이 NULL을 허용하므로 이 자체는 오류가 아니지만, 혹시 다른 문제의 단서가 될 수 있습니다.
                logger.warn("AiRecipeLogVO.resultCnt is null. DB column is NUMBER(5,0) NULLABLE. Proceeding with null.");
            }
        } else {
            logger.warn("Attempting to save a null AiRecipeLogVO.");
        }
        // --- 여기까지 디버깅을 위한 로그 추가 ---

        return aiRecipeLogDAO.insertAiRecipeLog(aiRecipeLogVO);
    }

    /**
     * 특정 조건에 맞는 AI 레시피 생성 로그 목록을 조회합니다.
     * 이 메서드는 주로 관리자 페이지나 디버깅 목적으로 로그를 검색할 때 사용될 수 있습니다.
     *
     * @param searchVO 검색 조건을 담은 AiRecipeLogVO 객체
     * @return 검색 조건에 맞는 AiRecipeLogVO 리스트
     */
    @Override
    @Transactional(readOnly = true)
    public List<AiRecipeLogVO> getAiRecipeLogs(AiRecipeLogVO searchVO) {
        return aiRecipeLogDAO.searchAiRecipeLogs(searchVO);
    }
}
