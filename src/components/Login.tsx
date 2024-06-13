import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import axios from 'axios';
import {storeToken, getToken} from '../utils/AuthStorage';
import BackButton from './button/backButton';

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

const Login: React.FC<Props> = () => {
  const navigation = useNavigation<NavigationProp>();

  const [userEmail, setUserEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  // const [provider, setProvider] = useState('');

  const goToRegister = () => {
    setUserEmail('');
    setPassword('');
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

    console.log('입력한 유저 데이터 : ', userData);

    axios
      .post('http://tamago-laravel-rb-474417567.ap-northeast-2.elb.amazonaws.com/api/login', userData)
      .then(response => {
        if (response.status === 200) {
          // 로그인이 성공하면 입력창을다시 초기화 시켜줘야 함
          setUserEmail('');
          setPassword('');

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

  return (
    <>
      <BackButton />
      <View style={{padding: 20, position: 'relative', flex: 1}}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
          }}>
          <Image
            source={require('../../assets/TamagoLogo.png')}
            style={{width: 250, height: 70}}
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
              backgroundColor: '#5E81F4',
              padding: 10,
              alignItems: 'center',
              marginBottom: 10,
              borderRadius: 10,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 7.65,
              elevation: 3,
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
      </View>
    </>
  );
};

export default Login;
