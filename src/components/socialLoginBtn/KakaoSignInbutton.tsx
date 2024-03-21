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

      console.log("카카오에서 받은 엑세스 토큰: ", token.accessToken);

      // 서버에 액세스 토큰 전달
      AccessTokenToServer(token.accessToken, navigation, provider);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <TouchableOpacity onPress={signInWithKakao}>
        <Image
          source={require('../../../assets/kakaoLogin.png')}
          style={{width: 240, height: 50}} 
        />
      </TouchableOpacity>
  );
}

export default KakaoSignInButton;
