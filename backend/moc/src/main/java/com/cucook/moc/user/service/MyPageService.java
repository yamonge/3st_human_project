package com.cucook.moc.user.service;

import com.cucook.moc.user.dto.response.MyPageCountResponseDTO;

public interface MyPageService {

    MyPageCountResponseDTO getMyPageCounts(Long userId);

}
