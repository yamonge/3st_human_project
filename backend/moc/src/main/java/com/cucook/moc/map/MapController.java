package com.cucook.moc.map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

/**
 * 지도 API 컨트롤러
 * - 네이버 검색 API 프록시
 */
@RestController
@RequestMapping("/api/map")
@CrossOrigin(origins = "*") // React Native에서 호출 허용
public class MapController {

    @Value("${naver.client.id}")
    private String clientId;

    @Value("${naver.client.secret}")
    private String clientSecret;

    /**
     * 네이버 장소 검색 API 프록시
     * @param query 검색어
     * @param display 검색 결과 개수 (기본 20개)
     * @return 네이버 API 응답
     */
    @GetMapping("/search")
    public ResponseEntity<String> searchPlaces(
            @RequestParam String query,
            @RequestParam(defaultValue = "20") int display) {

        try {
            // 네이버 검색 API URL
            String url = String.format(
                    "https://openapi.naver.com/v1/search/local.json?query=%s&display=%d",
                    query, display
            );

            // HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Naver-Client-Id", clientId);
            headers.set("X-Naver-Client-Secret", clientSecret);

            // API 호출
            RestTemplate restTemplate = new RestTemplate();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"검색 실패\"}");
        }
    }
}
