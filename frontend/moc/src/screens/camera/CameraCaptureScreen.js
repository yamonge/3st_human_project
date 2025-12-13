import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import {X, Camera as CameraIcon} from 'lucide-react-native';
import {useFocusEffect} from '@react-navigation/native';
import {styles} from '../../styles/screens/camera/cameraStyles';
import {recognizeIngredients} from '../../api/camera';
import PermissionModal from '../../components/common/PermissionModal';

export default function CameraCaptureScreen({navigation}) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const camera = useRef(null);
  const device = useCameraDevice('back');

  useFocusEffect(
    React.useCallback(() => {
      checkCameraPermission();
      return () => setShowPermissionModal(false);
    }, []),
  );

  const checkCameraPermission = async () => {
    try {
      setIsLoading(true);
      const permission = await Camera.getCameraPermissionStatus();

      if (permission === 'granted') {
        setHasPermission(true);
        setShowPermissionModal(false);
      } else if (permission === 'not-determined') {
        const newPermission = await Camera.requestCameraPermission();
        setHasPermission(newPermission === 'granted');
        setShowPermissionModal(newPermission !== 'granted');
      } else {
        setHasPermission(false);
        setShowPermissionModal(true);
      }
    } catch (e) {
      Alert.alert('오류', '카메라 권한 확인 중 오류 발생');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (!camera.current || isRecognizing) return;

    try {
      setIsRecognizing(true);

      // 1️⃣ 사진 촬영
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'balanced',
        flash: 'off',
      });

      console.log('📸 사진 촬영 완료:', photo.path);

      // 2️⃣ OCR API 호출 (userId ❌)
      const ocrResult = await recognizeIngredients(photo.path);

      // 방어 코드
      if (!ocrResult?.ingredients || ocrResult.ingredients.length === 0) {
        Alert.alert('안내', '인식된 재료가 없습니다.');
        return;
      }

      // 3️⃣ 화면에서 쓰기 좋은 형태로 변환
      const ingredients = ocrResult.ingredients.map(name => ({
        id: Date.now() + Math.random(),
        name,
      }));

      // 4️⃣ 결과 화면 이동
      navigation.navigate('IngredientResult', {
        photoPath: photo.path,
        recognizedIngredients: ingredients,
        from: 'camera',
      });
    } catch (error) {
      console.error('📛 takePhoto error:', error);
      Alert.alert('오류', '재료 인식 중 문제가 발생했습니다.');
    } finally {
      setIsRecognizing(false);
    }
  };

  if (isLoading || !hasPermission || !device) {
    return (
      <View style={styles.loadingContainer}>
        {isLoading && <ActivityIndicator size="large" color="#00B8DB" />}

        <PermissionModal
          visible={showPermissionModal}
          title="카메라 권한 필요"
          message="영수증 촬영을 위해 카메라 권한이 필요합니다."
          onCancel={() => navigation.goBack()}
          onConfirm={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent barStyle="light-content" />

      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        photo
      />

      {isRecognizing && (
        <View style={styles.recognizingOverlay}>
          <ActivityIndicator size="large" color="#00B8DB" />
          <Text style={styles.recognizingText}>재료 인식 중...</Text>
        </View>
      )}

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            disabled={isRecognizing}>
            <X color="#FFF" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>영수증 촬영</Text>
          <View />
        </View>

        <View style={styles.guideFrame} />

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePhoto}
            disabled={isRecognizing}>
            <View style={styles.captureButtonInner}>
              <CameraIcon color="#00B8DB" size={32} />
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
