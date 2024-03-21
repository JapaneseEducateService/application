
import React from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getToken, storeToken } from './authStorage';

const AccessTokenToServer = async (accessToken, navigation, provider) => {
  try {
    const serverResponse = await axios.get(
      `http://10.0.2.2:8000/api/social/mobile/${provider}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + accessToken,
        },
      },
    );

    console.log('서버에서 받은 엑토: ', serverResponse.data.access_token);
    console.log('서버에서 받은 리토: ', serverResponse.data.refresh_token);

    if (serverResponse.status === 200) {
      // 백에서 발급해 준 access_token, refresh_token을 AsyncStorage에 저장
      await storeToken(
        serverResponse.data.access_token,
        serverResponse.data.refresh_token,
      );
      await getToken();
      // 로그인 성공 처리
      console.log(serverResponse.data)
      navigation.navigate('Main');
    }
  } catch (error) {
    console.error('서버 요청 에러:', error);
  }
};

export default AccessTokenToServer;
