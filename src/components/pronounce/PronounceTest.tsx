import React, {useCallback, useEffect, useState} from 'react';
import {
  Button,
  NativeModules,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TextInput,
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
import api from '../../api';
import {getToken} from '../../utils/AuthStorage';
const {PitchModule} = NativeModules;
import PitchChart from './PitchChart';
import RNFS from 'react-native-fs';
import {Buffer} from 'buffer'; // Buffer 라이브러리 import
import BackButton from '../button/backButton';
import Icon from 'react-native-vector-icons/Ionicons';
import CircleChart from '../chart/CircleChart';
import {StyleSheet} from 'react-native';

const PronounceTest: React.FC = () => {
  const [recordSecs, setRecordSecs] = useState(0);
  const [recordTime, setRecordTime] = useState('00:00:00');
  const [currentPositionSec, setCurrentPositionSec] = useState(0);
  const [currentDurationSec, setCurrentDurationSec] = useState(0);
  const [playTime, setPlayTime] = useState('00:00:00');
  const [duration, setDuration] = useState('00:00:00');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // 재생하고 있는 중인지

  const [pitchData, setPitchData] = useState([]); // 유저 피치 저장
  const [TTSPitchData, setTTSPitchData] = useState([]); // TTS 피치 저장

  const [referenceText, setReferenceText] = useState<string>('');

  const [pronounceData, setPronounceData] = useState();

  useEffect(() => {
    console.log('녹음된 데이터', pronounceData);
  }, [pronounceData]);

  const filePath = `${RNFetchBlob.fs.dirs.CacheDir}/UserAudio.wav`;

  // 음성 파일 서버에 전송하는 함수
  const uploadFile = async (filePath: string, referenceText: string) => {
    console.log(
      '서버전송 사용자 음성 경로 + 기준 텍스트',
      filePath,
      referenceText,
    );

    try {
      // FormData 객체 생성
      const formData = new FormData();

      // rn-fetch-blob을 사용하여 파일의 실제 데이터를 포함시키기
      // 여기서는 filePath를 직접 사용합니다. 'file://' 접두사가 필요할 수 있습니다.
      let filename = filePath.split('/').pop(); // 파일 경로에서 파일 이름 추출
      const fileUri = `file://${filePath}`;
      console.log(
        '폼데이터에 추가하는 파일패스',
        fileUri,
        '파일 이름',
        filename,
      );
      formData.append('audio', {
        uri: fileUri,
        type: 'audio/wav', // MIME 타입 지정
        name: filename, // 파일 이름 지정
      });

      // 참조 텍스트를 FormData에 추가
      formData.append('referenceText', referenceText);

      console.log(formData);

      // axios를 사용하여 파일과 참조 텍스트를 함께 전송
      let response = await api.post('/speech', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('발음 평가 결과 응답', response);

      console.log('발음 평가 성공');
      setPronounceData(response.data.speechResult);
      console.log('발음평가결과', response.data.speechResult);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // 발음 평가 기준텍스트를 서버에 전송함
  // 서버에서 받은 기준텍스트를 기준으로 TTS 후,
  // 프론트로 음성파일 전송
  const TextToSpeechAndSaveAudio = async () => {
    try {
      const url = '/speech/tts';
      const data = JSON.stringify({referenceText: referenceText});

      const response = await api({
        method: 'post',
        url: url,
        data: data,
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      });

      if (response.status === 200) {
        console.log('응답TTS데이터', response.data);
        const base64Audio = Buffer.from(response.data).toString('base64');
        console.log('Base64 Audio Data:', base64Audio.substring(0, 100));

        try {
          const TTSpath = `${RNFS.CachesDirectoryPath}/TTSAudio.wav`;
          await RNFS.writeFile(TTSpath, base64Audio, 'base64');
          console.log('File written:', TTSpath);
          const fileExists = await RNFS.exists(TTSpath);
          console.log('File exists at:', TTSpath, fileExists);

          pitchTest(TTSpath);
          onStartTTSPlay();
        } catch (error) {
          console.error('Error writing file:', error);
        }
      }
    } catch (error) {
      console.error('TTS 생성이나 저장 실패:', error);
    }
  };

  // 저장된 TTS 음성파일을 재생하는 함수
  // TTS 음성파일 재생하는 함수 수정
  const onStartTTSPlay = React.useCallback(async () => {
    audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();

    setIsPlaying(true);

    const TTSPath = `${RNFetchBlob.fs.dirs.CacheDir}/TTSAudio.wav`;

    console.log('onStartTTSPlay경로', TTSPath);

    try {
      const msg = await audioRecorderPlayer.startPlayer(TTSPath);
      const volume = await audioRecorderPlayer.setVolume(5.0);
      console.log(`경로: ${msg}`, `볼륨: ${volume}`);

      audioRecorderPlayer.addPlayBackListener(e => {
        // console.log('playBackListener', e);
        setCurrentPositionSec(e.currentPosition);
        setCurrentDurationSec(e.duration);
        setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
        setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
      });
    } catch (err) {
      console.log('TTSstartPlayer error', err);
    }
  }, []);

  // 네이티브 모듈을 이용해서 TTS와 사용자 음성파일의 피치 비교를 하는 함수
  const pitchTest = (filePath: string) => {
    console.log('파일경로 : ', filePath);
    PitchModule.analyzePitch(filePath)
      .then(pitchValue => {
        console.log('Pitch detected:', pitchValue);
        const filteredPitchData = pitchValue.filter(item => item.pitch < 1000);

        const userAudioPath = `${RNFetchBlob.fs.dirs.CacheDir}/UserAudio.wav`;
        console.log('유저 음성 경로111', userAudioPath);
        const ttsAudioPath = `${RNFetchBlob.fs.dirs.CacheDir}/TTSAudio.wav`;
        console.log('TTS 음성 경로111', ttsAudioPath);

        if (filePath === userAudioPath) {
          setPitchData(filteredPitchData);
          uploadFile(filePath, referenceText);
        } else if (filePath === ttsAudioPath) {
          setTTSPitchData(filteredPitchData);
        } else {
          console.log('이상한경로포착', filePath);
        }
      })
      .catch(error => {
        console.log('Error detecting pitch:', error);
      });
  };

  const fileExists = async filePath => {
    try {
      const exists = await RNFS.exists(filePath);
      console.log(`File exists at ${filePath}: ${exists}`);
      return exists;
    } catch (error) {
      console.error(`Error checking file existence at ${filePath}: ${error}`);
      return false;
    }
  };

  useEffect(() => {
    console.log(
      '사용자 녹음 피치값 : ',
      pitchData.length,
      'TTS  피치값 : ',
      TTSPitchData.length,
      isRecording,
    );
  }, [pitchData, TTSPitchData]);

  useEffect(() => {
    console.log('isRecording : ', isRecording);
  }, [isRecording]);

  const dirs = RNFetchBlob.fs.dirs;
  const path = Platform.select({
    ios: undefined, // iOS 경로 지정 필요
    android: `${dirs.CacheDir}/UserAudio.wav`,
  });

  const audioRecorderPlayer = new AudioRecorderPlayer();
  audioRecorderPlayer.setSubscriptionDuration(0.1);

  // 컴포넌트 언마운트 시 리소스 정리
  useEffect(() => {
    return () => {
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, []);

  useEffect(() => {
    console.log('레코드타임:', recordTime);
  }, [recordTime]);
  playTime;

  useEffect(() => {
    console.log('플레이타임', playTime);
  }, [playTime]);

  useEffect(() => {
    console.log(referenceText);
  }, [referenceText]);

  // 유저 목소리를 녹음하는 함수
  const onStartRecord = React.useCallback(async () => {
    setIsRecording(true);

    // 플랫폼에 따른 권한 요청
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

    // 오디오 인코딩 및 소스 관련 설정
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
      SampleRateAndroid: 44100,
      SampleRateIOS: 44100,
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
    });
    console.log(`uri: ${uri}`);
  }, []);

  const newPath = `${dirs.CacheDir}/UserAudio.wav`;

  // 녹음 중지 및 증폭된 오디오 파일 업로드 함수
  const onStopRecord = React.useCallback(async () => {
    setIsRecording(false);
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setRecordSecs(0);
    console.log(result, '에 저장되었습니다.');
    amplifyVolume(result);
  }, []);

  const amplifyVolume = async filePath => {
    try {
      const result = await PitchModule.amplifyAudioVolume(filePath, 5.0); // 증폭 비율 .0
      console.log('Amplified file saved at: ', result);
      // pitchTest(result);
    } catch (error) {
      console.error('Amplification failed:', error);
    }
  };

  // 유저 목소리를 재생하는 함수
  const onStartPlay = React.useCallback(async () => {
    setIsPlaying(true);

    console.log('onStartPlay', path);

    try {
      const msg = await audioRecorderPlayer.startPlayer(path);
      const volume = await audioRecorderPlayer.setVolume(1.0);
      console.log(`경로: ${msg}`, `볼륨: ${volume}`);

      audioRecorderPlayer.addPlayBackListener(e => {
        // console.log('playBackListener', e);
        setCurrentPositionSec(e.currentPosition);
        setCurrentDurationSec(e.duration);
        setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
        setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
      });
    } catch (err) {
      console.log('startPlayer error', err);
    }
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>発音評価</Text>
        </View>
      </View>
      <View style={styles.backgroundHeader}></View>
      {/* 메인 컨테이너 */}
      <View style={styles.mainContainer}>
        {/* 기준 텍스트 입력 창 */}
        <TextInput
          placeholder="基準となるテキストを入力してください."
          style={styles.input}
          onChangeText={text => setReferenceText(text)}
          multiline={true}
        />
        {/* 음성으로 들어보기 버튼 부분 */}
        <View
          style={{
            width: '95%',
            height: 40,
            marginTop: 7,
            borderRadius: 10,
            borderColor: 'grey',
            backgroundColor: 'white',
            elevation: 10,
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            onPress={TextToSpeechAndSaveAudio}
            style={styles.ttsButton}>
            <Icon
              name="caret-forward-circle-outline"
              size={20}
              color={'white'}
            />
            <Text style={styles.ttsButtonText}>音声で聞く</Text>
          </TouchableOpacity>
        </View>
        {/* 피치 그래프 부분 */}
        <View style={styles.pitchChartContainer}>
          {(pitchData.length !== 0 || TTSPitchData.length !== 0) && (
            <PitchChart pitchData={pitchData} TTSPitchData={TTSPitchData} />
          )}
        </View>

        {/* 녹음 시작 + 평가하기 버튼 부분 */}
        <View
          style={{
            width: '95%',
            height: 40,
            marginTop: 7,
            borderRadius: 10,
            borderColor: 'grey',
            backgroundColor: 'white',
            elevation: 10,
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}>
          {/* 녹음시작 + 녹음종료 버튼 */}
          <View
            style={{
              width: '50%',
              height: '100%',
              // borderWidth: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 2,
              left: -3,
            }}>
            <View style={styles.recordingContainer}>
              {isRecording ? (
                <TouchableOpacity
                  onPress={onStopRecord}
                  style={styles.recordButton}>
                  <Icon name="stop" size={17} color={'white'} />
                  <Text style={styles.recordButtonText}>録音終了</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={onStartRecord}
                  style={styles.recordButton}>
                  <Icon name="mic" size={17} color={'white'} />
                  <Text style={styles.recordButtonText}>録音開始</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onStartPlay} style={styles.playButton}>
                <Icon name="volume-high" size={20} color={'white'} />
              </TouchableOpacity>
            </View>
          </View>
          {/* 평가하기 버튼 */}
          <TouchableOpacity
            onPress={() =>
              pitchTest(
                '/data/user/0/com.reactnativepractice/cache/UserAudio.wav',
              )
            }
            style={styles.evaluateButton}>
            <Text style={styles.evaluateButtonText}>評価する</Text>
          </TouchableOpacity>
        </View>

        {/* 발음 평가 결과 부분 */}
        <ScrollView
          style={{
            width: '95%',
            minHeight: 300,
            marginTop: 7,
            borderRadius: 10,
            borderColor: 'grey',
            backgroundColor: 'white',
            elevation: 10,
            marginBottom: 10,
          }}>
          {pronounceData && (
            <>
              <Text style={{color: 'grey', margin: 5, fontWeight: 'bold'}}>
                評価結果
              </Text>
              {/* 기준 텍스트 출력 부분 ( + 점수에 따른 텍스트 색 변화 기능 추가해야 함) */}
              <View
                style={{
                  width: '100%',
                  height: 30,
                  alignItems: 'center',
                }}>
                <Text
                  style={{fontSize: 15, color: 'black', fontWeight: 'bold'}}>
                  {pronounceData?.pronunciationAssessmentResult?.Display}
                </Text>
              </View>
              {/* 점수원그래프 부분 */}
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                  marginBottom: 10,
                }}>
                <View style={{width: '20%', alignItems: 'center'}}>
                  <CircleChart
                    percent={Math.round(
                      pronounceData.pronunciationAssessmentResult.AccuracyScore,
                    )}
                  />
                  <Text style={{color: '#006fff'}}>発音</Text>
                </View>
                <View style={{width: '20%', alignItems: 'center'}}>
                  <CircleChart
                    percent={Math.round(
                      pronounceData.pronunciationAssessmentResult
                        .CompletenessScore,
                    )}
                  />
                  <Text style={{color: '#006fff'}}>完全性</Text>
                </View>
                <View style={{width: '20%', alignItems: 'center'}}>
                  <CircleChart
                    percent={Math.round(
                      pronounceData.pronunciationAssessmentResult.FluencyScore,
                    )}
                  />
                  <Text style={{color: '#006fff'}}>流暢さ</Text>
                </View>
                <View style={{width: '20%', alignItems: 'center'}}>
                  <CircleChart
                    percent={Math.round(
                      pronounceData.pronunciationAssessmentResult.PronScore,
                    )}
                  />
                  <Text style={{color: '#006fff'}}>総合</Text>
                </View>
                <View style={{width: '20%', alignItems: 'center'}}>
                  <CircleChart
                    percent={Math.round(pronounceData.pitchComparisonResult)}
                  />
                  <Text style={{color: '#006fff'}}>ピッチ</Text>
                </View>
              </View>

              <View style={{alignItems: 'center'}}>
                {/* 잘못된 발음 표시하기 */}
                {pronounceData?.pronunciationAssessmentResult?.Words.map(
                  (item, index) => (
                    <View
                      key={index}
                      style={{
                        width: '95%',
                        height: 35,
                        borderRadius: 1,
                        // borderWidth: 1,
                        marginTop: 5,
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        borderColor: 'grey',
                        elevation: 2,
                      }}>
                      <View
                        style={{
                          width: '30%',
                          height: '100%',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            color: 'black',
                            fontSize: 17,
                            fontWeight: 'bold',
                            marginLeft: 5,
                          }}>
                          {item.Word}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: '30%',
                          height: '100%',
                          justifyContent: 'center',
                          alignItems: 'flex-end',
                        }}>
                        <Text
                          style={{
                            color: 'black',
                            fontSize: 13,
                            marginRight: 5,
                          }}>
                          {' '}
                          {item.ErrorType === 'None'
                            ? '問題なし'
                            : item.ErrorType === 'Mispronunciation'
                            ? '発音の間違い'
                            : item.ErrorType}
                        </Text>
                      </View>
                    </View>
                  ),
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default PronounceTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 40,
    backgroundColor: '#0077ff',
    zIndex: 999,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 10,
  },
  backgroundHeader: {
    backgroundColor: '#0077ff',
    width: '100%',
    height: 140,
    position: 'absolute',
  },
  mainContainer: {
    flex: 1,
    margin: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderColor: 'grey',
    alignItems: 'center',
    elevation: 10,
  },
  input: {
    width: '95%',
    height: 80,
    marginTop: 10,
    borderRadius: 10,
    borderColor: 'grey',
    backgroundColor: 'white',
    elevation: 15,
    textAlignVertical: 'top', // 텍스트를 상단에서 시작
  },
  ttsButton: {
    width: 140,
    height: 30,
    backgroundColor: '#2E64FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    marginLeft: 5,
  },
  ttsButtonText: {
    fontSize: 15,
    color: 'white',
    // fontWeight: 'bold',
    marginBottom: 4,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  recordButton: {
    width: 120,
    height: 30,
    backgroundColor: '#2E64FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginLeft: '5%',
    flexDirection: 'row',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 15,
    // fontWeight:'bold'
    marginBottom: 3,
  },
  playButton: {
    width: 30,
    height: 30,
    backgroundColor: '#2E64FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    left: 2,
    marginBottom: 2,
  },
  evaluateButton: {
    width: 120,
    height: 30,
    backgroundColor: '#2E64FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 5,
    alignSelf: 'flex-start',
    marginRight: '1%',
  },
  evaluateButtonText: {
    color: 'white',
    fontSize: 15,
    marginBottom: 2,
  },
  pitchChartContainer: {
    width: '95%',
    height: 200,
    marginTop: 7,
    borderRadius: 10,
    borderColor: 'grey',
    backgroundColor: 'white',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 10,
  },
});
