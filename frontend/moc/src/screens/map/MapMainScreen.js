import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  StatusBar,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import {
  NaverMapView,
  NaverMapMarkerOverlay,
  NaverMapCircleOverlay,
} from '@mj-studio/react-native-naver-map';
import Geolocation from '@react-native-community/geolocation';
import {getDistance} from 'geolib';
import {Search, SlidersHorizontal, MessageCircle} from 'lucide-react-native';
import PermissionModal from '../../components/common/PermissionModal';
import MapFilterModal from '../../components/map/MapFilterModal';
import PostListBottomSheet from '../../components/map/PostListBottomSheet';
import ChatRoomListModal from '../../components/chat/ChatRoomListModal';
import {searchPlaces, reverseGeocode, getPostsByLocation} from '../../api/map';
import styles from '../../styles/screens/map/MapMainScreenStyles';
import {colors} from '../../styles/common';
import useChatStore from '../../stores/chatStore';

/**
 * 지도 메인 화면
 * - 네이버 지도 표시
 * - 검색바
 * - 현재 위치 표시
 * - 채팅방 FAB 버튼
 */
export default function MapMainScreen({navigation}) {
  // 🔥 Zustand Store 연동 (미읽은 메시지 개수)
  const chatRooms = useChatStore(state => state.chatRooms);
  const totalUnread = chatRooms.reduce(
    (sum, room) => sum + (room.unreadCount || 0),
    0,
  );

  // 지도 ref
  const mapRef = useRef(null);

  // 현재 위치
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // 검색어
  const [searchKeyword, setSearchKeyword] = useState('');

  // 필터 모달
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    distance: 3,
  });

  // 마커 목록 (네이버 Places API에서 받아온 마트 정보)
  const [markers, setMarkers] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]); // 필터링 전 전체 데이터
  const [isSearched, setIsSearched] = useState(false); // 검색 여부

  // 현재 지역명 (역 지오코딩 결과)
  const [currentRegion, setCurrentRegion] = useState('');

  // 게시물 목록 바텀시트
  const [showPostList, setShowPostList] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // 채팅방 목록 모달
  const [showChatRoomList, setShowChatRoomList] = useState(false);

  // 마커 목록 ... 아래 아무 곳 state 구간에 추가
  const [isLoading, setIsLoading] = useState(false);

  // GPS 권한 요청 및 현재 위치 가져오기
  useEffect(() => {
    checkAndRequestPermission();
  }, []);

  const checkAndRequestPermission = async () => {
    if (Platform.OS === 'android') {
      // 권한 요청 (시스템 권한 창 표시)
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // 권한 허용 → 현재 위치 가져오기
        getCurrentLocation();
      } else {
        // 권한 거부 → 모달 표시
        setShowPermissionModal(true);
      }
    } else {
      // iOS는 바로 위치 가져오기 시도
      getCurrentLocation();
    }
  };

  // 주변 마트 자동 검색 (지역명 + 마트 키워드)
  const searchNearbyMarts = async (location, distanceKm, regionOverride) => {
    if (!location) return;

    try {
      setIsLoading(true);

      const region = regionOverride ?? currentRegion;
      const base = region ? `${region} 마트` : '마트';

      const places = await searchPlaces(base, 50);

      // 전체 결과 저장
      setAllPlaces(places);
      setIsSearched(true);

      // 거리 + 마트 필터링(현재 위치를 location으로 사용)
      const filtered = places
        .filter(p => p?.latitude && p?.longitude && isMartOrSuper(p))
        .map(p => ({...p, distance: calculateDistance(location, p)}))
        .filter(p => p.distance <= distanceKm)
        .sort((a, b) => a.distance - b.distance);

      setMarkers(filtered);

      if (filtered.length === 0) {
        Alert.alert('알림', '선택한 거리 내에 마트가 없습니다.');
      }
    } catch (e) {
      // 원인 파악용 로그(중요)
      console.error('[searchNearbyMarts error]', e);
      console.error('status:', e?.response?.status);
      console.error('data:', e?.response?.data);

      Alert.alert('오류', '주변 마트 검색 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    const onSuccess = async position => {
      const {latitude, longitude} = position.coords;

      const myLoc = {latitude, longitude};
      setCurrentLocation(myLoc);
      console.log('현재 위치:', latitude, longitude);

      let region = '';
      try {
        region = await reverseGeocode(latitude, longitude);
        setCurrentRegion(region);
        console.log('현재 지역:', region || '지역 미확인');
      } catch (error) {
        console.error('지역명 가져오기 실패:', error);
        setCurrentRegion('');
      }

      // ✅ 여기서 딱 1번만 호출
      await searchNearbyMarts(myLoc, filterOptions.distance, region);
    };

    const onError = error => {
      console.error('위치 가져오기 실패:', error);

      Alert.alert(
        '오류',
        `현재 위치를 가져올 수 없습니다.\n(code=${error?.code}) ${error?.message}`,
      );
    };

    // 1차: High Accuracy로 시도 (에뮬레이터 위치 주입 시 성공률 높음)
    Geolocation.getCurrentPosition(
      onSuccess,
      err1 => {
        console.error('1차(HighAccuracy) 실패:', err1);

        // TIMEOUT(3) / POSITION_UNAVAILABLE(2)면 2차 시도
        if (err1?.code === 3 || err1?.code === 2) {
          Geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 60000,
          });
          return;
        }

        onError(err1);
      },
      {enableHighAccuracy: true, timeout: 60000, maximumAge: 0},
    );
  };

  /**
   * 두 지점 간의 거리 계산 (geolib 사용)
   * @param {object} loc1 - 위치 1 {latitude, longitude}
   * @param {object} loc2 - 위치 2 {latitude, longitude}
   * @returns {number} 거리 (km)
   */
  const calculateDistance = (loc1, loc2) => {
    // geolib의 getDistance는 미터 단위로 반환하므로 1000으로 나눠서 km 변환
    const distanceInMeters = getDistance(
      {latitude: loc1.latitude, longitude: loc1.longitude},
      {latitude: loc2.latitude, longitude: loc2.longitude},
    );
    return distanceInMeters / 1000; // km 단위로 변환
  };

  /**
   * 장소가 마트/슈퍼인지 확인
   * @param {object} place - 장소 객체
   * @returns {boolean}
   */
  const isMartOrSuper = place => {
    return (
      place.category.includes('마트') ||
      place.category.includes('슈퍼') ||
      place.name.includes('마트') ||
      place.name.includes('슈퍼')
    );
  };

  /**
   * 장소 필터링 로직 (거리, 마트만)
   * @param {Array} places - 전체 장소 목록
   * @param {object} options - 필터 옵션 {distance}
   * @returns {Array} 필터링 및 거리순 정렬된 장소 목록
   */
  const applyPlaceFilter = (places, options) => {
    if (!currentLocation) return places;

    return (
      places
        .filter(place => {
          // 위도/경도 없으면 제외
          if (!place.latitude || !place.longitude) return false;

          // 마트 필터링
          if (!isMartOrSuper(place)) return false;

          // 거리 계산 및 체크
          const distance = calculateDistance(currentLocation, place);
          if (distance > options.distance) return false;

          // 거리 정보 추가
          place.distance = distance;
          return true;
        })
        // 거리순 정렬 (가까운 곳부터)
        .sort((a, b) => a.distance - b.distance)
    );
  };

  /**
   * 장소 필터링 (현재 filterOptions 사용)
   * @param {Array} places - 전체 장소 목록
   * @returns {Array} 필터링 및 거리순 정렬된 장소 목록
   */
  const filterPlaces = places => applyPlaceFilter(places, filterOptions);

  // 검색 처리
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    if (!currentLocation) {
      Alert.alert(
        '알림',
        '현재 위치를 가져오는 중입니다. 잠시 후 다시 시도해주세요.',
      );
      return;
    }

    Keyboard.dismiss(); // 키보드 내리기

    try {
      // 지역명 기반 검색
      const locationQuery = currentRegion
        ? `${currentRegion} ${searchKeyword}`
        : searchKeyword;
      console.log('검색 시작:', locationQuery);
      const places = await searchPlaces(locationQuery, 5);
      console.log('검색 결과:', places.length, '개');

      // 전체 검색 결과 확인 (이름, 카테고리, 거리)
      places.forEach((place, idx) => {
        const dist = currentLocation
          ? calculateDistance(currentLocation, place).toFixed(2)
          : 'N/A';
        console.log(
          `[${idx + 1}] ${place.name} | ${place.category} | ${dist}km`,
        );
      });

      // 전체 데이터 저장
      setAllPlaces(places);
      setIsSearched(true); // 검색 완료

      // 필터링 적용
      const filtered = filterPlaces(places);
      console.log('필터링 후:', filtered.length, '개');
      setMarkers(filtered);

      if (filtered.length === 0) {
        Alert.alert('알림', '필터 조건에 맞는 장소가 없습니다.');
      }
    } catch (error) {
      console.error('검색 실패:', error);
      Alert.alert('오류', '검색 중 문제가 발생했습니다.');
    }
  }; // 필터 모달 열기
  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  // 필터 적용
  const handleApplyFilter = async filters => {
    setFilterOptions(filters);
    setShowFilterModal(false);

    // 이미 후보(allPlaces)가 있으면 재필터링(빠름)
    if (allPlaces.length > 0) {
      const filtered = applyPlaceFilter(allPlaces, filters);
      setMarkers(filtered);

      if (filtered.length === 0) {
        Alert.alert('알림', '선택한 거리 내에 마트가 없습니다.');
      }
      return;
    }

    // 아직 후보가 없으면(=검색을 안했으면) 자동 검색 실행
    await searchNearbyMarts(filters.distance);
  };

  // 채팅방 목록 모달 열기
  const handleChatRoomPress = () => {
    setShowChatRoomList(true);
  };

  /**
   * 마커 클릭 핸들러
   * - 선택된 마커 정보 저장
   * - 게시물 목록 바텀시트 열기
   * - 게시물 데이터는 PostListBottomSheet 내부에서 로드
   */
  const handleMarkerPress = marker => {
    console.log('마커 클릭:', marker.name);
    setSelectedMarker(marker);
    setShowPostList(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* 네이버 지도 */}
      <NaverMapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || 36.8151,
          longitude: currentLocation?.longitude || 127.1139,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        isShowLocationButton={true}
        isShowCompass={true}
        isShowScaleBar={true}
        mapPadding={{
          top: 100,
          right: 20,
          bottom: 60,
          left: 20,
        }}
        locationOverlay={
          currentLocation
            ? {
                isVisible: true,
                position: currentLocation,
              }
            : undefined
        }
        onInitialized={() => console.log('지도 초기화 완료!')}>
        {/* onCameraChanged는 너무 자주 호출되어 로그 제거 */}
        {/* 현재 위치 반경 표시 (파란 원) - 검색했을 때만 */}
        {currentLocation && isSearched && (
          <NaverMapCircleOverlay
            latitude={currentLocation.latitude}
            longitude={currentLocation.longitude}
            radius={filterOptions.distance * 1000} // km를 m로 변환
            color="rgba(21, 93, 252, 0.2)" // 파란색 반투명
            outlineColor="rgba(21, 93, 252, 0.5)" // 파란색 테두리
            outlineWidth={2}
          />
        )}

        {/* 마트 마커들 (네이버 Places API에서 받아온 모든 마트 위치에 표시) */}
        {markers.map((marker, index) => (
          <NaverMapMarkerOverlay
            key={index}
            latitude={marker.latitude}
            longitude={marker.longitude}
            anchor={{x: 0.5, y: 1}}
            onTap={() => handleMarkerPress(marker)}
          />
        ))}
      </NaverMapView>
      {/* 로딩 */}
      {isLoading && (
        <View
          style={{
            position: 'absolute',
            top: 120,
            alignSelf: 'center',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: 10,
            borderRadius: 10,
          }}>
          <ActivityIndicator />
        </View>
      )}

      {/* 상단 검색바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          {/* 돋보기 아이콘 */}
          <Search size={20} color={colors.mapIconBlue} strokeWidth={2} />

          {/* 검색 입력 */}
          <TextInput
            style={styles.searchInput}
            placeholder="검색어를 입력해주세요."
            placeholderTextColor="#999999"
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            selectionColor="#155DFC"
            blurOnSubmit={true}
          />

          {/* 필터 아이콘 */}
          <TouchableOpacity
            onPress={handleFilterPress}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <SlidersHorizontal
              size={18}
              color={colors.mapIconBlue}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 우측 하단 채팅방 FAB 버튼 */}
      <TouchableOpacity
        style={styles.chatFab}
        onPress={handleChatRoomPress}
        activeOpacity={0.8}>
        <MessageCircle size={28} color={colors.textWhite} strokeWidth={2} />

        {/* 🔥 배지 (실제 미읽은 메시지 개수 표시) */}
        {totalUnread > 0 && (
          <View style={styles.badge}>
            {totalUnread <= 99 && (
              <Text style={styles.badgeText}>{totalUnread}</Text>
            )}
            {totalUnread > 99 && <Text style={styles.badgeText}>99+</Text>}
          </View>
        )}
      </TouchableOpacity>

      {/* GPS 권한 모달 */}
      <PermissionModal
        visible={showPermissionModal}
        title="위치 권한 필요"
        message={
          '주변 마트를 찾기 위해 위치 권한이 필요합니다.\n설정에서 권한을 허용해주세요.'
        }
        onCancel={() => {
          setShowPermissionModal(false);
          navigation.navigate('Home');
        }}
        onConfirm={() => {
          setShowPermissionModal(false);
          navigation.navigate('Home');
        }}
      />

      {/* 필터 모달 */}
      <MapFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilter}
      />

      {/* 게시물 목록 바텀시트 */}
      <PostListBottomSheet
        visible={showPostList}
        onClose={() => setShowPostList(false)}
        navigation={navigation}
        storeName={selectedMarker?.name || '선택된 장소'}
        selectedMarker={selectedMarker}
      />

      {/* 채팅방 목록 모달 */}
      <ChatRoomListModal
        visible={showChatRoomList}
        onClose={() => setShowChatRoomList(false)}
        navigation={navigation}
      />
    </View>
  );
}
