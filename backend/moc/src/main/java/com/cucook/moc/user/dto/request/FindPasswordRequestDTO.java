package com.cucook.moc.user.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;
/*
* 비밀번호 찾기 : 이메일 + 유저이름 + 생년월일
* */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class FindPwdRequestDTO {
    private String userEmail;
    private String userName;
    private LocalDate userBirthDate;
}
