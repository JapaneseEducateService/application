import React from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BackButton: React.FC = () => {
  const navigation = useNavigation(); // 컴포넌트 내부에서 useNavigation 호출

  // onPress 이벤트 핸들러에서 navigation.goBack을 호출하여 이전 화면으로 돌아가기
  const handlePress = () => {
    navigation.goBack();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={{width: 40, height: 40, position:'absolute'}}>
      <Image
        source={require('../../../assets/backButton.png')}
        style={{width: 30, height: 30, margin: 10}}
      />
    </TouchableOpacity>
  );
};

export default BackButton;
