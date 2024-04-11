import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import KorJapInputBox from '../inputBox/KorJapInputBox';
import AudioWaveFormChart from '../chart/AudioWaveFormChart';
import LiveTTS from '../tts/LiveTTS';

const PronunciationDirectly: React.FC = () => {
  const [currentText, setCurrentText] = useState<string>('');

  const handleTextChange = (japText:string) => {
    setCurrentText(japText);
  };

  useEffect(()=>{
    console.log('부모', currentText);
  }, [currentText])

  return (
    <View style={styles.mainContainer}>
      <View style={styles.innerContainer}>
        <Text style={styles.headerText}>
          발음 평가를 원하는 단어나 문장을 입력해주세요.
        </Text>
        <KorJapInputBox onJapTextChange={handleTextChange}></KorJapInputBox>
        <LiveTTS text={currentText}></LiveTTS>
        <Text style={styles.headerText}>
          사용자의 발음을 녹음해주세요!
        </Text>
        <AudioWaveFormChart referenceText={currentText}></AudioWaveFormChart>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#212A3E',
    alignItems: 'center',
  },
  innerContainer: {
    marginTop: 10,
    width: '95%',
    height: 180,
    // backgroundColor: '#f5f5f7',
    // borderWidth: 3,
    alignItems: 'center',
    borderRadius: 30,
  },
  headerText: {
    fontSize: 17, 
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    marginBottom: 5,
  },
  actionButton: {
    width: '40%',
    height: 40,
    backgroundColor: '#5E81F4',
    alignItems: 'center',
    marginTop: 25,
    borderRadius: 5,
    padding: 2,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
  },
});

export default PronunciationDirectly;
