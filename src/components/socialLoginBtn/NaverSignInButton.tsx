import React from 'react';
import { Image, TouchableOpacity} from 'react-native';
import NaverLogin from '@react-native-seoul/naver-login';
import { useNavigation } from '@react-navigation/native';
import AccessTokenToServer from '../../utils/AccessTokenToServer';

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

        // 서버에 액세스 토큰 전달
        AccessTokenToServer(result.successResponse.accessToken, navigation, provider);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <TouchableOpacity onPress={handleLogin} style={{margin:10}}>
        <Image
          source={require('../../../assets/naverLoginIcon.png')}
          style={{width: 50, height: 50, borderRadius:10}} 
        />
      </TouchableOpacity>
  );
};

export default NaverSignInButton;
