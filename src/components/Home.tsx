import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Animated,
  Button,
  ImageBackground,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import GoogleSignInButton from './socialLoginBtn/GoogleSignInButton';
import GithubSignInButton from './socialLoginBtn/GithubSignInButton';
import KakaoSignInbutton from './socialLoginBtn/KakaoSignInbutton';
import NaverSignInButton from './socialLoginBtn/NaverSignInButton';
import LoadingBar from './LoadingBar';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const Home: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const fadeAnim = useRef(new Animated.Value(0)).current; // opacity를 위한 초기 값
  const translateYAnim = useRef(new Animated.Value(50)).current; // Y축 이동을 위한 초기 값

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    // 애니메이션 값 초기화
    fadeAnim.setValue(0);
    translateYAnim.setValue(50); // 50px에서 시작하여 0으로 이동
    
    // 애니메이션 동시 실행
    Animated.parallel([
      // 밝아지는 애니메이션
      Animated.timing(fadeAnim, {
        toValue: 1, // 완전 불투명
        duration: 1000, // 3초 동안
        useNativeDriver: true,
      }),
      // 위로 올라오는 애니메이션
      Animated.timing(translateYAnim, {
        toValue: 0, // 원래 위치로 이동
        duration: 1000, // 3초 동안
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/TamagoLogo.png')}
        style={{width: 270, height: 70, marginTop: 50}}
      />
      <Text style={{fontSize: 17}}>日本語学習支援アプリ</Text>
      
      <Animated.Image
        style={[
          styles.image,
          {
            opacity: fadeAnim, // opacity 애니메이션 적용
            transform: [
              { translateY: translateYAnim }
            ],
          },
        ]}
        source={require('../../assets/japanLogo3.png')}
      />

      {/* 소셜 로그인 부분 */}
      <View
        style={styles.socialContainer}>
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
        <Text style={styles.buttonText}>ログイン</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
    height:'100%'
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
    position:'absolute',
    bottom:'10%'
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
  image: {
    width: 300,
    height: 300,
    bottom:'35%',
    position:'absolute'
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  socialContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position:'absolute',
    bottom:'16%'
  }
});

export default Home;
