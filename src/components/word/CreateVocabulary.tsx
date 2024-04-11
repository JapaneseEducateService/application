import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Button,
  ScrollView,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import OcrTest from '../OcrTest';
import axios from 'axios';
import {getToken} from '../../utils/AuthStorage';
import BackButton from '../button/backButton';

type WordMainProps = {
  navigation: StackNavigationProp<RootStackParamList, 'CreateVocabulary'>;
};

type RootStackParamList = {
  CreateVocabulary: undefined;
};

interface Vocabulary {
  title: string;
  kanji: string[];
  gana: string[];
  meaning: string[];
}

const WordMain: React.FC<WordMainProps> = ({navigation}) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isOcrChecked, setIsOcrChecked] = useState<boolean>(false);
  const [currentTitle, setCurrentTitle] = useState<string>(''); // 단어장 제목

  const [wordId, setWordId] = useState<number>(); // 만드는 단어장 id

  const [currentKanji, setCurrentKanji] = useState<string>('');
  const [currentGana, setCurrentGana] = useState<string>('');
  const [currentMeaning, setCurrentMeaning] = useState<string>('');

  // 임시 단어장의 초기 상태와 함께 상태 타입을 명시적으로 설정
  const [tempVocabulary, setTempVocabulary] = useState<Vocabulary>({
    title: '',
    kanji: [],
    gana: [],
    meaning: [],
  });

  // OCR 결과 업데이트 핸들러
const handleUpdate = (updatedOCRResult) => {
  setTempVocabulary(prevVocabulary => ({
    ...prevVocabulary,
    title: currentTitle, // 현재 제목 유지
    kanji: updatedOCRResult.kanji,
    gana: updatedOCRResult.gana,
    meaning: updatedOCRResult.meaning,
  }));
};


  useEffect(() => {
    console.log(tempVocabulary);
  }, [tempVocabulary]);

  useEffect(() => {
    console.log('단어장 id', wordId);
  }, [wordId]);

  // 직접 단어장 생성을 눌렀을 때
  const handleDirectCreation = async () => {
    if (!currentTitle) {
      console.log('제목을 입력해주세요.');
      return;
    }

    // 임시 단어장에 제목 추가하기
    setTempVocabulary(prevVocabulary => ({
      ...prevVocabulary,
      title: currentTitle, // 현재 제목을 단어장의 제목으로 설정
    }));

    setIsChecked(true);
  };

  // 단어장 생성에서 뒤로가기
  // const back = () => {
  //   setIsChecked(false);
  // };

  // OCR로 단어장 생성을 눌렀을 때
  const handleDirectCreationOcr = () => {
    if (!currentTitle) {
      console.log('제목을 입력해주세요.');
      return;
    }
    setIsOcrChecked(true);
  };

  // OCR로 생성한 단어장 저장하는 로직
  const setVocabularyToOcr = () => {
    
  };

  // 단어 하나씩 임시 저장하는 로직
  const setTempWord = async () => {
    // 단어 정보가 모두 입력되었는지 확인
    if (!currentKanji || !currentGana || !currentMeaning) {
      console.error('모든 단어 정보를 입력해주세요.');
      return;
    }

    // 임시 단어장에 저장
    setTempVocabulary(prevVocabulary => ({
      ...prevVocabulary,
      kanji: [...prevVocabulary.kanji, currentKanji],
      gana: [...prevVocabulary.gana, currentGana],
      meaning: [...prevVocabulary.meaning, currentMeaning],
    }));

    // 저장 후 현재 입력 필드 초기화
    setCurrentKanji('');
    setCurrentGana('');
    setCurrentMeaning('');

    console.log('단어 임시 저장 완료');
    // 토큰 가져오기
    // const tokenResponse = await getToken();
    // if (!tokenResponse || !tokenResponse.access_token) {
    //   console.error('토큰을 가져오는 데 실패했습니다.');
    //   return;
    // }
  };

  // header에 단어장 id, 토큰
  // body에 단어장 이름, 한자, 가나, 의미
  // http://10.0.2.2:8000/api/vocabularyNote/{wordId}경로로 axios patch요청
  const setWord = async () => {
    console.log('임시 단어장: ', tempVocabulary);

    // 토큰 가져오기
    const {access_token} = await getToken();
    if (!access_token) {
      console.error('토큰을 가져오는 데 실패했습니다.');
      return;
    }
    // const access_token = '5|taKc9ZOielMBu8vOiEs0F5xskLFYxWkwOwkxqC0p8b4d7451';

    // kanji, gana, meaning 배열을 JSON 문자열로 변환
    const data = {
      ...tempVocabulary,
      kanji: JSON.stringify(tempVocabulary.kanji),
      gana: JSON.stringify(tempVocabulary.gana),
      meaning: JSON.stringify(tempVocabulary.meaning),
    };

    console.log(data);

    // 서버에 데이터 전송
    await axios
      .post('http://10.0.2.2:8000/api/vocabularyNote', data, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (response.status === 200) {
          console.log('단어장 생성 성공:', response.data);
          setWordId(response.data.note.id);

          navigation.navigate('WordMain');
        } else {
          console.error('단어장 생성 실패');
        }
      })
      .catch(error => {
        // 서버로부터 응답이 있었을 경우
        if (error.response) {
          console.error('에러 상태 코드:', error.response.status);
          console.error('에러 상태 메시지:', error.response.statusText);
          console.error('에러 응답 본문:', error.response.data);
        } else if (error.request) {
          // 요청은 이루어졌으나 응답을 받지 못했을 경우
          console.error(
            '응답을 받지 못함. 요청은 이루어졌지만 응답을 받지 못했습니다:',
            error.request,
          );
        } else {
          // 요청 설정 시 발생한 오류
          console.error('요청 설정 중 에러 발생:', error.message);
        }

        // 에러에 대한 구체적인 설정 정보
        console.error('에러 설정 정보:', error.config);
      });
  };

  return (
    <>
      <View style={{backgroundColor: '#212A3E', paddingBottom: 20, height: 40}}>
        <BackButton />
      </View>
      <View style={{backgroundColor: '#212A3E'}}>
        <Text style={styles.titleTxt}>새로운 단어장 만들기</Text>
        <View style={styles.line}></View>
      </View>

      {!isChecked && !isOcrChecked && (
        <>
          <View style={{backgroundColor: '#212A3E'}}>
            <Text style={styles.titleTxt}>단어장 이름</Text>
            <View style={{alignItems: 'center'}}>
              <TextInput
                style={{
                  height: 40,
                  width: '95%',
                  borderColor: 'gray',
                  borderWidth: 1,
                  marginBottom: 10,
                  padding: 10,
                  backgroundColor: 'white',
                }}
                placeholder="단어장의 이름을 입력해주세요"
                onChangeText={text => setCurrentTitle(text)}
              />
            </View>
          </View>
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.box}
              onPress={handleDirectCreationOcr}>
              <Text>사진 촬영으로 빠르게 단어장 만들기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.box} onPress={handleDirectCreation}>
              <Text>직접 단어장 만들기</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* 사진 촬영으로 단어장 만들기를 눌렀을 때 나오는 화면 */}
      {isOcrChecked && (
        <>
          <OcrTest onUpdate={handleUpdate} />
          <Button onPress={setVocabularyToOcr} title="저장하기"></Button>
        </>
      )}

      {/* 직접 단어장 만들기 눌렀을때 나오는 화면 */}
      {isChecked && (
        <View style={styles.container}>
          <View
            style={{
              width: '80%',
              height: 300,
              backgroundColor: 'white',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TextInput
              style={{
                height: 40,
                width: '80%',
                borderColor: 'black',
                borderWidth: 1,
                marginBottom: 10,
                padding: 10,
                backgroundColor: 'white',
              }}
              placeholder="한자"
              value={currentKanji}
              onChangeText={text => setCurrentKanji(text)}
            />
            <TextInput
              style={{
                height: 40,
                width: '80%',
                borderColor: 'black',
                borderWidth: 1,
                marginBottom: 10,
                padding: 10,
                backgroundColor: 'white',
              }}
              placeholder="가나"
              value={currentGana}
              onChangeText={text => setCurrentGana(text)}
            />
            <TextInput
              style={{
                height: 40,
                width: '80%',
                borderColor: 'black',
                borderWidth: 1,
                marginBottom: 10,
                padding: 10,
                backgroundColor: 'white',
              }}
              placeholder="뜻"
              value={currentMeaning}
              onChangeText={text => setCurrentMeaning(text)}
            />

            <TouchableOpacity
              onPress={setTempWord}
              style={{
                width: '30%',
                height: 40,
                backgroundColor: '#5E81F4',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                marginTop: 15,
              }}>
              <Text>계속 만들기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={setWord}
              style={{
                width: '30%',
                height: 40,
                backgroundColor: '#FF6347',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                marginTop: 5,
              }}>
              <Text>저장하기</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={back}>
            <Text>만드는 방식 다시 선택하기</Text>
          </TouchableOpacity> */}
          </View>
          <ScrollView
            style={{
              width: '80%',
              height: 250,
              backgroundColor: 'white',
              marginTop: 20,
              padding: 10,
            }}>
            <Text style={{color: '#000', marginBottom: 10}}>
              단어장 제목: {tempVocabulary.title}
              단어 개수: {tempVocabulary.kanji.length}
            </Text>
            {tempVocabulary.kanji && tempVocabulary.kanji.length > 0 && (
              <View>
                {tempVocabulary.kanji.map((kanji, index) => (
                  <View key={index} style={{marginBottom: 10, flexDirection:'row'}}>
                    <Text style={{color: '#000'}}>{kanji}&ensp;</Text>
                    <Text style={{color: '#000'}}>
                      {tempVocabulary.gana[index]}&ensp;
                    </Text>
                    <Text style={{color: '#000'}}>
                      {tempVocabulary.meaning[index]}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212A3E',
    alignItems: 'center',
    paddingTop: 50,
    borderWidth: 3,
  },
  titleTxt: {
    color: 'white',
    fontSize: 15,
    margin: 10,
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  box: {
    width: 350,
    height: 100,
    backgroundColor: 'white',
    marginVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WordMain;
