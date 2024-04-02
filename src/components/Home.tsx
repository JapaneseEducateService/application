import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import GoogleSignInButton from './socialLoginBtn/GoogleSignInButton';
import GithubSignInButton from './socialLoginBtn/GithubSignInButton';
import KakaoSignInbutton from './socialLoginBtn/KakaoSignInbutton';
import NaverSignInButton from './socialLoginBtn/NaverSignInButton';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const Home: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/TamagoLogo.png')}
        style={{width: 250, height: 60, marginTop: 50}}
      />
      <Text style={{fontSize: 15}}>일본어 학습 도우미 앱</Text>
      <View></View>

      <Image
        source={require('../../assets/japanLogo.png')}
        style={{width: 400, height: 400}}
      />

      {/* 소셜 로그인 부분 */}
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          marginTop: 50,
        }}>
        {/* 구글 */}
        <GoogleSignInButton></GoogleSignInButton>
        {/* 네이버 */}
        <NaverSignInButton></NaverSignInButton>
        {/* 깃허브 */}
        <GithubSignInButton></GithubSignInButton>
        {/* 카카오 */}
        <KakaoSignInbutton></KakaoSignInbutton>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
        <Text style={styles.buttonText}>로그인하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    color: 'white',
    marginBottom: 10,
  },
  button: {
    width: '70%',
    height: 40,
    backgroundColor: '#006fff',
    paddingHorizontal: 20,
    borderRadius: 5,
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 7.65,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 5,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
});

export default Home;
