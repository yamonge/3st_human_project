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
} from '@mj-studio/react-native-naver-map';
import Geolocation from '@react-native-community/geolocation';
import {Search, SlidersHorizontal, MessageCircle} from 'lucide-react-native';
import PermissionModal from '../../components/common/PermissionModal';
import styles from '../../styles/screens/map/MapMainScreenStyles';
import {colors} from '../../styles/common';

/**
 * 지도 메인 화면
 * - 네이버 지도 표시
 * - 검색바
 * - 현재 위치 표시
 * - 채팅방 FAB 버튼
 */
export default function MapMainScreen({navigation}) {
  // 지도 ref
  const mapRef = useRef(null);

  // 현재 위치
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // 검색어
  const [searchKeyword, setSearchKeyword] = useState('');

  // 마커 목록 (네이버 Places API에서 받아온 마트 정보)
  const [markers, setMarkers] = useState([]);

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

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setCurrentLocation({latitude, longitude});
        console.log('현재 위치:', latitude, longitude);
      },
      error => {
        console.error('위치 가져오기 실패:', error);
        Alert.alert('오류', '현재 위치를 가져올 수 없습니다.');
      },
      {enableHighAccuracy: false, timeout: 30000, maximumAge: 60000},
    );
  };

  // 검색 처리
  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    Keyboard.dismiss(); // 키보드 내리기
    console.log('검색:', searchKeyword);
    // TODO: 네이버 Places API 호출 (프론트에서 직접 호출)
    // 응답받은 모든 마트 정보를 markers에 저장 → 지도에 핀 표시
  };

  // 필터 모달 열기 (추후 구현)
  const handleFilterPress = () => {
    console.log('필터 모달 열기');
    // TODO: MapFilterModal 표시
  };

  // 채팅방 목록 이동 (추후 구현)
  const handleChatRoomPress = () => {
    console.log('채팅방 목록으로 이동');
    // TODO: navigation.navigate('ChatRoomList');
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
          bottom: 100,
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
        onInitialized={() => console.log('지도 초기화 완료!')}
        onCameraChanged={region => console.log('지도 이동:', region)}>
        {/* 마트 마커들 (네이버 Places API에서 받아온 모든 마트 위치에 표시) */}
        {markers.map((marker, index) => (
          <NaverMapMarkerOverlay
            key={index}
            latitude={marker.latitude}
            longitude={marker.longitude}
            anchor={{x: 0.5, y: 1}}
            onTap={() => console.log('마커 클릭:', marker)}
            // TODO: 마커 클릭 시 백엔드에 해당 마트의 게시물 조회 요청 → 모달 표시
          />
        ))}
      </NaverMapView>

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

        {/* 배지 (미읽은 메시지 있을 때만 빨간 원 표시) */}
        {/* TODO: 실제 미읽은 메시지 여부로 조건 변경 */}
        {true && <View style={styles.badge} />}
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
    </View>
  );
}
