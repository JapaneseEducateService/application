import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, View, Image } from 'react-native';
import Main from './src/components/Main';
import Login from './src/components/Login';
import OcrTest from './src/components/OcrTest';
import PronounceTest from './src/components/PronounceTest';
import Register from './src/components/Register';
import Word from './src/components/Word';
import Game from './src/components/Game';
import Community from './src/components/Community';
import GithubWebView from './src/components/socialLoginBtn/GithubWebView';

interface Props {}

const Stack = createStackNavigator();

// 스택 네비게이션 중간에 로고 넣기
const LogoTitle = () => {
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
      <Image
        style={{ width: 200, height: 50, marginLeft:10 }}
        // marginLeft:10는 headerRight에 있는 아이콘 때문에 중앙기준 왼쪽으로 밀리는거 같아 넣음
        source={require('./assets/TamagoLogo.png')}
      />
    </View>
  );
};

const App: React.FC<Props> = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerTitleAlign: 'center',
        }}>
        <Stack.Screen
          name="Main"
          component={Main}
          options={({ navigation }) => ({
            headerTitle: (props) => <LogoTitle {...props} />,
          headerTitleAlign: 'center',
            headerRight: () => (
              <View style={{ marginRight: 10 }}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Image
                    source={require('./assets/userIcon.png')}
                    style={{width: 40, height: 40}} 
                  />
                </TouchableOpacity>     
              </View>
            ),
          })}
        />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="OcrTest" component={OcrTest} />
        <Stack.Screen name="PronounceTest" component={PronounceTest} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        <Stack.Screen name="Word" component={Word} />
        <Stack.Screen name="Game" component={Game} />
        <Stack.Screen name="Community" component={Community} />
        <Stack.Screen name="GithubWebView" component={GithubWebView} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
