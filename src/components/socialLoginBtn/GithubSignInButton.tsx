import React from 'react';
import { Image, TouchableOpacity} from 'react-native';
import { authorize } from 'react-native-app-auth';
import { useNavigation } from '@react-navigation/native';
import AccessTokenToServer from '../../utils/AccessTokenToServer'; // 서버로 토큰 전송을 위한 함수 임포트

// GitHub OAuth 설정
const config = {
  clientId: '5fd7aa1f56fa20c6f79c',
  clientSecret: 'd1280b8fdd84657d6927f381108dc533fa271a62',
  redirectUrl: "myapp://auth",
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
      AccessTokenToServer(authState.accessToken, navigation, 'github'); // 네비게이션과 프로바이더를 인자로 추가할 수 있습니다.
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <TouchableOpacity onPress={signInWithGithub}>
    <Image
      source={require('../../../assets/githubLogin.jpg')}
      style={{width: 240, height: 50}}  
    />
  </TouchableOpacity>)
};

export default GithubSignInButton;
