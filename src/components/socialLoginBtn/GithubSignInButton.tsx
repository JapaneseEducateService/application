import React from 'react';
import { Button, Alert } from 'react-native';
import { authorize } from 'react-native-app-auth';
import { useNavigation } from '@react-navigation/native';
import AccessTokenToServer from '../../utils/AccessTokenToServer'; // 서버로 토큰 전송을 위한 함수 임포트

// GitHub OAuth 설정
const config = {
  clientId: '5fd7aa1f56fa20c6f79c',
  clientSecret: 'd1280b8fdd84657d6927f381108dc533fa271a62',
  redirectUrl: "myapp://callback",
  scopes: ['user'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
  },
};

const GithubSignInButton = () => {
  const navigation = useNavigation();
  const signInWithGithub = async () => {
    try {
      const authState = await authorize(config);
      console.log(authState);
      console.log(`깃허브에서 받은 엑세스토큰: ${authState.accessToken}`);
      // 서버에 액세스 토큰 전달
      AccessTokenToServer(authState.accessToken, navigation, 'github'); // 네비게이션과 프로바이더를 인자로 추가할 수 있습니다.
    } catch (error) {
      console.error(error);
      console.log(error);
    }
  };

  return <Button title="깃허브 로그인" onPress={signInWithGithub} />;
};

export default GithubSignInButton;
