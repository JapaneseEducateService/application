import React, {Component, useEffect, useState} from 'react';
import {
  Dimensions,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import type {
  AudioSet,
  PlayBackType,
  RecordBackType,
} from 'react-native-audio-recorder-player';
import type {ReactElement} from 'react';
import {Svg, Path} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Button from '../Button';
import CircleChart from './CircleChart';
import {getToken} from '../../utils/AuthStorage';

const screenWidth = Dimensions.get('screen').width;

const AudioWaveFormChart = ({referenceText}) => {
  const [recordSecs, setRecordSecs] = useState(0);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const [currentPositionSec, setCurrentPositionSec] = useState(0);
  const [currentDurationSec, setCurrentDurationSec] = useState(0);
  const [playTime, setPlayTime] = useState('00:00:00');
  const [duration, setDuration] = useState('00:00:00');
  const [meter, setMeter] = useState(0); // 미터링 값 상태
  const [dataPoints, setDataPoints] = useState([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [currentText, setCurrentText] = useState<string>(''); // 사용자가 입력한 텍스트
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // 재생하고 있는 중인지
  const [currentReferenceText, setCurrentReferenceText] = useState<string>('');
  const maxDataPoints = 20;

  const [pronounceData, setPronounceData] = useState();

  const dirs = RNFetchBlob.fs.dirs;
  const path = Platform.select({
    ios: undefined, // iOS 경로 지정 필요
    android: `${dirs.CacheDir}/hello.wav`,
  });

  const audioRecorderPlayer = new AudioRecorderPlayer();
  audioRecorderPlayer.setSubscriptionDuration(0.1);

  useEffect(() => {
    // 컴포넌트 언마운트 시 리소스 정리
    return () => {
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, []);

  useEffect(() => {
    console.log('파형 차트', referenceText); // recordTime 상태가 변경될 때마다 실행됩니다.
  }, [referenceText]); // recordTime을 의존성 배열에 추가

  useEffect(() => {
    console.log(recordTime); // recordTime 상태가 변경될 때마다 실행됩니다.
  }, [recordTime]); // recordTime을 의존성 배열에 추가

  // 메터링 값이 변경될 때 데이터 포인트 업데이트
  useEffect(() => {
    setDataPoints(currentDataPoints => {
      const newPoints = [...currentDataPoints, Math.max(meter + 60, 0)];
      return newPoints.slice(-maxDataPoints);
    });
  }, [meter]);

  useEffect(() => {
    console.log(pronounceData);
  }, [pronounceData]);

  useEffect(() => {
    setCurrentReferenceText(referenceText);
    console.log('파형차트', currentReferenceText);
  }, [referenceText]);

  // 녹음 시작 버튼
  const onStartRecord = React.useCallback(async () => {
    // 다시 녹음할 시 그려져 있던 그래프 초기화
    setDataPoints([]);
    setIsPlaying(false);

    if (Platform.OS === 'android') {
      // 권한 요청
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.READ_MEDIA_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        } else {
          console.log('All required permissions not granted');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    setIsRecording(true);

    // 오디오 인코딩 및 소스 관련 설정
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.VOICE_RECOGNITION,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
    };

    const meteringEnabled = true;
    const uri = await audioRecorderPlayer.startRecorder(
      path,
      audioSet,
      meteringEnabled,
    );

    audioRecorderPlayer.addRecordBackListener(e => {
      setRecordSecs(e.currentPosition);
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      setMeter(Math.floor(e.currentMetering ?? 0));
    });
    console.log(`uri: ${uri}`);
  }, []);

  const onStopRecord = React.useCallback(async () => {
    setIsRecording(false);
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setRecordSecs(0);
    console.log(result);
  }, []);

  const onStartPlay = React.useCallback(async () => {
    setIsPlaying(true);

    console.log('onStartPlay', path);

    try {
      const msg = await audioRecorderPlayer.startPlayer(path);
      const volume = await audioRecorderPlayer.setVolume(1.0);
      console.log(`경로: ${msg}`, `볼륨: ${volume}`);

      audioRecorderPlayer.addPlayBackListener(e => {
        console.log('playBackListener', e);
        setCurrentPositionSec(e.currentPosition);
        setCurrentDurationSec(e.duration);
        setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
        setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
      });
    } catch (err) {
      console.log('startPlayer error', err);
    }
  }, []); // 의존성 배열에 path 또는 audioRecorderPlayer가 변할 경우를 대비해 추가할 수 있습니다.

  const onStopPlay = async () => {
    // 재생 중지 로직
  };

  const filePath =
    'file:////data/user/0/com.reactnativepractice/cache/hello.wav';

  // 음성 파일 서버에 전송하는 부분
  const uploadFile = async (filePath: string, referenceText: string) => {
    const tokenData = await getToken();
    const accessToken = tokenData?.access_token;

    try {
      // FormData 객체 생성
      const formData = new FormData();

      // rn-fetch-blob을 사용하여 파일의 실제 데이터를 포함시키기
      // 여기서는 filePath를 직접 사용합니다. 'file://' 접두사가 필요할 수 있습니다.
      let filename = filePath.split('/').pop(); // 파일 경로에서 파일 이름 추출
      formData.append('audio', {
        uri: filePath,
        type: 'audio/wav', // MIME 타입 지정
        name: filename, // 파일 이름 지정
      });

      // 참조 텍스트를 FormData에 추가
      formData.append('referenceText', currentReferenceText);

      // axios를 사용하여 파일과 참조 텍스트를 함께 전송
      let response = await axios.post(
        'http://10.0.2.2:8000/api/speech',
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('발음 평가 성공');
      setPronounceData(response.data.speechResult.result.NBest[0]);
    } catch (error) {
      console.error('Error uploading file:', error);

      // 에러 응답이 존재하는 경우, 상태 코드와 함께 에러 메시지를 출력합니다.
      if (error.response) {
        console.error(`Error Status: ${error.response.status}`);
        console.error(`Error Data: ${JSON.stringify(error.response.data)}`);
        console.error(
          `Error Headers: ${JSON.stringify(error.response.headers)}`,
        );
      } else if (error.request) {
        // 요청은 이루어졌으나 응답을 받지 못한 경우
        console.error(`Error Request: ${error.request}`);
      } else {
        // 요청 설정 시 발생한 오류
        console.error('Error', error.message);
      }

      // 에러 설정 정보
      console.error('Error config:', error.config);
    }
  };

  let playWidth =
    (currentPositionSec / currentDurationSec) * (screenWidth - 56);
  playWidth = !playWidth ? 0 : playWidth;

  // 여기에 그리기 로직 추가 (예: createPath 함수 구현 필요)
  // 파형 그래프를 그리는 함수
  const createPath = dataPoints => {
    let path = '';
    dataPoints.forEach((data: number, index: number) => {
      const x = screenWidth / 2 - (maxDataPoints - index - 1) * 10;
      const y = 100 - (data * 100) / 100;
      if (index === 0) {
        path = `M${x},${y}`;
      } else {
        path += ` L${x},${y}`;
      }
    });
    return path;
  };

  return (
    <SafeAreaView>
      <View
        style={{
          width: 350,
          borderWidth: 1,
          height: 110,
          borderColor: 'white',
        }}>
        <Svg width={'100%'} height={'100%'} style={{}}>
          <Path
            d={createPath(dataPoints)}
            fill="none"
            stroke="white"
            strokeWidth={3}
          />
        </Svg>
      </View>

      <View style={{width: '100%', flexDirection: 'row'}}>
        {!isRecording ? (
          <TouchableOpacity style={styles.btn} onPress={onStartRecord}>
            <Icon name="mic" size={20} color={'black'} />
            <Text>녹음하기</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btn} onPress={onStopRecord}>
            <Icon name="stop" size={20} color={'black'} />
            <Text>저장하기</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.btn} onPress={onStartPlay}>
          <Icon name="caret-forward-outline" size={20} color={'black'}></Icon>
          <Text>재생하기</Text>
        </TouchableOpacity>

        {!isPlaying ? (
          <Text style={styles.timerTxt}>{recordTime}</Text>
        ) : (
          <Text style={styles.timerTxt}>{playTime}</Text>
        )}
      </View>

      <Button
        style={{
          width: 150,
          height: 30,
          backgroundColor: '#5E81F4',
          margin: 10,
          alignItems: 'center',
        }}
        onPress={() => {
          uploadFile(filePath, currentText);
        }}>
        서버에 음성파일 전송
      </Button>
      {pronounceData && (
        <>
          <Text style={{color: 'white'}}>
            평가텍스트 : {pronounceData.Display}
          </Text>
          <View style={{flexDirection: 'row', width: '100%', borderWidth: 3}}>
            <View style={{width: '30%', borderWidth: 3, alignItems: 'center'}}>
              <CircleChart percent={pronounceData.AccuracyScore} />
              <Text style={{color: 'white'}}>발음점수</Text>
            </View>
            <View style={{width: '30%', borderWidth: 3, alignItems: 'center'}}>
              <CircleChart percent={pronounceData.CompletenessScore} />
              <Text style={{color: 'white'}}>완전성</Text>
            </View>
            <View style={{width: '30%', borderWidth: 3, alignItems: 'center'}}>
              <CircleChart percent={pronounceData.PronScore} />
              <Text style={{color: 'white'}}>종합 발음 점수</Text>
            </View>
          </View>
          <Text style={{color: 'white'}}>
            피드백 : {pronounceData.Words[0].ErrorType}
          </Text>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212A3E',
    flexDirection: 'column',
    alignItems: 'center',
  },
  viewRecorder: {
    width: '100%',
    alignItems: 'center',
  },
  recordBtnWrapper: {
    flexDirection: 'row',
  },
  viewPlayer: {
    marginTop: 60,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  viewBarWrapper: {
    marginTop: 28,
    marginHorizontal: 28,
    alignSelf: 'stretch',
  },
  viewBar: {
    backgroundColor: '#ccc',
    height: 4,
    alignSelf: 'stretch',
  },
  viewBarPlay: {
    backgroundColor: 'white',
    height: 4,
    width: 0,
  },
  playStatusTxt: {
    marginTop: 8,
    color: '#ccc',
  },
  playBtnWrapper: {
    flexDirection: 'row',
  },
  btn: {
    borderColor: 'white',
    width: 80,
    height: 25,
    margin: 10,
    flexDirection: 'row',
    borderWidth: 1,
    backgroundColor: 'pink',
  },
  txt: {
    color: 'white',
    fontSize: 14,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  txtRecordCounter: {
    color: 'white',
    fontSize: 20,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
  },
  txtCounter: {
    marginTop: 12,
    color: 'white',
    fontSize: 20,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
  },
  timerTxt: {
    color: 'white',
    fontSize: 20,
    margin: 10,
    flexDirection: 'row',
    marginLeft: 50,
  },
});

export default AudioWaveFormChart;
