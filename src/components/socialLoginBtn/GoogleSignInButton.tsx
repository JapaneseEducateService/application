import React from 'react';
import { Image, TouchableOpacity} from 'react-native';
import {GoogleSignin} from '@react-native-community/google-signin';
import axios from 'axios';
import AccessTokenToServer from '../../utils/AccessTokenToServer';
import { useNavigation } from '@react-navigation/native'; // 네비게이션 훅 추가

const googleConfig = {
  webClientId:
    '62987728917-6edtqibvdpdcffj7205vjl69655p5u10.apps.googleusercontent.com',
  clientSecret: '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',
};

GoogleSignin.configure({
  webClientId: googleConfig.webClientId,
  offlineAccess: true,
});

const GoogleSignInButton = () => {
  const navigation = useNavigation();

  const provider = "google";

  const signInWithGoogle = async () => {
    try {
      const googleSignIn = await GoogleSignin.signIn();

      const serverAuthCode = googleSignIn.serverAuthCode;

      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        `code=${serverAuthCode}&client_id=${googleConfig.webClientId}&client_secret=${googleConfig.clientSecret}&redirect_uri=&grant_type=authorization_code`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const json = response.data;

      const accessToken = json.access_token;

      console.log('구글에서 받은 액세스 토큰: ', accessToken);

      // 서버에 액세스 토큰 전달
      AccessTokenToServer(accessToken, navigation, provider);

    } catch (error) {
      console.error('Google 로그인 에러:', error);
    }
  };

  return (
      <TouchableOpacity onPress={signInWithGoogle}>
        <Image
          source={require('../../../assets/googleLogin.png')}
          style={{width: 240, height: 50}} 
        />
      </TouchableOpacity>
  );
};

export default GoogleSignInButton;
