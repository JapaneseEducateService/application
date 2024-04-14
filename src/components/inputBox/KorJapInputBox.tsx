import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  Image,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
} from 'react-native';
import {getToken} from '../../utils/AuthStorage';

interface Props {
  onJapTextChange: (japText: string) => void;
}

const KorJapInputBox: React.FC<Props> = ({onJapTextChange}) => {
  const [isKoreanSelected, setIsKoreanSelected] = useState<boolean>(true);
  const [currentKorText, setCurrentKorText] = useState<string>('');
  const [currentJapText, setCurrentJapText] = useState<string>('');

  // useEffect(()=>{
  //   console.log(currentJapText)
  // },[currentJapText])

  const KoreanToJapanese = async () => {
    const tokenData = await getToken();
    const accessToken = tokenData?.access_token;
    const data = {
      text: currentKorText,
    };

    axios
      .post('http://10.0.2.2:8000/api/speech/translate', data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        if (response.status === 200) {
          console.log(response.data);
          setIsKoreanSelected(false);
          setCurrentJapText(response.data);
          onJapTextChange(response.data);
        } else {
          console.log('번역 오류');
        }
      })
      .catch(error => {
        console.error('에러 발생:', error);
      });
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.flagsContainer}>
        <TouchableOpacity
          style={styles.koreaFlagButton}
          onPress={() => {
            setIsKoreanSelected(true);
          }}>
          <Image
            source={require('../../../assets/koreaFlag.png')}
            style={styles.flagImage}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.japanFlagButton}
          onPress={() => {
            setIsKoreanSelected(false);
          }}>
          <Image
            source={require('../../../assets/japanFlag.png')}
            style={styles.flagImage}
          />
        </TouchableOpacity>
      </View>

      {isKoreanSelected ? (
        <View style={styles.korBtn}>
          <TextInput
            style={styles.textInput}
            placeholder="평가를 원하는 한국어 텍스트"
            onChangeText={text => {
              setCurrentKorText(text);
              console.log('한국어 텍스트(자식)', currentKorText);
            }}
          />
          <TouchableOpacity style={styles.btn} onPress={KoreanToJapanese}>
            <Text style={{color: 'white', fontSize: 15}}>번역</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TextInput
          style={styles.textInput}
          placeholder="평가를 원하는 일본어 텍스트"
          onChangeText={text => {
            setCurrentJapText(text);
            onJapTextChange(currentJapText);
          }}
          value={currentJapText}
        />
      )}
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
    width: 50,
    height: 30,
    borderWidth: 2,
    overflow: 'hidden',
  },
  japanFlagButton: {
    width: 50,
    height: 30,
    borderWidth: 2,
    overflow: 'hidden',
    marginLeft: 5,
  },
  flagImage: {
    width: '100%',
    height: '100%',
  },
  textInput: {
    marginTop: 20,
    width: '90%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 3,
    backgroundColor: '#f5f5f5',
  },
  btn: {
    width: '10%',
    height: 40,
    backgroundColor: '#5E81F4',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '0%',
  },
  korBtn: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default KorJapInputBox;
