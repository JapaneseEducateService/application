import React, {useState} from 'react';
import {Button, Image, View, Text, StyleSheet} from 'react-native';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import {ScrollView} from 'react-native-gesture-handler';
import {getToken} from '../utils/authStorage';
import axios from 'axios';

const OcrTest: React.FC = () => {
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [ocrResult, setOcrResult] = useState<any>({
    gana: [],
    kanji: [],
    meaning: [],
  });

  const selectPhotoTapped = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 1.0,
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
      const {access_token} = await getToken();
      const imageUri = photo?.uri;

      const imageData = new FormData();
      imageData.append('image', {
        uri: imageUri,
        name: 'image.jpg',
        type: 'image/jpeg',
      });

      const response = await axios.post(
        'http://10.0.2.2:8000/api/ocr',
        imageData,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('OCR 결과:', response.data);
      setOcrResult(response.data);
    } catch (error) {
      console.error('OCR 요청 중 에러 발생:', error);
    }
  };

  return (
    <ScrollView>
      <Button onPress={selectPhotoTapped} title="앨범에서 사진 선택하기" />
      {photo && (
        <View style={{borderWidth:1, borderColor:'black'}}>
          <Image style={{ width: '100%', height: 300, resizeMode: 'contain' }} source={{ uri: photo.uri }} />
        </View>
      )}

      <Button onPress={handleOcr} title="OCR 확인하기" />
      <View>
        {ocrResult &&
          ocrResult.gana.map((_, index: any) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.tableData, {textAlign: 'left', marginLeft:10}]}>
                {index + 1}. {ocrResult.gana[index]} {ocrResult.kanji[index]}{' '}
                {ocrResult.meaning[index]}
              </Text>
            </View>
          ))}
      </View>
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
});

export default OcrTest;
