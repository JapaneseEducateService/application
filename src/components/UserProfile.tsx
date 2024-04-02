import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {deleteToken, getToken} from '../utils/AuthStorage';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {TextInput} from 'react-native-gesture-handler';
import DatePicker from '@react-native-community/datetimepicker';
import LoadingBar from './LoadingBar';

type RootStackParamList = {
  Home: undefined;
  UserProfile: undefined;
};

const UserProfile: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [currentUserData, setCurrentUserData] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [email, setEmail] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [phone, setPhone] = useState<string>();

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [birthDate, setBirthDate] = useState<Date>(new Date());
  const [currentBirthDate, setCurrentBirthDate] = useState('');

  const fetchData = async () => {
    try {
      const tokens = await getToken();
      if (tokens) {
        const {access_token} = tokens;

        const serverResponse = await axios.get(
          'http://10.0.2.2:8000/api/user',
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${access_token}`,
            },
          },
        );
          setCurrentUserData(serverResponse.data);
          setEmail(serverResponse.data.email);
          setNickname(serverResponse.data.nickname);
          setPhone(serverResponse.data.phone);
          setCurrentBirthDate(serverResponse.data.birthday);
      }
    } catch (error) {
      console.error('서버 요청 에러:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(false);
    setBirthDate(currentDate); // DatePicker용 Date 객체 상태 업데이트
    setCurrentBirthDate(currentDate.toISOString().split('T')[0]); // 화면에 표시될 날짜 문자열 상태 업데이트
  };

  // 회원정보 수정 후 저장 로직
  const saveUserProfile = async () => {
    // 새로 바꾼 회원 정보 초기 설정
    const updatedUserData = {
      nickname: nickname,
      email: email,
      phone: phone,
      birthday: birthDate.toISOString().split('T')[0], // YYYY-MM-DD 형식으로 변환
    };

    // 변경된 데이터만을 담을 객체
    const changes = {};

    // 현재 사용자 데이터(currentUserData)와 새로운 데이터(updatedUserData) 비교
    Object.keys(updatedUserData).forEach(key => {
      // birthday 필드를 위한 특별한 처리
      if (key === 'birthday') {
        const originalDate = new Date(currentUserData[key])
          .toISOString()
          .slice(0, 10);
        if (originalDate !== updatedUserData[key]) {
          changes[key] = updatedUserData[key];
        }
      } else if (updatedUserData[key] !== currentUserData[key]) {
        changes[key] = updatedUserData[key];
      }
    });

    // 변경된 데이터가 있을 경우에만 요청을 보냄
    if (Object.keys(changes).length > 0) {
      const {access_token} = await getToken();

      try {
        const response = await axios.patch(
          'http://10.0.2.2:8000/api/user',
          changes, // 변경된 데이터만 포함
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        );
        Alert.alert("회원 정보 수정이 완료되었습니다.")
        fetchData()
      } catch (error) {
        console.error('회원 정보 수정 실패:', error);
      }
    }

    setIsEditing(false);
  };

  // 로그아웃 로직
  const handleLogout = async () => {
    const tokenResponse = await getToken();
    if (!tokenResponse || !tokenResponse.access_token) {
      console.error('토큰을 가져오는 데 실패했습니다.');
      return;
    }
    // 백엔드에 저장된 토큰 삭제
    axios
      .post(
        'http://10.0.2.2:8000/api/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      .then(response => {
        // 로그아웃 요청 성공시 프론트에서도 토큰 값 삭제하고 Login 컴포넌트로 리다이렉션
        if (response.data.status == 'Success') {
          deleteToken();
          navigation.navigate('Home');
        }
      })
      .catch(error => {
        console.error('로그아웃 시 에러 발생:', error);
      });
  };

  return (
    <>
      <View style={{backgroundColor: 'white', flex: 1}}>
        {currentUserData ? (
          <>
            <View style={{alignItems: 'center'}}>
              <Text style={{marginTop: 30}}>회원정보</Text>
              <View
                style={{
                  width: 140,
                  height: 140,
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 70,
                  marginTop: 10,
                  overflow: 'hidden',
                }}>
                <Image source={require('../../assets/background2.jpg')} />
              </View>
              <View
                style={{marginRight: '80%', marginTop: 10, marginBottom: 10}}>
                <Text>이메일</Text>
              </View>
              <TextInput
                style={{
                  width: '80%',
                  height: 40,
                  ...(!isEditing
                    ? {borderBottomWidth: 1, color: 'black'}
                    : {borderWidth: 1}),
                }}
                value={email}
                onChangeText={text => setEmail(text)}
                editable={isEditing}
              />

              <View
                style={{marginRight: '80%', marginTop: 10, marginBottom: 10}}>
                <Text>닉네임</Text>
              </View>
              <TextInput
                style={{
                  width: '80%',
                  height: 40,
                  ...(!isEditing
                    ? {borderBottomWidth: 1, color: 'black'}
                    : {borderWidth: 1}),
                }}
                value={nickname}
                onChangeText={text => setNickname(text)}
                editable={isEditing}
              />

              <View
                style={{marginRight: '80%', marginTop: 10, marginBottom: 10}}>
                <Text>생일</Text>
              </View>
              <TouchableOpacity
                disabled={!isEditing}
                style={{
                  width: '80%',
                  height: 40,
                  marginBottom: 10,
                  justifyContent: 'center',
                  ...(!isEditing
                    ? {borderBottomWidth: 1.5, color: 'black'}
                    : {borderWidth: 1}),
                }}
                onPress={() => setShowDatePicker(true)}>
                <Text>{currentBirthDate}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DatePicker
                  value={birthDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                />
              )}

              <View
                style={{marginRight: '80%', marginTop: 10, marginBottom: 10}}>
                <Text>전화번호</Text>
              </View>
              <TextInput
                style={{
                  width: '80%',
                  height: 40,
                  ...(!isEditing
                    ? {borderBottomWidth: 1, color: 'black'}
                    : {borderWidth: 1}),
                }}
                value={phone}
                onChangeText={text => setPhone(text)}
                editable={isEditing}
              />

              <View style={{marginTop: 10}}>
                <Text>가입날짜 : {currentUserData.created_at}</Text>
              </View>
            </View>

            <View style={styles.container}>
              {!isEditing && (
                <>
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => setIsEditing(true)}
                    activeOpacity={0.7}>
                    <Text style={styles.buttonText}>회원정보 수정</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => handleLogout()}
                    activeOpacity={0.7}>
                    <Text style={styles.buttonText}>로그아웃</Text>
                  </TouchableOpacity>
                </>
              )}
              {isEditing && (
                <>
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => saveUserProfile()}
                    activeOpacity={0.7}>
                    <Text style={styles.buttonText}>저장</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => {
                      setIsEditing(false);
                    }}
                    activeOpacity={0.7}>
                    <Text style={styles.buttonText}>취소하기</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        ) : (
          <LoadingBar />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    backgroundColor: '#7465D5',
    margin: 10,
    width: 150,
    height: 30,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default UserProfile;
