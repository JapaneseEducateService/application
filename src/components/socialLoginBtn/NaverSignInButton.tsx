import React from 'react';
import { Image, TouchableOpacity} from 'react-native';
import NaverLogin from '@react-native-seoul/naver-login';
import { useNavigation } from '@react-navigation/native';
import AccessTokenToServer from '../../utils/AccessTokenToServer'; // 경로는 프로젝트에 맞게 조정하세요.

const NaverSignInButton = () => {
  const navigation = useNavigation();
  const provider = "naver"; // 로그인 제공자 정보

  const handleLogin = async () => {
    try {
      const result = await NaverLogin.login({
        appName: 'TAMAGO',
        consumerKey: 'XhzprhCiwIJ6It17zOJF',
        consumerSecret: 'Hw3fjt_51e',
      });
      if (result && result.successResponse) {

        console.log('Access Token:', result.successResponse.accessToken);

        // 서버에 액세스 토큰 전달
        AccessTokenToServer(result.successResponse.accessToken, navigation, provider);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <TouchableOpacity onPress={handleLogin}>
        <Image
          source={require('../../../assets/naverLogin.png')}
          style={{width: 240, height: 50}} 
        />
      </TouchableOpacity>
  );
};

export default NaverSignInButton;
