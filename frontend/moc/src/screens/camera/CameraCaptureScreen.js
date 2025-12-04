import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import {X, Camera as CameraIcon} from 'lucide-react-native';
import {useFocusEffect} from '@react-navigation/native';
import {styles} from '../../styles/cameraStyles';
import LinearGradient from 'react-native-linear-gradient';

export default function CameraCaptureScreen({navigation}) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const camera = useRef(null);
  const device = useCameraDevice('back');

  // 화면이 focus될 때마다 권한 체크
  useFocusEffect(
    React.useCallback(() => {
      console.log('📷 CameraCaptureScreen focused - 권한 체크 시작');
      checkCameraPermission();

      return () => {
        console.log('📷 CameraCaptureScreen unfocused');
        // 화면 나갈 때 모달 닫기
        setShowPermissionModal(false);
      };
    }, []),
  );

  const checkCameraPermission = async () => {
    try {
      setIsLoading(true);
      const permission = await Camera.getCameraPermissionStatus();
      console.log('📷 카메라 권한 상태:', permission);

      if (permission === 'granted') {
        setHasPermission(true);
        setShowPermissionModal(false);
      } else if (permission === 'not-determined') {
        const newPermission = await Camera.requestCameraPermission();
        const granted = newPermission === 'granted';
        setHasPermission(granted);
        setShowPermissionModal(!granted);
      } else {
        // 권한 거부됨
        console.log('❌ 권한 거부 상태 → 모달 표시');
        setHasPermission(false);
        setShowPermissionModal(true);
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      Alert.alert('오류', '카메라 권한 확인 중 오류가 발생했습니다.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!camera.current) return;

    try {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'balanced',
        flash: 'off',
      });

      console.log('Photo taken:', photo);

      // TODO: 다음 화면(재료 인식 결과)으로 이동
      Alert.alert('촬영 완료', `경로: ${photo.path}`);

      // navigation.navigate('IngredientResult', { photoPath: photo.path });
    } catch (error) {
      console.error('Take photo error:', error);
      Alert.alert('오류', '사진 촬영 중 오류가 발생했습니다.');
    }
  };

  // 로딩 중이거나 권한 없을 때
  if (isLoading || !hasPermission || !device) {
    return (
      <View style={styles.loadingContainer}>
        {isLoading && <ActivityIndicator size="large" color="#00B8DB" />}

        {/* 권한 요청 모달 */}
        <Modal
          visible={showPermissionModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setShowPermissionModal(false);
            navigation.goBack();
          }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>카메라 권한 필요</Text>
              <Text style={styles.modalMessage}>
                영수증 촬영을 위해 카메라 권한이 필요합니다.{'\n'}
                설정에서 권한을 허용해주세요.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowPermissionModal(false);
                    navigation.goBack();
                  }}>
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <LinearGradient
                  colors={['#00B8DB', '#0095D5', '#0080CC', '#155DFC']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.confirmButton}>
                  <TouchableOpacity
                    style={styles.confirmButtonInner}
                    onPress={() => {
                      setShowPermissionModal(false);
                      Linking.openSettings();
                      navigation.goBack();
                    }}>
                    <Text style={styles.confirmButtonText}>설정으로 이동</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {!hasPermission
            ? '카메라 권한이 없습니다'
            : '카메라를 사용할 수 없습니다'}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* 카메라 뷰 */}
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* 상단 헤더 */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}>
            <X color="#FFFFFF" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>영수증 촬영</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* 가이드 프레임 */}
        <View style={styles.guideFrame}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
        </View>

        {/* 하단 컨트롤 */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
            <View style={styles.captureButtonInner}>
              <CameraIcon color="#00B8DB" size={32} />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
