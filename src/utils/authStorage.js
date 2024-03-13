// 전달 받은 access_token 및 refresh_token을 AsyncStorage에 저장하는 함수
// storeToken(), getToken()

import AsyncStorage from '@react-native-async-storage/async-storage';

const storeToken = async (access_token, refresh_token) => {
  try {
    await AsyncStorage.multiSet([
      ['@access_token', access_token],
      ['@refresh_token', refresh_token],
    ]);
  } catch (error) {
    console.error('토큰 저장 중 에러 발생:', error);
  }
};

const getToken = async () => {
  try {
    const [[, access_token], [, refresh_token]] = await AsyncStorage.multiGet([
      '@access_token',
      '@refresh_token',
    ]);

    console.log('저장된 액세스 토큰:', access_token);
    console.log('저장된 리프레시 토큰:', refresh_token);
    
    return { access_token, refresh_token };
  } catch (error) {
    console.error('토큰 불러오는 중 에러 발생:', error);
    return null;
  }
};

export { storeToken, getToken };
