import React, {useState, useEffect} from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MetaballNavigation from './src/navigation/MetaballNavigation';

// 온보딩 & 인증 화면
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import LoginScreen from './src/screens/user/LoginScreen';
import SignupScreen from './src/screens/user/SignupScreen';
import FindAccountScreen from './src/screens/user/FindAccountScreen';

// 메인 화면
import HomeScreen from './src/screens/home/HomeScreen';

// 카메라 플로우
import CameraCaptureScreen from './src/screens/camera/CameraCaptureScreen';
import IngredientResultScreen from './src/screens/camera/IngredientResultScreen';
import SaveOptionScreen from './src/screens/camera/SaveOptionScreen';
import RecipeFilterScreen from './src/screens/camera/RecipeFilterScreen';
import IngredientSelectionScreen from './src/screens/camera/IngredientSelectionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// TODO: 임시 화면들 (추후 실제 화면으로 교체)
function RecipeBoardScreen() {
  return null; // 추후 구현
}

function NotificationScreen() {
  return null; // 추후 구현
}

function ProfileScreen() {
  return null; // 추후 구현
}

function VoiceFlowScreen() {
  return null; // 추후 구현
}

function MapFlowScreen() {
  return null; // 추후 구현
}

/**
 * 메인 하단 탭 네비게이터
 * Metaball 스타일의 커스텀 네비게이션 바 사용
 */
function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <MetaballNavigation {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      {/* 하단 4개 탭 */}
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="RecipeBoard" component={RecipeBoardScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />

      {/* FAB 서브메뉴 화면들 */}
      <Tab.Screen
        name="Camera"
        component={CameraCaptureScreen}
        options={{
          tabBarButton: () => null, // 탭 바 완전히 숨김
        }}
      />
      <Tab.Screen name="Voice" component={VoiceFlowScreen} />
      <Tab.Screen name="Recipe" component={RecipeBoardScreen} />
      <Tab.Screen name="Receipt" component={CameraCaptureScreen} />
      <Tab.Screen name="Map" component={MapFlowScreen} />

      {/* 카메라 플로우 서브 화면들 (탭바 숨김) */}
      <Tab.Screen
        name="IngredientResult"
        component={IngredientResultScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="SaveOption"
        component={SaveOptionScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="RecipeFilter"
        component={RecipeFilterScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
      <Tab.Screen
        name="IngredientSelection"
        component={IngredientSelectionScreen}
        options={{
          tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * 루트 앱 컴포넌트
 *
 * 화면 플로우:
 * 1. 최초 실행: Onboarding → Login
 * 2. 재실행 (로그인 상태): MainApp (Home)
 * 3. 로그인 필요: Login → Signup / FindAccount
 * 4. 로그인 성공: MainApp
 */
function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  // 최초 실행 여부 및 로그인 상태 체크
  const checkFirstLaunch = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      // 온보딩 항상 표시 (개발용)
      setIsFirstLaunch(true);
      setIsLoggedIn(token !== null);
    } catch (error) {
      console.error('앱 초기화 에러:', error);
      setIsFirstLaunch(true);
      setIsLoggedIn(false);
    }
  };

  // 로딩 중
  if (isFirstLaunch === null || isLoggedIn === null) {
    return null; // TODO: 스플래시 화면 추가
  }

  // 초기 화면 결정 - 항상 온보딩부터 시작
  const getInitialRouteName = () => {
    return 'Onboarding'; // 항상 온보딩
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={getInitialRouteName()}
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}>
          {/* 온보딩 */}
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />

          {/* 인증 화면들 */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="FindAccount" component={FindAccountScreen} />

          {/* 메인 앱 (하단 탭 네비게이션) */}
          <Stack.Screen name="MainApp" component={MainTabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
