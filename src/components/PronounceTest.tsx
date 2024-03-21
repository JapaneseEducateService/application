import React, {Component} from 'react';
import {
  Dimensions,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
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
import {styles} from './PronounceTestStyles.tsx';
import Button from './Button.tsx';
import type {ReactElement} from 'react';
import {Svg, Path} from 'react-native-svg';

interface State {
  isLoggingIn: boolean;
  recordSecs: number;
  recordTime: string;
  currentPositionSec: number;
  currentDurationSec: number;
  playTime: string;
  duration: string;
  meter: number; // 미터링 값 상태 추가
}

const screenWidth = Dimensions.get('screen').width;

class PronounceTest extends Component<any, State> {
  private dirs = RNFetchBlob.fs.dirs;
  private path = Platform.select({
    ios: undefined,
    android: `${this.dirs.CacheDir}/hello.mp3`,

    // Discussion: https://github.com/hyochan/react-native-audio-recorder-player/discussions/479
    // ios: 'https://firebasestorage.googleapis.com/v0/b/cooni-ebee8.appspot.com/o/test-audio.mp3?alt=media&token=d05a2150-2e52-4a2e-9c8c-d906450be20b',
    // ios: 'https://staging.media.ensembl.fr/original/uploads/26403543-c7d0-4d44-82c2-eb8364c614d0',
    // ios: 'hello.m4a',
    // android: `${this.dirs.CacheDir}/hello.mp3`,
  });

  private audioRecorderPlayer: AudioRecorderPlayer;

  constructor(props: any) {
    super(props);
    this.state = {
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      currentPositionSec: 0,
      currentDurationSec: 0,
      playTime: '00:00:00',
      duration: '00:00:00',
      meter: 0, // 초기값 설정
    };

    // 초기화
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.1); // optional. Default is 0.5
  }

  public render(): ReactElement {
    let playWidth =
      (this.state.currentPositionSec / this.state.currentDurationSec) *
      (screenWidth - 56);

    if (!playWidth) {
      playWidth = 0;
    }

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.txtRecordCounter}>{this.state.recordTime}</Text>
        <View style={styles.viewRecorder}>
          <View style={styles.recordBtnWrapper}>
            <Button
              style={styles.btn}
              onPress={this.onStartRecord}
              textStyle={styles.txt}>
              Record
            </Button>
            <Button
              style={[styles.btn, {marginLeft: 12}]}
              onPress={this.onStopRecord}
              textStyle={styles.txt}>
              Stop
            </Button>
          </View>
          {/* 그래프 추가 */}
          <Svg width={screenWidth} height={200}>
            <Path
              d={this.createPath()}
              fill="none"
              stroke="black"
              strokeWidth={3}
            />
          </Svg>
        </View>
        <View style={styles.viewPlayer}>
          <TouchableOpacity
            style={styles.viewBarWrapper}
            onPress={this.onStatusPress}>
            <View style={styles.viewBar}>
              <View style={[styles.viewBarPlay, {width: playWidth}]} />
            </View>
          </TouchableOpacity>
          <Text style={styles.txtCounter}>
            {this.state.playTime} / {this.state.duration}
          </Text>
          <View style={styles.playBtnWrapper}>
            <Button
              style={styles.btn}
              onPress={this.onStartPlay}
              textStyle={styles.txt}>
              Play
            </Button>
            <Button
              style={[
                styles.btn,
                {
                  marginLeft: 12,
                },
              ]}
              onPress={this.onStopPlay}
              textStyle={styles.txt}>
              Stop
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 데이터 포인트를 저장하는 배열
  private dataPoints: number[] = [];


// 화면에 표시할 최대 데이터 포인트 수
private maxDataPoints = 20; 

private createPath = (): string => {
  const adjustedMeterValue = this.state.meter + 60;
  this.dataPoints.push(Math.max(adjustedMeterValue, 0));

  if (this.dataPoints.length > this.maxDataPoints) {
    this.dataPoints.shift(); // 배열의 첫 번째 요소 제거
  }


  let path = "";
  this.dataPoints.forEach((data, index) => {
    const x = (screenWidth / 2) - (this.maxDataPoints - index - 1) * 10; // 데이터 포인트 간의 간격 조정
    const y = 200 - (data * 200) / 100;
    if (index === 0) {
      path = `M${x},${y}`; // 첫 번째 데이터 포인트에서 경로 시작
    } else {
      path += ` L${x},${y}`; // 이후 데이터 포인트들로 선 그리기
    }
  });

  return path;
};


  private onStatusPress = (e: any): void => {
    const touchX = e.nativeEvent.locationX;
    console.log(`touchX: ${touchX}`);

    const playWidth =
      (this.state.currentPositionSec / this.state.currentDurationSec) *
      (screenWidth - 56);
    console.log(`currentPlayWidth: ${playWidth}`);

    const currentPosition = Math.round(this.state.currentPositionSec);

    if (playWidth && playWidth < touchX) {
      const addSecs = Math.round(currentPosition + 1000);
      this.audioRecorderPlayer.seekToPlayer(addSecs);
      console.log(`addSecs: ${addSecs}`);
    } else {
      const subSecs = Math.round(currentPosition - 1000);
      this.audioRecorderPlayer.seekToPlayer(subSecs);
      console.log(`subSecs: ${subSecs}`);
    }
  };

  // 녹음을 시작하는 부분
  private onStartRecord = async (): Promise<void> => {
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
          console.log('권한 요청 성공');
        } else {
          console.log('권한 요청 실패');

          return;
        }
      } catch (err) {
        console.warn(err);

        return;
      }
    }

    // 오디오 인코딩 및 소스 관련 설정
    const audioSet: AudioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
    };

    const meteringEnabled = true;
    const uri = await this.audioRecorderPlayer.startRecorder(
      this.path,
      audioSet,
      meteringEnabled,
    );

    this.audioRecorderPlayer.addRecordBackListener((e: RecordBackType) => {
      // console.log('record-back', e);
      this.setState({
        recordSecs: e.currentPosition,
        recordTime: this.audioRecorderPlayer.mmssss(
          Math.floor(e.currentPosition),
        ),
        meter: Math.floor(e.currentMetering ?? 0), // 미터 값 업데이트
      });
      console.log(e.currentMetering);
    });
    console.log(`uri: ${uri}`);
  };

  // 녹음 종료 버튼
  private onStopRecord = async (): Promise<void> => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    this.setState({
      recordSecs: 0,
    });
    console.log(result);
  };

  // 재생 버튼
  private onStartPlay = async (): Promise<void> => {
    console.log('onStartPlay', this.path);

    try {
      const msg = await this.audioRecorderPlayer.startPlayer(this.path);

      //? Default path
      // const msg = await this.audioRecorderPlayer.startPlayer();
      const volume = await this.audioRecorderPlayer.setVolume(1.0);
      console.log(`경로: ${msg}`, `볼륨: ${volume}`);

      this.audioRecorderPlayer.addPlayBackListener((e: PlayBackType) => {
        console.log('playBackListener', e);
        this.setState({
          currentPositionSec: e.currentPosition,
          currentDurationSec: e.duration,
          playTime: this.audioRecorderPlayer.mmssss(
            Math.floor(e.currentPosition),
          ),
          duration: this.audioRecorderPlayer.mmssss(Math.floor(e.duration)),
        });
      });
    } catch (err) {
      console.log('startPlayer error', err);
    }
  };

  // 재생 종료
  private onStopPlay = async (): Promise<void> => {
    console.log('onStopPlay');
    this.audioRecorderPlayer.stopPlayer();
    this.audioRecorderPlayer.removePlayBackListener();
  };
}

export default PronounceTest;
