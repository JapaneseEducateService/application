import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import axios from 'axios';
import GoogleSignInButton from './socialLoginBtn/GoogleSignInButton';
import {storeToken, getToken} from '../utils/authStorage';
import GithubSignInButton from './socialLoginBtn/GithubSignInButton';
import KakaoSignInbutton from './socialLoginBtn/KakaoSignInbutton';
import NaverSignInButton from './socialLoginBtn/NaverSignInButton';

interface Props {
  route: {
    params: {
      url: string;
    };
  };
}

type RootStackParamList = {
  Register: undefined;
  Main: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const BackButton: React.FC<{onPress: () => void}> = ({onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} style={{width: 40, height: 40}}>
      <Text style={{fontSize: 16}}>뒤로</Text>
    </TouchableOpacity>
  );
};

const Login: React.FC<Props> = () => {
  const navigation = useNavigation<NavigationProp>();

  const [userEmail, setUserEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  // const [provider, setProvider] = useState('');

  const goToRegister = () => {
    navigation.navigate('Register');
  };

  const goToMain = () => {
    navigation.navigate('Main');
  };

  const onLogin = () => {
    const userData = {
      email: userEmail,
      password: password,
    };

    axios
      .post('http://10.0.2.2:8000/api/login', userData)
      .then(response => {
        console.log(response.status);
        if (response.status === 200) {
          storeToken(response.data.access_token, response.data.refresh_token);
          getToken();
          goToMain();
        } else {
          console.log('로그인 실패');
        }
      })
      .catch(error => {
        console.error('에러 발생:', error);
      });
  };

  // 소셜 로그인 로직
  const onSocialLogin = (provider: string) => {};

  return (
    <View style={{padding: 20, position: 'relative', flex: 1}}>
      <BackButton onPress={() => navigation.goBack()} />

      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Image
          source={require('../../assets/TamagoLogo.png')}
          style={{width:250, height:70}}
        />
      </View>

      <View style={{marginTop: 30}}>
        <TextInput
          style={{
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            marginBottom: 10,
            padding: 10,
          }}
          placeholder="이메일"
          value={userEmail}
          onChangeText={text => setUserEmail(text)}
        />

        <TextInput
          style={{
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            marginBottom: 20,
            padding: 10,
          }}
          placeholder="비밀번호"
          secureTextEntry={true}
          value={password}
          onChangeText={text => setPassword(text)}
        />

        <TouchableOpacity
          style={{
            backgroundColor: 'blue',
            padding: 10,
            alignItems: 'center',
            marginBottom: 10,
          }}
          onPress={onLogin}>
          <Text style={{color: 'white', fontSize: 16}}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToRegister}>
          <Text style={{color: 'blue', textAlign: 'center'}}>
            계정이 없으신가요?
          </Text>
        </TouchableOpacity>
      </View>

      {/* 소셜 로그인 부분 */}
      <View
        style={{marginTop: 50, justifyContent: 'center', alignItems: 'center'}}>
        {/* 구글 */}
        <GoogleSignInButton></GoogleSignInButton>
        {/* 네이버 */}
        <NaverSignInButton></NaverSignInButton>
        {/* 깃허브 */}
        <GithubSignInButton></GithubSignInButton>
        {/* 카카오 */}
        <KakaoSignInbutton></KakaoSignInbutton>
      </View>
    </View>
  );
};

export default Login;
