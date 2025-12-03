package com.cucook.moc.user.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class FindEmailResponseDTO {
    private String userEmail;
}
