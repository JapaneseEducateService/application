import React, {useEffect, useState} from 'react';
import {
  Button,
  Image,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import {getToken} from '../utils/AuthStorage';
import axios from 'axios';

// Props 타입 정의에 onUpdate 추가
interface Props {
  onUpdate: (updatedVocabulary: any) => void; // tempVocabulary 대신 업데이트할 객체 형식 지정
}

const OcrTest: React.FC = () => {
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [ocrResult, setOcrResult] = useState<any>({
    gana: [],
    kanji: [],
    meaning: [],
  });

  const handleChange = (
    text: string,
    index: number,
    type: 'kanji' | 'gana' | 'meaning',
  ) => {
    const newOcrResult = {...ocrResult};
    newOcrResult[type][index] = text;

    // 상태를 업데이트합니다.
    setOcrResult(newOcrResult);

    // 변경된 ocrResult를 부모 컴포넌트에 전달합니다.
    onUpdate(newOcrResult);
  };

  // ocrResult 상태가 변경될 때마다 콘솔에 로그를 출력합니다.
  useEffect(() => {
    console.log('OCR 결과가 업데이트되었습니다:', ocrResult);
  }, [ocrResult]);

  // OCR 결과 문자열에서 JSON 데이터를 추출하고 파싱하는 함수
  const parseOcrResult = (ocrResultString: string) => {
    // OCR 결과 중 JSON 형식의 데이터를 찾아내기 위한 정규 표현식
    const jsonRegex = /{.*}/;
    // 정규 표현식을 사용하여 JSON 문자열 추출
    const jsonString = ocrResultString.match(jsonRegex)![0];
    // JSON 문자열을 객체로 파싱
    const parsedData = JSON.parse(jsonString);

    // 필요한 데이터를 반환
    return {
      kanji: parsedData.kanji,
      gana: parsedData.gana,
      meaning: parsedData.meaning,
    };
  };

  const selectPhotoTapped = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      maxWidth: 1000,
      maxHeight: 1000,
      includeBase64: true,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.assets && response.assets.length > 0) {
        setPhoto(response.assets[0]);
      } else {
        console.log('No assets selected');
      }
    });
  };

  const handleOcr = async () => {
    try {
      const tokenResponse = await getToken();
      // tokenResponse가 존재하며, access_token도 존재하는지 확인합니다.
      if (tokenResponse?.access_token) {
        const {access_token} = tokenResponse;
        const imageUri = photo?.uri;

        const imageData = new FormData();
        imageData.append('image', {
          uri: imageUri,
          name: 'image.jpg',
          type: 'image/jpeg',
        });

        const response = await axios.post(
          'http://10.0.2.2:8000/api/vocabularyNote/ocr',
          imageData,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        // 이제 response.data가 객체 형태로, 직접 접근하여 사용합니다.
        console.log('OCR 결과:', response.data);

        // 직접 접근한 결과를 상태에 저장합니다.
        if (
          response.data &&
          response.data.kanji &&
          response.data.gana &&
          response.data.meaning
        ) {
          setOcrResult({
            kanji: response.data.kanji,
            gana: response.data.gana,
            meaning: response.data.meaning,
          });
        } else {
          // 예상치 못한 응답 구조일 경우 에러 처리
          console.error('OCR 결과의 형식이 예상과 다릅니다.');
        }
      } else {
        // access_token이 없다면 적절한 오류 처리를 합니다.
        console.error('access_token이 없습니다.');
      }
    } catch (error) {
      console.error('OCR 요청 중 에러 발생:', error);
    }
  };

  return (
    <ScrollView style={{backgroundColor: '#212A3E'}}>
      <TouchableOpacity onPress={selectPhotoTapped} style={styles.btn}>
        <Text>앨범에서 사진 선택하기</Text>
      </TouchableOpacity>
      {photo && (
        <View style={{borderWidth: 1, borderColor: 'black'}}>
          <Image
            style={{width: '100%', height: 300, resizeMode: 'contain'}}
            source={{uri: photo.uri}}
          />
        </View>
      )}

      <TouchableOpacity onPress={handleOcr} style={styles.btn}>
        <Text>OCR 결과 확인하기</Text>
      </TouchableOpacity>

      {ocrResult && (
        <View style={styles.container}>
          {ocrResult && (
            <View style={styles.container}>
              {ocrResult.kanji.map((_, index: number) => (
                <View key={index} style={styles.line}>
                  <TextInput
                    style={styles.input}
                    value={ocrResult.kanji[index]}
                    onChangeText={text => handleChange(text, index, 'kanji')}
                  />
                  <TextInput
                    style={styles.input}
                    value={ocrResult.gana[index]}
                    onChangeText={text => handleChange(text, index, 'gana')}
                  />
                  <TextInput
                    style={styles.input}
                    value={ocrResult.meaning[index]}
                    onChangeText={text => handleChange(text, index, 'meaning')}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
  },
  tableHeader: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  tableData: {
    flex: 1,
    textAlign: 'center',
  },
  container: {
    marginTop: 20,
  },
  text: {
    marginLeft: 10,
    color: 'white',
  },
  btn: {
    width: '50%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  input: {
    width: '30%',
    borderWidth: 1,
    borderColor: 'gray',
    margin: 5,
    backgroundColor: 'white',
  },
});

export default OcrTest;
