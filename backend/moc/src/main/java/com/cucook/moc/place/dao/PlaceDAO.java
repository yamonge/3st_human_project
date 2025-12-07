package com.cucook.moc.place.dao;

import com.cucook.moc.place.vo.PlaceVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PlaceDAO {

    PlaceVO selectByExternalId(@Param("mapProviderCd") String mapProviderCd,
                               @Param("placeExternalId") String placeExternalId);

    void insertPlace(PlaceVO vo);
}
