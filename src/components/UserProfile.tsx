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
import BackButton from './button/backButton';
import api from '../api';

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

  // 데이터 가져오기
  const fetchData = async () => {
    try {
      const serverResponse = await api.get('/user');
      setCurrentUserData(serverResponse.data);
      setEmail(serverResponse.data.email);
      setNickname(serverResponse.data.nickname);
      setPhone(serverResponse.data.phone);
      setCurrentBirthDate(serverResponse.data.birthday);
    } catch (error) {
      console.error('서버 요청 에러:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = dateString => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}년${month}월${day}일`;
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(false);
    setBirthDate(currentDate); // DatePicker용 Date 객체 상태 업데이트
    setCurrentBirthDate(currentDate.toISOString().split('T')[0]); // 화면에 표시될 날짜 문자열 상태 업데이트
  };

  // 사용자 프로필 업데이트
  const saveUserProfile = async () => {
    const updatedUserData = {
      nickname: nickname,
      email: email,
      phone: phone,
      birthday: birthDate.toISOString().split('T')[0], // YYYY-MM-DD 형식으로 변환
    };

    const changes = {};
    Object.keys(updatedUserData).forEach(key => {
      if (updatedUserData[key] !== currentUserData[key]) {
        changes[key] = updatedUserData[key];
      }
    });

    if (Object.keys(changes).length > 0) {
      try {
        const response = await api.patch('/user', changes);
        Alert.alert('会員情報修正ができました。');
        fetchData(); // 데이터 새로고침
      } catch (error) {
        console.error('회원 정보 수정 실패:', error);
      }
    }
    setIsEditing(false);
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      const response = await api.post('/logout');
      if (response.data.status === 'Success') {
        deleteToken();
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('로그아웃 시 에러 발생:', error);
    }
  };
  return (
    <>
      <View style={{backgroundColor: '#212A3E', paddingBottom: 20, height: 40}}>
        <BackButton />
      </View>
      <View style={{backgroundColor: '#212A3E'}}>
        <BackButton />
      </View>
      <View style={{backgroundColor: '#f5f5f7', flex: 1}}>
        <View
          style={{
            width: '100%',
            height: '20%',
            position: 'absolute',
            backgroundColor: '#212A3E',
          }}
        />
        <View
          style={{
            width: '100%',
            height: '14%',
            position: 'absolute',
            bottom: '0%',
            backgroundColor: '#212A3E',
          }}
        />
        {currentUserData ? (
          <>
            <View style={{alignItems: 'center'}}>
              <Text
                style={{
                  marginTop: 30,
                  fontSize: 20,
                  color: 'white',
                }}>
                会員情報
              </Text>
              <View
                style={{
                  width: 140,
                  height: 140,
                  borderColor: 'white',
                  borderWidth: 1,
                  borderRadius: 70,
                  marginTop: 10,
                  overflow: 'hidden',
                }}>
                <Image source={require('../../assets/background2.jpg')} />
              </View>
              <View
                style={{marginRight: '85%', marginTop: 10, marginBottom: 10}}>
                <Text>メール</Text>
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
                style={{marginRight: '75%', marginTop: 10, marginBottom: 10}}>
                <Text>ニックネーム</Text>
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
                <Text>生年月日</Text>
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
                <Text>電話番号</Text>
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
                <Text>加入日 : {formatDate(currentUserData.created_at)}</Text>
              </View>
            </View>

            <View style={styles.container}>
              {!isEditing && (
                <>
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => setIsEditing(true)}
                    activeOpacity={0.7}>
                    <Text style={styles.buttonText}>会員情報の修正</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => handleLogout()}
                    activeOpacity={0.7}>
                    <Text style={styles.buttonText}>ログアウト</Text>
                  </TouchableOpacity>
                </>
              )}
              {isEditing && (
                <>
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => saveUserProfile()}
                    activeOpacity={0.7}>
                    <Text style={styles.buttonText}>保存</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buttonStyle}
                    onPress={() => {
                      setIsEditing(false);
                    }}
                    activeOpacity={0.7}>
                    <Text style={styles.buttonText}>キャンセル</Text>
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
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default UserProfile;
