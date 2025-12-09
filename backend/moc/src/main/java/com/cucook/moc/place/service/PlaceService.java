package com.cucook.moc.place.service;

import com.cucook.moc.place.dao.PlaceDAO;
import com.cucook.moc.place.dto.request.PlaceUpsertRequestDTO;
import com.cucook.moc.place.vo.PlaceVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PlaceService {

    @Autowired
    private PlaceDAO placeDAO;

    public Long upsertPlace(PlaceUpsertRequestDTO dto) {
        PlaceVO existing = placeDAO.selectByExternalId(
                dto.getMapProviderCd(),
                dto.getPlaceExternalId()
        );
        if (existing != null) {
            return existing.getPlaceId();
        }

        PlaceVO vo = new PlaceVO();
        vo.setMapProviderCd(dto.getMapProviderCd());
        vo.setPlaceExternalId(dto.getPlaceExternalId());
        vo.setPlaceName(dto.getPlaceName());
        vo.setAddress(dto.getAddress());
        vo.setLatitude(dto.getLatitude());
        vo.setLongitude(dto.getLongitude());

        placeDAO.insertPlace(vo);
        return vo.getPlaceId();
    }
}
