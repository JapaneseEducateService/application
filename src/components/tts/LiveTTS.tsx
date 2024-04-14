import React from 'react';
import Tts from 'react-native-tts';
import Button from '../Button';
import {Text, TouchableOpacity} from 'react-native';
import {Platform} from 'react-native';

interface Props {
  text: string;
}

const initializeTTS = async () => {
  try {
    await Tts.getInitStatus(); // TTS 초기화 상태 확인
    Tts.setDefaultLanguage('ja-JP');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'no_engine') {
        Tts.requestInstallEngine();
      } else {
        console.error('TTS Initialization failed:', error.message);
      }
    } else {
      console.error('An unexpected error occurred');
    }
  }
};

initializeTTS();

const onStartTTS = async (text: string) => {
  Tts.speak(text);
};

const LiveTTS: React.FC<Props> = ({text}) => {
  return (
    <TouchableOpacity
      style={{
        width: 150,
        height: 30,
        backgroundColor: '#5E81F4',
        marginTop: 50,
        alignItems: 'center',
        borderWidth: 3,
      }}
      onPress={() => {
        onStartTTS(text);
      }}>
      <Text>발음 들어보기</Text>
    </TouchableOpacity>
  );
};

export default LiveTTS;
