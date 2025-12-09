import React, {useState} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  NaverMapView,
  RenderAfterNavermapsLoaded,
  NaverMap,
  NaverMapMarkerOverlay,
} from '@mj-studio/react-native-naver-map';

import {searchMarts, geocodeAddress} from '../api/naverPlaceApi';

function TestJunseo() {
  const [location, setLocation] = useState(null); // { latitude, longitude }
  const [marts, setMarts] = useState([]); // [{ id, name, address, latitude, longitude }]
  const [selectedMart, setSelectedMart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // 1) 현재 위치 한 번 가져오기
  const getCurrentPositionOnce = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        pos => {
          const {latitude, longitude} = pos.coords;
          resolve({latitude, longitude});
        },
        err => {
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  };

  // 2) 현재 위치 기준으로 네이버에서 '마트' 검색 + 주소를 좌표로 변환 + 마커 데이터 구성
  const handleLoadNearbyMarts = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // (1) 위치 없으면 먼저 GPS 한 번 찍기
      let baseLocation = location;
      if (!baseLocation) {
        baseLocation = await getCurrentPositionOnce();
        setLocation(baseLocation);
      }

      // (2) 네이버 지역 검색 API로 "마트" 검색
      const localItems = await searchMarts('마트'); // 간단 테스트용 검색어

      // (3) 각 결과의 주소를 Geocoding 해서 위/경도로 변환
      const martsWithCoords = [];
      for (const item of localItems) {
        const cleanTitle = item.title.replace(/<[^>]+>/g, ''); // <b> 태그 제거
        const addr = item.roadAddress || item.address; // 도로명 우선

        const coords = await geocodeAddress(addr);
        if (!coords) continue;

        martsWithCoords.push({
          id: item.link || `${cleanTitle}-${addr}`,
          name: cleanTitle,
          address: addr,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      }

      setMarts(martsWithCoords);
      if (martsWithCoords.length > 0) {
        setSelectedMart(martsWithCoords[0]);
      }
    } catch (e) {
      console.log(e);
      setErrorMsg(e.message || '마트 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 지도 카메라 기준 좌표 (선택된 마트 우선, 없으면 내 위치)
  const center = selectedMart || location;
  const camera = center
    ? {
        latitude: center.latitude,
        longitude: center.longitude,
        zoom: 14,
      }
    : null;

  return (
    <View style={styles.container}>
      {/* 상단: 버튼 + 상태 */}
      <View style={styles.topPanel}>
        <Button
          title="현재 위치 + 주변 '마트' 검색"
          onPress={handleLoadNearbyMarts}
        />
        {loading && (
          <View style={styles.rowCenter}>
            <ActivityIndicator size="small" />
            <Text style={{marginLeft: 8}}>불러오는 중...</Text>
          </View>
        )}
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        {location && (
          <Text style={styles.coordText}>
            내 위치: {location.latitude.toFixed(5)},{' '}
            {location.longitude.toFixed(5)}
          </Text>
        )}
      </View>

      {/* 중앙: 네이버 지도 */}
      <View style={styles.mapContainer}>
        {camera ? (
          <NaverMap
            style={StyleSheet.absoluteFill}
            camera={camera}
            // showsMyLocationButton={true} // 필요하면 주석 해제
            onCameraChange={() => {}}
            onMapClick={() => setSelectedMart(null)}>
            {/* 내 위치 마커 */}
            {location && (
              <NaverMapMarkerOverlay
                latitude={location.latitude}
                longitude={location.longitude}
                caption={{text: '내 위치'}}
                onTap={() => setSelectedMart(null)}
              />
            )}

            {/* 마트 마커들 */}
            {marts.map(mart => (
              <NaverMapMarkerOverlay
                key={mart.id}
                latitude={mart.latitude}
                longitude={mart.longitude}
                caption={{text: mart.name}}
                onTap={() => setSelectedMart(mart)}
              />
            ))}
          </NaverMap>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text>버튼을 눌러 현재 위치와 마트를 불러와 주세요.</Text>
          </View>
        )}
      </View>

      {/* 하단: 선택된 마트 정보 + 리스트 */}
      <View style={styles.bottomPanel}>
        {selectedMart && (
          <View style={styles.selectedBox}>
            <Text style={styles.selectedTitle}>{selectedMart.name}</Text>
            <Text style={styles.selectedAddr}>{selectedMart.address}</Text>
            {/* TODO: 여기서 "이 마트에서 같이 장보기 글쓰기" 버튼 추가 → 백엔드에 place 정보 + 좌표 보내기 */}
          </View>
        )}

        <ScrollView style={styles.list}>
          {marts.map(mart => (
            <View key={mart.id} style={styles.listItem}>
              <Text
                style={styles.listTitle}
                onPress={() => setSelectedMart(mart)}>
                {mart.name}
              </Text>
              <Text style={styles.listAddr}>{mart.address}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export default TestJunseo;

const styles = StyleSheet.create({
  container: {flex: 1},
  topPanel: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  rowCenter: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  errorText: {color: 'red', marginTop: 8},
  coordText: {marginTop: 4, color: '#555'},
  mapContainer: {
    flex: 1.3,
    backgroundColor: '#ddd',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPanel: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: '#eee',
    padding: 8,
  },
  selectedBox: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 8,
  },
  selectedTitle: {fontWeight: 'bold', fontSize: 16},
  selectedAddr: {fontSize: 13, color: '#666', marginTop: 2},
  list: {marginTop: 4},
  listItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  listTitle: {fontWeight: 'bold'},
  listAddr: {fontSize: 12, color: '#555'},
});
