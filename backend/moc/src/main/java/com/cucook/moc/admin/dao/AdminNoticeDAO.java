package com.cucook.moc.admin.dao;

import com.cucook.moc.admin.dto.request.AdminNoticeSearchRequestDTO;
import com.cucook.moc.admin.vo.AdminNoticeVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 공지사항 관리 DAO (tb_notice)
 */
@Mapper
public interface AdminNoticeDAO {

    List<AdminNoticeVO> selectNoticeList(AdminNoticeSearchRequestDTO searchDTO);

    AdminNoticeVO selectNoticeById(@Param("noticeId") Long noticeId);

    int insertNotice(AdminNoticeVO noticeVO);

    int updateNotice(AdminNoticeVO noticeVO);

    int updateNoticePin(
            @Param("noticeId") Long noticeId,
            @Param("isPinned") String isPinned,
            @Param("adminUserId") Long adminUserId
    );

    int deleteNotice(@Param("noticeId") Long noticeId);
}
