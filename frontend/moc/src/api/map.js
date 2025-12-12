import axios from 'axios';
// import Config from 'react-native-config'; // TODO: Config 문제 해결 후 활성화

/**
 * 네이버 API 설정
 *
 * 임시: 직접 키 입력 (Config 문제로 인해)
 * TODO: react-native-config 문제 해결 후 환경변수로 전환
 */

// 네이버 개발자센터 API (장소 검색)
const NAVER_SEARCH_CLIENT_ID = 'aASIvSf843qMEpQ7iZ9W';
const NAVER_SEARCH_CLIENT_SECRET = '7msu9yy3zt';
const NAVER_SEARCH_API_URL = 'https://openapi.naver.com/v1/search/local.json';

// 네이버 클라우드 API (Reverse Geocoding)
const NAVER_CLOUD_CLIENT_ID = '28n51run07';
const NAVER_CLOUD_CLIENT_SECRET = 'Bd4EeHwOE05Xw77yYDQTw4VUd8HrO1XPY6W1jJ8g';
const NAVER_REVERSE_GEOCODING_API_URL =
  'https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc';

/**
 * 네이버 장소 검색 API 호출
 * @param {string} query - 검색어 (예: "천안 마트")
 * @param {number} display - 검색 결과 개수 (기본 20개)
 * @returns {Promise<Array>} 검색된 장소 목록
 */
export const searchPlaces = async (query, display = 20) => {
  try {
    const response = await axios.get(NAVER_SEARCH_API_URL, {
      params: {
        query: query,
        display: display,
      },
      headers: {
        'X-Naver-Client-Id': NAVER_SEARCH_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_SEARCH_CLIENT_SECRET,
      },
    });

    // 응답 데이터 가공
    const places = response.data.items.map(item => {
      const lat = convertToWGS84Lat(item.mapy);
      const lng = convertToWGS84Lng(item.mapx);
      console.log(
        `[좌표 변환] ${item.title}: mapx=${item.mapx}, mapy=${item.mapy} → lat=${lat}, lng=${lng}`,
      );

      return {
        name: item.title.replace(/<[^>]*>/g, ''), // HTML 태그 제거
        address: item.address,
        roadAddress: item.roadAddress,
        category: item.category,
        latitude: lat,
        longitude: lng,
      };
    });

    return places;
  } catch (error) {
    console.error('네이버 Places API 호출 실패:', error);
    throw error;
  }
};

/**
 * 네이버 좌표를 WGS84 위도로 변환
 * @param {string} naverY - 네이버 Y 좌표
 * @returns {number} WGS84 위도
 */
const convertToWGS84Lat = naverY => {
  return parseFloat(naverY) / 10000000;
};

/**
 * 네이버 좌표를 WGS84 경도로 변환
 * @param {string} naverX - 네이버 X 좌표
 * @returns {number} WGS84 경도
 */
const convertToWGS84Lng = naverX => {
  return parseFloat(naverX) / 10000000;
};

/**
 * 네이버 클라우드 Reverse Geocoding API 호출
 * 좌표 → 주소/지역명 변환
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 * @returns {Promise<string>} 지역명 (예: "천안시")
 */
export const reverseGeocode = async (latitude, longitude) => {
  console.log('[Reverse Geocoding 시작]', `lat=${latitude}, lng=${longitude}`);

  try {
    const coords = `${longitude},${latitude}`;
    console.log('[Reverse Geocoding 요청]', `coords=${coords}`);

    const response = await axios.get(NAVER_REVERSE_GEOCODING_API_URL, {
      params: {
        coords: coords, // 경도,위도 순서
        orders: 'roadaddr', // 도로명 주소 우선
        output: 'json',
      },
      headers: {
        'x-ncp-apigw-api-key-id': NAVER_CLOUD_CLIENT_ID,
        'x-ncp-apigw-api-key': NAVER_CLOUD_CLIENT_SECRET,
      },
    });

    console.log(
      '[Reverse Geocoding 응답]',
      JSON.stringify(response.data, null, 2),
    );

    // 응답 데이터 확인
    if (response.data.status.code !== 0) {
      console.error('[Reverse Geocoding 실패]', response.data.status.message);
      return '';
    }

    const results = response.data.results;
    if (results && results.length > 0) {
      const region = results[0].region;
      // 시/군/구 정보 추출 (예: "천안시")
      const area1 = region.area1.name; // 시/도 (예: "충청남도")
      const area2 = region.area2.name; // 시/군/구 (예: "천안시")
      const area3 = region.area3.name; // 읍/면/동 (예: "서북구")

      console.log('[Reverse Geocoding 성공]', `${area1} ${area2} ${area3}`);

      // "천안시" 같은 시/군/구 이름 반환
      const regionName = area2 || area1;
      console.log('[Reverse Geocoding 반환값]', regionName);
      return regionName;
    }

    console.log('[Reverse Geocoding] 결과 없음');
    return '';
  } catch (error) {
    console.error('[Reverse Geocoding API 호출 실패]', error.message);
    if (error.response) {
      console.error(
        '[Reverse Geocoding 에러 응답 - Status]',
        error.response.status,
      );
      console.error(
        '[Reverse Geocoding 에러 응답 - Headers]',
        JSON.stringify(error.response.headers, null, 2),
      );
      console.error(
        '[Reverse Geocoding 에러 응답 - Data]',
        JSON.stringify(error.response.data, null, 2),
      );
      console.error('[Reverse Geocoding 요청 헤더 확인]', {
        'x-ncp-apigw-api-key-id': NAVER_CLOUD_CLIENT_ID,
        'x-ncp-apigw-api-key': NAVER_CLOUD_CLIENT_SECRET,
      });
    }
    return '';
  }
};

// ============================================
// 백엔드 API (프로덕션용)
// ============================================

const BACKEND_BASE_URL = 'http://localhost:8080/api/map';

/**
 * 백엔드를 통한 네이버 장소 검색 API 호출
 * @param {string} query - 검색어 (예: "천안 마트")
 * @param {number} display - 검색 결과 개수 (기본 20개)
 * @returns {Promise<Array>} 검색된 장소 목록
 */
export const searchPlacesViaBackend = async (query, display = 5) => {
  try {
    const response = await axios.get(`${BACKEND_BASE_URL}/search`, {
      params: {
        query: query,
        display: display,
      },
    });

    // 백엔드에서 받은 네이버 API 응답 가공
    const places = response.data.items.map(item => {
      const lat = convertToWGS84Lat(item.mapy);
      const lng = convertToWGS84Lng(item.mapx);

      return {
        name: item.title.replace(/<[^>]*>/g, ''), // HTML 태그 제거
        address: item.address,
        roadAddress: item.roadAddress,
        category: item.category,
        latitude: lat,
        longitude: lng,
      };
    });

    return places;
  } catch (error) {
    console.error('백엔드 장소 검색 API 호출 실패:', error);
    throw error;
  }
};

/**
 * 백엔드를 통한 네이버 클라우드 Reverse Geocoding API 호출
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 * @returns {Promise<string>} 지역명 (예: "천안시")
 */
export const reverseGeocodeViaBackend = async (latitude, longitude) => {
  try {
    const coords = `${longitude},${latitude}`;

    const response = await axios.get(`${BACKEND_BASE_URL}/reverse-geocode`, {
      params: {
        coords: coords,
        orders: 'roadaddr',
        output: 'json',
      },
    });

    // 응답 데이터 확인
    if (response.data.status.code !== 0) {
      console.error(
        '[백엔드 Reverse Geocoding 실패]',
        response.data.status.message,
      );
      return '';
    }

    const results = response.data.results;
    if (results && results.length > 0) {
      const region = results[0].region;
      const area2 = region.area2.name; // 시/군/구
      const area1 = region.area1.name; // 시/도

      return area2 || area1;
    }

    return '';
  } catch (error) {
    console.error('[백엔드 Reverse Geocoding API 호출 실패]', error.message);
    return '';
  }
};

// ============================================
// 게시물 API
// ============================================

/**
 * 특정 위치의 게시물 조회
 * @param {string} storeName - 마트명 (예: "이마트 쌍용점")
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 * @returns {Promise<Array>} 게시물 목록
 */
export const getPostsByLocation = async (storeName, latitude, longitude) => {
  try {
    const response = await axios.get(`${BACKEND_BASE_URL}/posts`, {
      params: {
        storeName: storeName,
        latitude: latitude,
        longitude: longitude,
      },
    });

    return response.data;
  } catch (error) {
    console.error('[게시물 조회 API 호출 실패]', error.message);
    if (error.response) {
      console.error('[에러 상태]', error.response.status);
      console.error('[에러 데이터]', error.response.data);
    }
    throw error;
  }
};

/**
 * 게시물 작성
 * @param {object} postData - 게시물 데이터
 * @returns {Promise<object>} 생성된 게시물
 */
export const createPost = async postData => {
  try {
    const response = await axios.post(`${BACKEND_BASE_URL}/posts`, postData);
    return response.data;
  } catch (error) {
    console.error('[게시물 작성 API 호출 실패]', error.message);
    if (error.response) {
      console.error('[에러 상태]', error.response.status);
      console.error('[에러 데이터]', error.response.data);
    }
    throw error;
  }
};

/**
 * 게시물 참여
 * @param {number} postId - 게시물 ID
 * @returns {Promise<object>} 참여 결과
 */
export const joinPost = async postId => {
  try {
    const response = await axios.post(
      `${BACKEND_BASE_URL}/posts/${postId}/join`,
    );
    return response.data;
  } catch (error) {
    console.error('[게시물 참여 API 호출 실패]', error.message);
    if (error.response) {
      console.error('[에러 상태]', error.response.status);
      console.error('[에러 데이터]', error.response.data);
    }
    throw error;
  }
};
