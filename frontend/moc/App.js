import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import MetaballNavigation from './src/navigation/MetaballNavigation';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 임시 화면 컴포넌트들
function HomeScreen() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Home Screen</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setCount(count + 1);
          Alert.alert('버튼 클릭!', `${count + 1}번 클릭했습니다`);
        }}>
        <Text style={styles.buttonText}>터치 테스트 버튼</Text>
        <Text style={styles.countText}>클릭 횟수: {count}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ChatScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Chat Screen</Text>
    </View>
  );
}

function ListScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>List Screen</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Profile Screen</Text>
    </View>
  );
}

// 서브메뉴 화면들
function CameraScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Camera Screen</Text>
    </View>
  );
}

function VideoScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Video Screen</Text>
    </View>
  );
}

function MusicScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Music Screen</Text>
    </View>
  );
}

function EditScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Edit Screen</Text>
    </View>
  );
}

function ShareScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Share Screen</Text>
    </View>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <MetaballNavigation {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tab.Screen name="Heart" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="List" component={ListScreen} />
      <Tab.Screen name="Tag" component={ProfileScreen} />
      {/* 서브메뉴 화면들 */}
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Video" component={VideoScreen} />
      <Tab.Screen name="Music" component={MusicScreen} />
      <Tab.Screen name="Edit" component={EditScreen} />
      <Tab.Screen name="Share" component={ShareScreen} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainApp" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  countText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default App;
