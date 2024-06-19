import axios from 'axios';
import { getToken, storeToken } from './utils/AuthStorage';

const api = axios.create({
  baseURL: 'http://tamago-laravel-rb-474417567.ap-northeast-2.elb.amazonaws.com:80/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
// 토큰이 필요없는 요청은 헤더에 { skipToken: true } 값을 추가할 것
api.interceptors.request.use(
  async config => {
    if (!config.headers.skipToken) {
      const tokens = await getToken();
      if (tokens && tokens.access_token) {
        config.headers['Authorization'] = `Bearer ${tokens.access_token}`;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);


// 응답 인터셉터
api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry || error.response.status === 403) {
        originalRequest._retry = true;
        try {
          const tokens = await getToken();
          console.log("기존의 리프레쉬 토큰", tokens?.refresh_token);
          const refreshResponse = await axios.post(
            `${api.defaults.baseURL}/refresh`, 
            {},
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokens?.refresh_token}`
              }
            }
          );
  
          console.log("새로 발급 받은 액세스 토큰", refreshResponse.data.token)
          if (refreshResponse.status === 200) {
            const newTokens = {
              access_token: refreshResponse.data.token,
              refresh_token: refreshResponse.data.refresh_token || tokens?.refresh_token,
            };
            await storeToken(newTokens.access_token, newTokens.refresh_token);
            api.defaults.headers.common['Authorization'] = `Bearer ${newTokens.access_token}`;
            return api(originalRequest); // 원래 요청 다시 시도
          }
        } catch (refreshError) {
          console.error('토큰 갱신 실패', refreshError);
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
  

export default api;
