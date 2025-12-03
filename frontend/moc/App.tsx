import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet} from 'react-native';
import MetaballNavigation from './src/navigation/MetaballNavigation';

const Tab = createBottomTabNavigator();

// 임시 화면 컴포넌트들
function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Home Screen</Text>
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

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
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
  },
});

export default App;
