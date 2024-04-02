import React, {useState} from 'react';
import {
  Button,
  Image,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import {getToken} from '../utils/AuthStorage';
import axios from 'axios';

const OcrTest: React.FC = () => {
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [ocrResult, setOcrResult] = useState<any>({
    gana: [],
    kanji: [],
    meaning: [],
  });

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

        console.log('타입은', typeof(response.data))
        const parsedOcrResult = parseOcrResult(response.data);
        console.log('OCR 결과:', parsedOcrResult);

        setOcrResult(parsedOcrResult);
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
          {ocrResult.kanji.map((item: any, index: number) => {
            // 가나, 한자, 뜻에서 같은 인덱스의 항목을 가져옵니다.
            const gana = ocrResult.gana[index];
            const kanji = ocrResult.kanji[index]; // kanji가 null일 수도 있으므로 이를 체크해야 합니다.
            const meaning = ocrResult.meaning[index];

            // 각 항목을 한 줄에 표시합니다.
            return (
              <View key={index} style={styles.line}>
                <Text style={styles.text}>
                  {kanji ? kanji : 'null'} - {gana} - {meaning}
                </Text>
              </View>
            );
          })}
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
  line: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 10,
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
});

export default OcrTest;
