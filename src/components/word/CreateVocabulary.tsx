import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Button,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import OcrTest from '../OcrTest';
import axios from 'axios';
import {getToken} from '../../utils/AuthStorage';

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

  useEffect(() => {
    console.log(tempVocabulary);
  }, [tempVocabulary]);

  useEffect(() => {
    console.log('단어장 id', wordId);
  }, [wordId]);

  // 직접 단어장 생성을 눌렀을 때
  const handleDirectCreation = async () => {
    // 제목이 입력되지 않았으면 제목을 입력해달라고 하기
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
  const back = () => {
    setIsChecked(false);
  };

  // OCR로 단어장 생성을 눌렀을 때
  const handleDirectCreationOcr = () => {
    setIsOcrChecked(true);
  };

  // OCR로 단어장 생성에서 뒤로가기
  const backOcr = () => {
    setIsOcrChecked(false);
  };

  // 단어 하나씩 임시 저장하는 로직
  const setTempWord = async () => {

    // 단어 정보가 모두 입력되었는지 확인
    if (!currentKanji || !currentGana || !currentMeaning ) {
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

    console.log("단어 임시 저장 완료");
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
    console.log("임시 단어장: ", tempVocabulary);

    // 토큰 가져오기
    const tokenResponse = await getToken();
    if (!tokenResponse || !tokenResponse.access_token) {
      console.error('토큰을 가져오는 데 실패했습니다.');
      return;
    }

    // 서버에 데이터 전송
    await axios
      .post('http://10.0.2.2:8000/api/vocabularyNote', tempVocabulary, {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (response.status === 200) {
          console.log('단어장 생성 성공:', response.data);
          setWordId(response.data.data.note.id);

          navigation.navigate('WordMain');
        } else {
          console.error('단어장 생성 실패');
        }
      })
      .catch(error => {
        console.error('서버 통신 중 에러 발생:', error);
      });
  }

  return (
    <>
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
          <OcrTest />
          <Button onPress={backOcr} title="돌아가기"></Button>
        </>
      )}

      {/* 직접 단어장 만들기 눌렀을때 나오는 화면 */}
      {isChecked && (
        <View style={styles.container}>
          <TextInput
            style={{
              height: 40,
              width: '30%',
              borderColor: 'gray',
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
              width: '30%',
              borderColor: 'gray',
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
              width: '30%',
              borderColor: 'gray',
              borderWidth: 1,
              marginBottom: 10,
              padding: 10,
              backgroundColor: 'white',
            }}
            placeholder="뜻"
            value={currentMeaning}
            onChangeText={text => setCurrentMeaning(text)}
          />
          <Button onPress={setTempWord} title="계속 만들기"></Button>
          <Button onPress={setWord} title="저장하기"></Button>
          <Button onPress={back} title="만드는 방식 다시 선택하기"></Button>
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
