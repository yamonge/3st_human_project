package com.cucook.moc.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDate;


/*
* 아이디(이메일)찾기 : 유저이름 + 생년월일
* */
@Getter
@Setter
@NoArgsConstructor
@ToString
public class FindEmailRequestDTO {
    private String userName;
    private LocalDate userBirthDate;
}
