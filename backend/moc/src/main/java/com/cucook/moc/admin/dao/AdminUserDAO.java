package com.cucook.moc.admin.dao;

import com.cucook.moc.admin.dto.request.AdminUserSearchRequestDTO;
import com.cucook.moc.admin.vo.AdminUserVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.sql.Timestamp;
import java.util.List;

/**
 * 관리자 회원 관리 DAO (tb_user)
 */
@Mapper
public interface AdminUserDAO {

    List<AdminUserVO> selectAdminUserList(AdminUserSearchRequestDTO searchDTO);

    AdminUserVO selectAdminUserById(@Param("userId") Long userId);

    int updateUserStatus(
            @Param("userId") Long userId,
            @Param("userStatus") String userStatus,
            @Param("suspendedUntil") Timestamp suspendedUntil,
            @Param("suspendedReason") String suspendedReason,
            @Param("adminUserId") Long adminUserId
    );

    /** adminUserId 가 관리자(user_type='Y') 인지 확인 */
    @Select("SELECT CASE WHEN COUNT(1) > 0 THEN 1 ELSE 0 END " +
            "FROM tb_user WHERE user_id = #{userId} AND user_type = 'Y'")
    boolean isAdminUser(@Param("userId") Long userId);
}
