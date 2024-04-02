import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {TouchableOpacity, View, Image} from 'react-native';
import Main from './src/components/Main';
import Login from './src/components/Login';
import OcrTest from './src/components/OcrTest';
import PronounceTest from './src/components/PronounceTest';
import Register from './src/components/Register';
import WordMain from './src/components/word/WordMain';
import Game from './src/components/Game';
import Community from './src/components/Community';

import Home from './src/components/Home';
import UserProfile from './src/components/UserProfile';
import CreateVocabulary from './src/components/word/CreateVocabulary';
import { HeaderBackButton } from 'react-navigation-stack';
import MyVocabulary from './src/components/word/MyVocabulary';
import VocabularyInfo from './src/components/word/VocabularyInfo';

interface Props {}

const Stack = createStackNavigator();

// 스택 네비게이션 중간에 로고 넣기
const LogoTitle = () => {
  return (
    <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
      <Image
        style={{width: 200, height: 50, marginLeft: 10}}
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
        // 시작지점
        initialRouteName="Home"
        screenOptions={{
          headerTitleAlign: 'center',
        }}>
          

        {/* 메인 화면 */}
        <Stack.Screen
          name="Main"
          component={Main}
          options={({navigation}) => ({
            headerTitle: LogoTitle,
            headerTitleAlign: 'center',
            headerRight: () => (
              <View style={{marginRight: 10}}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('UserProfile')}>
                  <Image
                    source={require('./assets/userIcon.png')}
                    style={{width: 40, height: 40}}
                  />
                </TouchableOpacity>
              </View>
            ),
            headerLeft: () => null,
          })}
        />
        <Stack.Screen
          name="Login"
          component={Login as React.ComponentType}
          options={{headerShown: false}}
        />
        <Stack.Screen name="OcrTest" component={OcrTest} />
        <Stack.Screen name="PronounceTest" component={PronounceTest} />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{headerShown: false}}
        />
        {/* 단어장 화면 */}
        <Stack.Screen
          name="WordMain"
          component={WordMain}
          options={({navigation}) => ({
            headerTitle: LogoTitle,
            headerTitleAlign: 'center',
            headerRight: () => (
              <View style={{marginRight: 10}}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('UserProfile')}>
                  <Image
                    source={require('./assets/userIcon.png')}
                    style={{width: 40, height: 40}}
                  />
                </TouchableOpacity>
              </View>
            ),
            headerLeft: () => (
              <HeaderBackButton
                onPress={() => navigation.goBack()}
                tintColor={'black'}
              />
            ),
          })}
        />

        {/* 단어장 만들기 화면 */}
        <Stack.Screen
          name="CreateVocabulary"
          component={CreateVocabulary}
          options={({navigation}) => ({
            headerTitle: LogoTitle,
            headerTitleAlign: 'center',
            headerRight: () => (
              <View style={{marginRight: 10}}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('UserProfile')}>
                  <Image
                    source={require('./assets/userIcon.png')}
                    style={{width: 40, height: 40}}
                  />
                </TouchableOpacity>
              </View>
            ),
          })}
        />

        <Stack.Screen name="Game" component={Game} />
        <Stack.Screen name="Community" component={Community} />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
        />
        {/* 유저 프로필 화면 */}
        <Stack.Screen
          name="UserProfile"
          component={UserProfile}
          options={() => ({
            headerTitle: LogoTitle,
            headerTitleAlign: 'center',
          })}
        />
        <Stack.Screen name="MyVocabulary" component={MyVocabulary} />
        <Stack.Screen name="VocabularyInfo" component={VocabularyInfo} />
      </Stack.Navigator>
      
    </NavigationContainer>
  );
};

export default App;
