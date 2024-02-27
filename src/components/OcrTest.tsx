import React, {useState} from 'react';
import {Button, Image, View, Text} from 'react-native';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import Svg, {Rect} from 'react-native-svg';
import {ScrollView} from 'react-native-gesture-handler';
import { ImagePickerResponse, ImageLibraryOptions, PhotoQuality } from 'react-native-image-picker';
import { MediaType } from 'react-native-image-picker/src/types';

interface BoundingPoly {
  vertices: {x: number; y: number}[];
}

interface Token {
  text: {content: string};
}

const OcrTest: React.FC = () => {
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [boundingPolyArray, setBoundingPolyArray] = useState<BoundingPoly[]>(
    [],
  );
  const [imageSize, setImageSize] = useState<{width: number; height: number}>({
    width: 0,
    height: 0,
  });
  const [description, setDescription] = useState<string[]>([]);

  const selectPhotoTapped = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as const,
      quality: 1.0 as PhotoQuality,
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: true,
    };
    
  
    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.assets && response.assets.length > 0) {
        const source = {
          uri: response.assets[0].uri,
          width: response.assets[0].width ?? 0,
          height: response.assets[0].height ?? 0,
        };
        setPhoto(source);
        setBoundingPolyArray([]);
        setOcrResult('');
      } else {
        console.log('No assets selected');
      }
    });
  };

  const handleOcr = async () => {
    if (!photo || !photo.uri) {
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
          features: [{type: 'TEXT_DETECTION', maxResults: 10}],
          imageContext: {
            languageHints: ['ja', 'ko'],
          },
        },
      ],
    });

    const apiKey = '';
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
      let descriptionArr: string[] = [];
      if (
        json.responses &&
        json.responses[0] &&
        json.responses[0].fullTextAnnotation
      ) {
        text = json.responses[0].fullTextAnnotation.text;
        // Google Cloud Natural Language API를 사용하여 형태소 분석 수행
        const languageResponse = await fetch(
          'https://language.googleapis.com/v1/documents:analyzeSyntax?key=' +
            apiKey,
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
          },
        );
        const languageJson = await languageResponse.json();

        // 형태소 분석 결과 추출
        if (languageJson.tokens && languageJson.tokens.length > 0) {
          // 형태소 분석 결과를 descriptionArr에 저장
          descriptionArr = languageJson.tokens.map(
            (token: Token) => token.text.content,
          );
          console.log(descriptionArr);
        }
      }

      if (
        json.responses &&
        json.responses[0] &&
        json.responses[0].textAnnotations
      ) {
        const boundingPolyArray = json.responses[0].textAnnotations.map(
          (annotation: {boundingPoly: BoundingPoly}) => annotation.boundingPoly,
        );
        setBoundingPolyArray(boundingPolyArray);

        descriptionArr = json.responses[0].textAnnotations
          .slice(1)
          .map((annotation: {description: string}) => annotation.description)
          .filter((word: string) => !/[^ぁ-んァ-ン一-龯\s]/.test(word));

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
        (vertices[1].x - vertices[0].x) *
        (imageSize.width / (photo?.width ?? 1));
      const height =
        (vertices[3].y - vertices[0].y) *
        (imageSize.height / (photo?.height ?? 1));
      const x = vertices[0].x * (imageSize.width / (photo?.width ?? 1));
      const y = vertices[0].y * (imageSize.height / (photo?.height ?? 1));

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
              const {width, height} = event.nativeEvent.layout;
              setImageSize({width, height});
            }}
            style={{
              flex: 1,
              aspectRatio:
                photo?.width && photo?.height ? photo.width / photo.height : 1,
              width: '100%',
            }}
            source={{uri: photo?.uri}}
          />

          <Svg height="100%" width="100%" style={{position: 'absolute'}}>
            {renderTextAnnotations()}
          </Svg>
          {ocrResult !== '' && (
            <View style={{marginTop: 10, paddingHorizontal: 20}}>
              <Text style={{fontWeight: 'bold', fontSize: 16}}>OCR 결과:</Text>
              <View
                style={{
                  borderColor: 'black',
                  borderWidth: 1,
                  padding: 5,
                  display: ocrResult !== '' ? 'flex' : 'none',
                }}>
                <Text>{ocrResult}</Text>
              </View>
              <Text style={{fontWeight: 'bold', fontSize: 16, marginTop: 20}}>
                추출된 단어
              </Text>
              {description.length > 0 && (
                <View style={{marginTop: 10, paddingHorizontal: 20}}>
                  {description.map((word, index) => (
                    <View
                      key={index}
                      style={{
                        borderColor: 'black',
                        borderWidth: 1,
                        padding: 15,
                        margin: 5,
                        display: word !== '' ? 'flex' : 'none',
                      }}>
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
