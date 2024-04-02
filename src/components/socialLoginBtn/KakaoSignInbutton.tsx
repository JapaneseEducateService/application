import React from 'react';
import { Image, TouchableOpacity} from 'react-native';
import { KakaoOAuthToken, login } from '@react-native-seoul/kakao-login';
import { useNavigation } from '@react-navigation/native';
import AccessTokenToServer from '../../utils/AccessTokenToServer';

function KakaoSignInButton() {
  const navigation = useNavigation();
  const provider = "kakao";

  const signInWithKakao = async (): Promise<void> => {
    try {
      const token: KakaoOAuthToken = await login();

      // 서버에 액세스 토큰 전달
      AccessTokenToServer(token.accessToken, navigation, provider);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <TouchableOpacity onPress={signInWithKakao} style={{margin:10}}>
        <Image
          source={require('../../../assets/kakaoLoginIcon.png')}
          style={{width: 50, height: 50, borderRadius:10}} 
        />
      </TouchableOpacity>
  );
}

export default KakaoSignInButton;
