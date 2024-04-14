import React, {useEffect, useState} from 'react';
import {
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
import Icon from 'react-native-vector-icons/Ionicons';

// Props 타입 정의에 onUpdate 추가
interface Props {
  onUpdate: (updatedVocabulary: any) => void; // tempVocabulary 대신 업데이트할 객체 형식 지정
}

const OcrTest: React.FC<Props> = ({onUpdate}) => {
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [ocrResult, setOcrResult] = useState<any>({
    gana: [],
    kanji: [],
    meaning: [],
  });

  const handleRemoveItem = (index: number) => {
    const newKanji = [...ocrResult.kanji];
    const newGana = [...ocrResult.gana];
    const newMeaning = [...ocrResult.meaning];

    newKanji.splice(index, 1);
    newGana.splice(index, 1);
    newMeaning.splice(index, 1);

    setOcrResult({
      kanji: newKanji,
      gana: newGana,
      meaning: newMeaning,
    });

    onUpdate({
      kanji: newKanji,
      gana: newGana,
      meaning: newMeaning,
    });
  };

  const handleChange = (
    text: string,
    index: number,
    type: 'kanji' | 'gana' | 'meaning',
  ) => {
    const newOcrResult = {...ocrResult};
    newOcrResult[type][index] = text;

    setOcrResult(newOcrResult);

    onUpdate(newOcrResult);
  };

  useEffect(() => {
    console.log('OCR 결과가 업데이트되었습니다:', ocrResult);
  }, [ocrResult]);

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
                  <View style={{justifyContent: 'center'}}>
                    <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                      <Icon
                        name="trash-bin-outline"
                        size={25}
                        color={'white'}
                      />
                    </TouchableOpacity>
                  </View>
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
    width: '95%',
    justifyContent: 'center',
    alignItems: 'center',
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
