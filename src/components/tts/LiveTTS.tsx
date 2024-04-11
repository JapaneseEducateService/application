import React from 'react';
import Tts from 'react-native-tts';
import Button from '../Button';

interface Props {
  text: string;
}

Tts.setDefaultLanguage('ja-JP'); // 언어 설정

const onStartTTS = async (text:string) => {
  Tts.speak(text);
};

const LiveTTS: React.FC<Props> = ({ text }) => {
  return (
    <Button
      style={{
        width: 150,
        height: 30,
        backgroundColor: '#5E81F4',
        marginTop: 50,
        alignItems: 'center',
      }}
      onPress={() => {
        onStartTTS(text);
      }}>
        발음 들어보기
    </Button>
  );
};

export default LiveTTS;
