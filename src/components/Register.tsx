import React, {useState} from 'react';
import {View, Text, TouchableOpacity, TextInput, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DatePicker from '@react-native-community/datetimepicker';

interface BackButtonProps {
  onPress: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} style={{width: 40, height: 40}}>
      <Text style={{fontSize: 16}}>뒤로</Text>
    </TouchableOpacity>
  );
};

const Register: React.FC = () => {
  const navigation = useNavigation();
  const [nickname, setNickname] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [birthDate, setBirthDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [passwordMismatch, setPasswordMismatch] = useState<boolean>(false);
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(true);

  // 회원가입 버튼 눌렀을 때
  const onRegister = async () => {
    const requestData = {
      nickname: nickname,
      name: username,
      email: email,
      password: password,
      password_confirmation: password,
      phone: phoneNumber,
      birthday: birthDate.toISOString().split('T')[0], // ISO 날짜 형식으로 변환
    };

    try {
      const response = await fetch('http://10.0.2.2:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      console.log('서버 응답:', responseData);
    } catch (error) {
      console.error('오류 발생:', error);
    }
  };

  // 비밀번호 재입력 확인
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordMismatch(value !== confirmPassword);
    if (value.length >= 6) {
      setIsPasswordValid(true);
    } else {
      setIsPasswordValid(false);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setPasswordMismatch(value !== password);
  };

  // 이메일 형식 확인
  const handleEmailChange = (value: string) => {
    setEmail(value);
    // 이메일 형식 검증을 위한 정규 표현식
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailPattern.test(value)) {
      setIsEmailValid(false);
    } else {
      setIsEmailValid(true);
    }
  };

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(false);
    setBirthDate(currentDate);
  };

  const checkDuplicate = (input: string) => {
    // 중복 확인 로직 추가
  };

  return (
    <View style={{padding: 20}}>
      <BackButton onPress={() => navigation.goBack()} />

      <View>
        <View style={{alignItems: 'center'}}>
          <Image 
            style={{width:250, height:70}}
            source={require('../../assets/TamagoLogo.png')}></Image>
          <Text style={{fontSize: 18, marginBottom: 20}}>회원가입</Text>
        </View>

        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TextInput
            style={{
              width: 270,
              height: 40,
              borderBottomWidth: 1,
              borderColor: 'gray',
              marginBottom: 10,
              paddingVertical: 5,
            }}
            placeholder="닉네임"
            value={nickname}
            onChangeText={text => setNickname(text)}
          />
          <TouchableOpacity style={{marginLeft: 10}}>
            <Text
              style={{color: 'blue', fontSize: 16}}
              onPress={() => checkDuplicate(nickname)}>
              중복 확인
            </Text>
          </TouchableOpacity>
        </View>

        {/* 이메일 */}
        <TextInput
          style={{
            width: 320,
            height: 40,
            borderBottomWidth: 1,
            borderColor: 'gray',
            marginBottom: 10,
            paddingVertical: 5,
          }}
          placeholder="이메일"
          value={email}
          onChangeText={handleEmailChange}
        />

        {!isEmailValid ? (
          <Text style={{color: 'red'}}>올바른 이메일 형식을 입력해주세요.</Text>
        ) : null}

        <TextInput
          style={{
            width: 320,
            height: 40,
            borderBottomWidth: 1,
            marginBottom: 10,
            paddingVertical: 5,
          }}
          placeholder="비밀번호"
          secureTextEntry={true}
          value={password}
          onChangeText={handlePasswordChange}
        />

        <TextInput
          style={{
            width: 320,
            height: 40,
            borderBottomWidth: 1,
            marginBottom: 10,
            paddingVertical: 5,
          }}
          placeholder="비밀번호 확인"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
        />

        { isPasswordValid && passwordMismatch ? (
          <Text style={{color: 'red'}}>비밀번호가 일치하지 않습니다.</Text>
        ) : null}

        {!isPasswordValid ? (
          <Text style={{color: 'red'}}>
            비밀번호를 6글자 이상 설정해주세요.
          </Text>
        ) : null}

        

        <TextInput
          style={{
            width: 320,
            height: 40,
            borderBottomWidth: 1,
            borderColor: 'gray',
            marginBottom: 10,
            paddingVertical: 5,
          }}
          placeholder="전화번호"
          value={phoneNumber}
          onChangeText={text => setPhoneNumber(text)}
        />

        <TouchableOpacity
          style={{
            width: 320,
            height: 40,
            borderBottomWidth: 1,
            borderColor: 'gray',
            marginBottom: 10,
            justifyContent: 'center',
          }}
          onPress={() => setShowDatePicker(true)}>
          <Text>{birthDate.toISOString().slice(0, 10)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DatePicker
            value={birthDate}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
          />
        )}
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: passwordMismatch ? 'gray' : 'blue',
          padding: 10,
          alignItems: 'center',
          marginBottom: 10,
          marginTop: 50,
        }}
        onPress={onRegister}
        disabled={passwordMismatch}>
        <Text style={{color: 'white', fontSize: 16}}>회원가입</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Register;
