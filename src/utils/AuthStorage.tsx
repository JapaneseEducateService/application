// 전달 받은 access_token 및 refresh_token을 AsyncStorage에 저장하는 함수
// storeToken(), getToken(), deleteToken()

import AsyncStorage from '@react-native-async-storage/async-storage';

const storeToken = async (access_token: string, refresh_token: string) => {
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

    return {access_token, refresh_token};
  } catch (error) {
    console.error('토큰 불러오는 중 에러 발생:', error);
    return null;
  }
};

const deleteToken = async () => {
  try {
    // AsyncStorage에서 access_token과 refresh_token 삭제
    await AsyncStorage.multiRemove(['@access_token', '@refresh_token']);
  } catch (error) {
    console.error('토큰 삭제 중 에러 발생:', error);
  }
};

export {storeToken, getToken, deleteToken};
