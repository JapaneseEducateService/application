import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {TouchableOpacity, View, Image} from 'react-native';
import Main from './src/components/Main';
import Login from './src/components/Login';
import OcrTest from './src/components/OcrTest';
import PronounceTest from './src/components/pronounce/PronounceTest';
import Register from './src/components/Register';
import WordMain from './src/components/word/WordMain';
import Game from './src/components/Game';
import Community from './src/components/Community';

import Home from './src/components/Home';
import UserProfile from './src/components/UserProfile';
import CreateVocabulary from './src/components/word/CreateVocabulary';
import {HeaderBackButton} from 'react-navigation-stack';
import MyVocabularyList from './src/components/word/MyVocabularyList';
import VocabularyInfo from './src/components/word/VocabularyInfo';
import DefaultVocabulary from './src/screens/DefaultVocabulary';

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
        {/* 발음평가 화면 */}
        <Stack.Screen
          name="PronounceTest"
          component={PronounceTest}
          options={{headerShown: false}}></Stack.Screen>
        <Stack.Screen
          name="Register"
          component={Register}
          options={{headerShown: false}}
        />
        {/* 단어장 화면 */}
        <Stack.Screen
          name="WordMain"
          component={WordMain}
          options={{headerShown: false}}
        />

        {/* 단어장 만들기 화면 */}
        <Stack.Screen
          name="CreateVocabulary"
          component={CreateVocabulary}
          options={{headerShown: false}}
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
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MyVocabularyList"
          component={MyVocabularyList}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="VocabularyInfo"
          component={VocabularyInfo}
          options={{headerShown: false}}
        />
        <Stack.Screen name="DefaultVocabulary" component={DefaultVocabulary} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
