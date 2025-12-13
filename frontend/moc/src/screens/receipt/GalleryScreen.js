import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {X, Image as ImageIcon} from 'lucide-react-native';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import LinearGradient from 'react-native-linear-gradient';
import styles from '../../styles/screens/receipt/GalleryScreenStyles';

const GalleryScreen = ({navigation, route}) => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState(null);
  const from = route.params?.from; // 'receipt' 또는 'profile'

  useEffect(() => {
    loadPhotos();
  }, []);

  // 사진 불러오기
  const loadPhotos = async () => {
    try {
      setIsLoading(true);

      const result = await CameraRoll.getPhotos({
        first: 20,
        assetType: 'Photos',
        after: endCursor,
      });

      const newPhotos = result.edges.map(edge => ({
        uri: edge.node.image.uri,
        id: edge.node.id || edge.node.image.uri,
      }));

      setPhotos(prev => [...prev, ...newPhotos]);
      setHasNextPage(result.page_info.has_next_page);
      setEndCursor(result.page_info.end_cursor);
    } catch (error) {
      console.error('📷 갤러리 사진 로드 실패:', error);
      Alert.alert('오류', '사진을 불러오는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 사진 선택
  const handleSelectPhoto = photo => {
    setSelectedPhoto(photo);
  };

  // 선택한 사진 업로드
  const handleUpload = () => {
    if (!selectedPhoto) {
      Alert.alert('안내', '사진을 선택해주세요.');
      return;
    }

    console.log('📷 선택한 사진:', selectedPhoto.uri);

    // from에 따라 분기 처리
    if (from === 'profile') {
      // 프로필 수정 화면으로 돌아가면서 이미지 전달
      navigation.navigate('ProfileEdit', {
        selectedImage: selectedPhoto.uri,
      });
    } else {
      // 재료 인식 결과 화면으로 이동
      navigation.navigate('IngredientResult', {
        photoPath: selectedPhoto.uri,
        recognizedIngredients: [], // 빈 배열 → 더미 데이터 사용
        from: 'gallery', // 갤러리에서 왔음을 표시
      });
    }
  };

  // 그리드 아이템 렌더링
  const renderPhotoItem = ({item}) => {
    const isSelected = selectedPhoto?.id === item.id;

    return (
      <TouchableOpacity
        style={[styles.photoItem, isSelected && styles.photoItemSelected]}
        onPress={() => handleSelectPhoto(item)}
        activeOpacity={0.8}>
        <Image source={{uri: item.uri}} style={styles.photoImage} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <X color="white" size={24} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>갤러리</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* 사진 그리드 */}
      {isLoading && photos.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00B8DB" />
          <Text style={styles.loadingText}>사진을 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={item => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
          onEndReached={() => {
            if (hasNextPage && !isLoading) {
              loadPhotos();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && photos.length > 0 ? (
              <ActivityIndicator size="small" color="#00B8DB" />
            ) : null
          }
        />
      )}

      {/* 하단 업로드 버튼 */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          onPress={handleUpload}
          activeOpacity={0.8}
          disabled={!selectedPhoto}
          style={{width: '100%'}}>
          <LinearGradient
            colors={
              selectedPhoto ? ['#00B8DB', '#155DFC'] : ['#9CA3AF', '#6B7280']
            }
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>
              {from === 'profile' ? '선택 완료' : '선택한 사진 업로드'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GalleryScreen;
