import axios from 'axios';
import { getToken, storeToken } from './AuthStorage';

const AccessTokenToServer = async (accessToken: string, navigation:any, provider: string) => {
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

    if (serverResponse.status === 200) {
      // 백에서 발급해 준 access_token, refresh_token을 AsyncStorage에 저장
      await storeToken(
        serverResponse.data.access_token,
        serverResponse.data.refresh_token,
      );
      await getToken();

      navigation.navigate('Main');
    }
  } catch (error) {

    console.error('서버 요청 에러:', error);
  }
};

export default AccessTokenToServer;
