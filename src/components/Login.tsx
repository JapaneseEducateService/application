import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity } from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {}

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

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const goToRegister = () => {
    navigation.navigate('Register');
  };

  const goToMain = () => {
    navigation.navigate('Main');
  };

  const onLogin = () => {
    const userData = {
      name: username,
      password: password,
    };
  
    axios
      .post('http://10.0.2.2:8000/api/login', userData)
      .then(response => {
        console.log(response.status);
        if (response.status === 200) {
          storeToken(response.data.access_token, response.data.refresh_token);
          goToMain();
        } else {
          console.log('로그인 실패');
        }
      })
      .catch(error => {
        console.error('에러 발생:', error);
      });
  };
  

  // 토큰 저장
  const storeToken = async (access_token:string, refresh_token:string) => {
    try {
      await AsyncStorage.multiSet([
          ['@access_token', access_token],
          ['@refresh_token', refresh_token]
        ])
    } catch (e) {
      console.error('토큰 저장 중 에러 발생:', e);
    }
  }

  // 토큰 가져오기
  const getToken = async () => {
    try {
      const [[, access_token], [, refresh_token]] = await AsyncStorage.multiGet(['@access_token', '@refresh_token']);
  
      console.log('저장된 액세스 토큰:', access_token);
      console.log('저장된 리프레쉬 토큰:', refresh_token);
    } catch(e) {
      console.error('토큰 불러오는 중 에러 발생:', e);
    }
  }
  

  const onGoogleLogin = () => {
    // 구글 로그인 로직
  };

  const onNaverLogin = () => {
    // 네이버 로그인 로직
  };

  const onKakaoLogin = () => {
    // 카카오 로그인 로직
  };

  const onGithubLogin = () => {
    // 깃허브 로그인 로직
  };

  return (
    <View style={{padding: 20}}>
      <BackButton onPress={() => navigation.goBack()} />

      <View style={{marginTop: 30}}>
        <Text style={{fontSize: 24, marginBottom: 20, textAlign: 'center'}}>
          TAMAGO!
        </Text>

        <TextInput
          style={{
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            marginBottom: 10,
            padding: 10,
          }}
          placeholder="아이디"
          value={username}
          onChangeText={text => setUsername(text)}
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
            아이디가 없으신가요?
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{marginTop: 120}}>
        <TouchableOpacity
          style={{
            backgroundColor: 'red',
            padding: 10,
            alignItems: 'center',
            marginBottom: 10,
          }}
          onPress={onGoogleLogin}>
          <Text style={{color: 'white', fontSize: 16}}>구글 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: 'green',
            padding: 10,
            alignItems: 'center',
            marginBottom: 10,
          }}
          onPress={onNaverLogin}>
          <Text style={{color: 'white', fontSize: 16}}>네이버 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: 'yellow',
            padding: 10,
            alignItems: 'center',
            marginBottom: 10,
          }}
          onPress={onKakaoLogin}>
          <Text style={{color: 'black', fontSize: 16}}>카카오 로그인</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: 'black',
            padding: 10,
            alignItems: 'center',
            marginBottom: 10,
          }}
          onPress={onGithubLogin}>
          <Text style={{color: 'white', fontSize: 16}}>깃허브 로그인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
