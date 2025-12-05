package com.cucook.moc.user.service;

import com.cucook.moc.user.dto.UpdateFcmTokenRequestDTO;
import com.cucook.moc.user.dto.request.*;
import com.cucook.moc.user.dto.response.FindEmailResponseDTO;
import com.cucook.moc.user.dto.response.LoginResponseDTO;

public interface UserService {

    boolean isDuplicateEmail(String userEmail);

    void signup(SignupRequestDTO request);

    LoginResponseDTO login(LoginRequestDTO request);

    FindEmailResponseDTO findLoginId(FindEmailRequestDTO request);

    void sendPasswordResetLink(FindPasswordRequestDTO request);

    void resetPasswordByToken(ResetPasswordConfirmRequestDTO request);

    void updateFcmToken(UpdateFcmTokenRequestDTO request);
}

