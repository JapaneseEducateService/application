import React, {useState} from 'react';
import {
  Image,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
} from 'react-native';

interface Props {}

const KorJapInputBox: React.FC<Props> = () => {
  const [isKoreanSelected, setIsKoreanSelected] = useState<boolean>(false);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.flagsContainer}>
        <TouchableOpacity
          style={styles.koreaFlagButton}
          onPress={() => {
            setIsKoreanSelected(true);
          }}>
          <Image
            source={require('../../assets/koreaFlag.png')}
            style={styles.flagImage}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.japanFlagButton}
          onPress={() => {
            setIsKoreanSelected(false);
          }}>
          <Image
            source={require('../../assets/japanFlag.png')}
            style={styles.flagImage}
          />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.textInput}
        placeholder="평가를 원하는 기준 텍스트"
      />

      <TouchableOpacity
        style={{
          width: '40%',
          height: 40,
          backgroundColor: '#5E81F4',
          alignItems: 'center',
          marginTop: 25,
          borderRadius: 5,
          padding: 2,
          justifyContent: 'center',
        }}>
        <Text style={{color: 'white', fontSize: 15}}>
          {isKoreanSelected ? '일본어로 번역하기' : '표준 발음 생성 시작!'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    height: '20%',  
    alignItems: 'center',
  },
  flagsContainer: {
    flexDirection: 'row',
    width: '90%',
    height: '40%',
  },
  koreaFlagButton: {
    width: '15%',
    height: '60%',
    borderWidth: 2,
    overflow: 'hidden',
  },
  japanFlagButton: {
    width: '15%',
    height: '60%',
    borderWidth: 2,
    overflow: 'hidden',
    marginLeft: 5,
  },
  flagImage: {
    width: '100%',
    height: '100%',
  },
  textInput: {
    width: '90%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 3,
  },
});

export default KorJapInputBox;
