import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {getToken} from '../utils/authStorage';
import {Button, Text, View, StyleSheet} from 'react-native';

const UserProfile: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null); // userData의 타입을 any로 변경

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tokens = await getToken();
        if (tokens) { // tokens이 null이 아닌지 확인합니다.
          const { access_token } = tokens; // access_token을 가져옵니다.
          setAccessToken(access_token); // 가져온 access_token을 상태에 설정합니다.
        }

        const serverResponse = await axios.get(
          'http://10.0.2.2:8000/api/user',
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: 'Bearer ' + accessToken,
            },
          },
        );
        setUserData(serverResponse.data);
        console.log(serverResponse.data);
      } catch (error) {
        console.error('서버 요청 에러:', error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    // 로그아웃 처리 로직 추가
  };

  return (
    <>
      <View style={{backgroundColor: 'white', flex:1}}>
        <Text>프로필</Text>
        {userData && ( // userData가 존재하는 경우에만 아래 내용을 렌더링
          <>
            <Text>이메일: {userData.email}</Text>
            <Text>닉네임: {userData.nickname}</Text>
            <Text>전화번호: {userData.phone}</Text>
            <Text>가입날짜: {userData.created_at}</Text>

            <View style={styles.container}>
                <Button title="회원정보 수정" onPress={() => handleLogout()} />
                <Button title="로그아웃" onPress={() => handleLogout()} />
            </View>
          </>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {

    bottom: 0,
    marginTop:50,
    alignItems: 'center',
  },
});

export default UserProfile;
