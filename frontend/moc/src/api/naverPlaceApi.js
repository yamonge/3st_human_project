import axios from 'axios';

// // 👉 네이버 '검색 > 지역(Local)' API 키 (developers.naver.com에서 발급)
// const NAVER_CLIENT_ID = '9xZ4R3cFY8IXyoPAlj5j';
// const NAVER_CLIENT_SECRET = 'JBqepvncQn';

// // 👉 네이버 '지도 Geocoding' API 키 (Naver Cloud Platform에서 발급)
// const NCP_CLIENT_ID = 'pq3dgwzbry';
// const NCP_CLIENT_SECRET = 'iDterb1Jia2wPNTRq6GGnOcLLTUvW1BfhSWGXp2D';

// 아래 키들은 예시야. 실제 값은 네 키로 교체
const NAVER_SEARCH_CLIENT_ID = '9xZ4R3cFY8IXyoPAlj5j'; // 검색(Local API) client id
const NAVER_SEARCH_CLIENT_SECRET = 'hfHHrJeRB7';

const NCP_MAP_KEY_ID = '3sie0gdb7q'; // NCP 지도 Geocoding key id
const NCP_MAP_KEY = 'pLQvyzpRibkG478hufVZT8KAa2uV6pqxICV01rVQ';

export async function searchMarts(query) {
  try {
    const res = await axios.get(
      'https://openapi.naver.com/v1/search/local.json',
      {
        params: {
          query,
          display: 5,
          start: 1,
          sort: 'random',
        },
        headers: {
          'X-Naver-Client-Id': NAVER_SEARCH_CLIENT_ID,
          'X-Naver-Client-Secret': NAVER_SEARCH_CLIENT_SECRET,
        },
      },
    );
    return res.data.items;
  } catch (e) {
    console.log('🔴 searchMarts error status:', e.response?.status);
    console.log('🔴 searchMarts error data:', e.response?.data);
    throw e;
  }
}

export async function geocodeAddress(address) {
  try {
    const res = await axios.get(
      'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode',
      {
        params: {
          query: address,
        },
        headers: {
          'X-NCP-APIGW-API-KEY-ID': NCP_MAP_KEY_ID,
          'X-NCP-APIGW-API-KEY': NCP_MAP_KEY,
        },
      },
    );

    if (!res.data.addresses || res.data.addresses.length === 0) {
      return null;
    }

    const first = res.data.addresses[0];
    return {
      latitude: Number(first.y),
      longitude: Number(first.x),
    };
  } catch (e) {
    console.log('🔴 geocodeAddress error status:', e.response?.status);
    console.log('🔴 geocodeAddress error data:', e.response?.data);
    throw e;
  }
}
