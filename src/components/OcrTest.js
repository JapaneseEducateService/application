import React, { useState } from 'react';
import { Button, Image, View, Text } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import Svg, { Rect } from 'react-native-svg';
import { ScrollView } from 'react-native-gesture-handler';

const OcrTest = () => {
  const [photo, setPhoto] = useState(null);
  const [ocrResult, setOcrResult] = useState('');
  const [boundingPolyArray, setBoundingPolyArray] = useState([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [description, setDescription] = useState([]);

  const selectPhotoTapped = () => {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: true,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = {
          uri: response.assets[0].uri,
          width: response.assets[0].width,
          height: response.assets[0].height,
        };
        setPhoto(source);
        setBoundingPolyArray([]);
        setOcrResult('');
      }
    });
  };

  const handleOcr = async () => {
    if (!photo) {
      console.log('No photo selected');
      return;
    }

    const base64 = await RNFetchBlob.fs.readFile(photo.uri, 'base64');

    const body = JSON.stringify({
      requests: [
        {
          image: {
            content: base64,
          },
          features: [{ type: 'TEXT_DETECTION', maxResults: 10 }],
          imageContext: {
            languageHints: ['ja', 'ko'],
          },
        },
      ],
    });

    const apiKey = '자신의 API KEY 입력하세요.';
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
    
      const json = await response.json();
    
      let text = '';
      let descriptionArr = [];
      if (
        json.responses &&
        json.responses[0] &&
        json.responses[0].fullTextAnnotation
      ) {
        text = json.responses[0].fullTextAnnotation.text;
        // Google Cloud Natural Language API를 사용하여 형태소 분석 수행
        const languageResponse = await fetch(
          'https://language.googleapis.com/v1/documents:analyzeSyntax?key=' + apiKey,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              document: {
                content: text,
                type: 'PLAIN_TEXT',
                language: 'ja',
              },
              encodingType: 'UTF8',
            }),
          }
        );
        const languageJson = await languageResponse.json();
    
        // 형태소 분석 결과 추출
        if (
          languageJson.tokens &&
          languageJson.tokens.length > 0
        ) {
          // 형태소 분석 결과를 descriptionArr에 저장
          descriptionArr = languageJson.tokens.map(token => token.text.content);
          console.log(descriptionArr)
        }
      }
    
      if (
        json.responses &&
        json.responses[0] &&
        json.responses[0].textAnnotations
      ) {
        const boundingPolyArray = json.responses[0].textAnnotations.map(
          annotation => annotation.boundingPoly,
        );
        setBoundingPolyArray(boundingPolyArray);

        descriptionArr = json.responses[0].textAnnotations
          .slice(1)
          .map(annotation => annotation.description)
          .filter(word => !/[^ぁ-んァ-ン一-龯\s]/.test(word));
    
        setDescription(descriptionArr);
      }
    
      setOcrResult(text);
    } catch (error) {
      console.error('Error performing OCR:', error);
    }
    
  };

  const renderTextAnnotations = () => {
    if (boundingPolyArray.length === 0) {
      return [];
    }
    return boundingPolyArray.map((boundingPoly, index) => {
      const vertices = boundingPoly.vertices;
      const width =
        (vertices[1].x - vertices[0].x) * (imageSize.width / photo.width);
      const height =
        (vertices[3].y - vertices[0].y) * (imageSize.height / photo.height);
      const x = vertices[0].x * (imageSize.width / photo.width);
      const y = vertices[0].y * (imageSize.height / photo.height);

      return (
        <Rect
          key={index}
          x={x}
          y={y}
          width={width}
          height={height}
          stroke="red"
          strokeWidth="2"
          fill="transparent"
        />
      );
    });
  };

  return (
    <ScrollView>
      <Button onPress={selectPhotoTapped} title="앨범에서 사진 선택하기" />
      {photo && (
        <View>
          <Image
            onLayout={event => {
              const { width, height } = event.nativeEvent.layout;
              setImageSize({ width, height });
            }}
            style={{
              flex: 1,
              aspectRatio: photo.width / photo.height,
              width: '100%',
            }}
            source={{ uri: photo.uri }}
          />

          <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
            {renderTextAnnotations()}
          </Svg>
          {ocrResult !== '' && (
            <View style={{ marginTop: 10, paddingHorizontal: 20 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                OCR 결과:
              </Text>
              <View
                style={{
                  borderColor: 'black',
                  borderWidth: 1,
                  padding: 5,
                  display: ocrResult !== '' ? 'flex' : 'none',
                }}
              >
                <Text>{ocrResult}</Text>
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 20 }}>
                추출된 단어
              </Text>
              {description.length > 0 && (
                <View style={{ marginTop: 10, paddingHorizontal: 20 }}>
                  {description.map((word, index) => (
                    <View
                      key={index}
                      style={{
                        borderColor: 'black',
                        borderWidth: 1,
                        padding: 15,
                        margin: 5,
                        display: word !== '' ? 'flex' : 'none',
                      }}
                    >
                      <Text>{word}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}
      <Button onPress={handleOcr} title="OCR 확인하기" />
    </ScrollView>
  );
};

export default OcrTest;