package com.cucook.moc.user.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.sql.Timestamp;
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
    private Timestamp userBirthDate;
}
