import React, {useState, useRef, useEffect} from 'react';
import BackButton from '../../components/button/backButton';
import {
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../api';
import {launchImageLibrary, Asset} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import DocumentPicker, {types} from 'react-native-document-picker';
import {getToken} from '../../utils/AuthStorage';
import RNFS from 'react-native-fs';
import * as XLSX from 'xlsx';

const SentenceMain: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null); // ScrollView의 ref를 만듭니다.
  const navigation = useNavigation();

  const [title, setTitle] = useState(''); // 제목
  const [modalVisible, setModalVisible] = useState(false); // 모달 상태

  // 유저가 입력한 문장 데이터 (기본 4개)
  const [sentenceData, setSentenceData] = useState([
    {id: 1, sentence: '', meaning: ''},
    {id: 2, sentence: '', meaning: ''},
    {id: 3, sentence: '', meaning: ''},
    {id: 4, sentence: '', meaning: ''},
  ]);

  const [photo, setPhoto] = useState<Asset | null>(null);

  const situation = '일상'; // 상황은 하드코딩

  useEffect(() => {
    console.log('입력한 제목', title);
  }, [title]);

  useEffect(() => {
    console.log('입력한 정보', sentenceData);
  }, [sentenceData]);

  // 사진 선택하기
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
        setModalVisible(true); // 사진 선택 시 모달을 띄웁니다.
      } else {
        console.log('No assets selected');
      }
    });
  };

  // 사진 서버에 전송해서 OCR 결과 저장하는 함수
  const handleOcr = async () => {
    const imageUri = photo?.uri;

    const imageData = new FormData();
    imageData.append('image', {
      uri: imageUri,
      name: 'image.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await api.post('/sentenceNotes/image', imageData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        console.log('OCR 결과:', response.data);

        // OCR 결과를 sentenceData에 저장
        const ocrResults = response.data.map((item: any, index: number) => ({
          id: index + 1,
          sentence: item.문장,
          meaning: item.의미,
        }));

        setSentenceData(ocrResults); // 기존 데이터를 지우고 새로운 OCR 결과로 대체
        setModalVisible(false); // OCR 처리 후 모달 닫기

        // ScrollView를 스크롤 가능한 최대 위치로 스크롤
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd();
        }, 100);
      }
    } catch (error) {
      console.error('OCR 처리 중 오류 발생:', error);
    }
  };

  // 문장 입력 항목 추가 함수
  const addItem = () => {
    const newItemId = sentenceData.length + 1;
    setSentenceData([
      ...sentenceData,
      {id: newItemId, sentence: '', meaning: ''},
    ]);

    scrollViewRef.current?.scrollToEnd(); // ScrollView를 스크롤 가능한 최대 위치로 스크롤
  };

  // 문장 입력 항목 제거 함수
  const deleteItem = (index: number) => {
    const updatedData = sentenceData.filter((_, idx) => idx !== index);
    // 삭제된 항목 이후의 모든 항목의 id를 업데이트
    const updatedDataWithIds = updatedData.map((item, idx) => ({
      ...item,
      id: idx + 1,
    }));
    setSentenceData(updatedDataWithIds);
  };

  // 입력된 값을 업데이트하는 함수
  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedData = sentenceData.map((item, idx) => {
      if (idx === index) {
        return {...item, [field]: value};
      }
      return item;
    });
    setSentenceData(updatedData);
  };

  // 서버에 데이터 전송하는 함수
  const saveData = async () => {
    if (title.trim() === '') {
      Alert.alert('오류', '제목을 입력해주세요.');
      return;
    }

    for (const item of sentenceData) {
      if (item.sentence.trim() === '' || item.meaning.trim() === '') {
        Alert.alert('오류', '모든 문장과 의미를 입력해주세요.');
        return;
      }
    }
    const formattedData = {
      title,
      sentences: sentenceData.map(item => ({
        문장: item.sentence,
        의미: item.meaning,
      })),
      situation,
    };

    try {
      const response = await api.post('/sentenceNotes/make', formattedData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status == 200) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('데이터 전송 중 오류 발생:', error);
    }
  };

// 엑셀 파일 선택 및 내용 읽기
const handleExcelRead = async () => {
  try {
    // 엑셀 파일 선택
    const res = await DocumentPicker.pick({
      type: [DocumentPicker.types.xlsx], // xlsx 파일만 선택
    });

    if (res && res.length > 0) {
      const filePath = res[0].uri;

      // RNFS를 사용하여 파일을 읽음
      const fileContent = await RNFS.readFile(filePath, 'base64');

      // 워크북을 읽기
      const workbook = XLSX.read(fileContent, { type: 'base64' });

      // 첫 번째 시트의 데이터 읽기
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // 첫 번째 열과 두 번째 열의 데이터 추출하여 sentenceData에 추가
      const extractedData = jsonData.map(row => ({
        sentence: row[0],  // 첫 번째 열
        meaning: row[1],   // 두 번째 열
      })).filter(row => row.sentence !== undefined && row.meaning !== undefined); // undefined 제거

      console.log('추출된 데이터:', extractedData);

      // 기존 sentenceData를 지우고 새로운 엑셀 데이터로 대체
      setSentenceData(extractedData.map((item, index) => ({
        id: index + 1, // 새로운 id 생성
        sentence: item.sentence,
        meaning: item.meaning,
      })));
    }
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('사용자가 파일 선택을 취소했습니다.');
    } else {
      console.error('엑셀 파일 읽기 중 오류 발생:', err);
    }
  }
};


  return (
    <>
      <View style={{zIndex: 99}}>
        <BackButton />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>文章ノート作成</Text>
        <TextInput
          style={styles.input}
          placeholder="単語帳のタイトルを入力してください"
          placeholderTextColor={'white'}
          onChangeText={text => setTitle(text)}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText} onPress={handleExcelRead}>
              Excelで文章を入力
            </Text>
          </TouchableOpacity>
          <View style={styles.buttonSpacer} />
          <TouchableOpacity style={styles.button} onPress={selectPhotoTapped}>
            <Text style={styles.buttonText}>イメージで文章を入力</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.sentenceContainer}>
        <ScrollView
          style={styles.sentenceScrollView}
          contentContainerStyle={styles.sentenceContentContainer}
          ref={scrollViewRef}>
          {sentenceData.map((item, index) => (
            <View key={item.sentence + index}>
              <View style={styles.sentenceNumberBox}>
                <Text style={styles.sentenceNumber}>00{item.id}</Text>
                <TouchableOpacity onPress={() => deleteItem(index)}>
                  <Icon name="trash-bin" size={20} color={'grey'} />
                </TouchableOpacity>
              </View>
              <View style={styles.sentenceBox}>
                <TextInput
                  style={styles.sentenceTextInput}
                  placeholder="文章を入力してください"
                  value={item.sentence}
                  onChangeText={text =>
                    handleInputChange(index, 'sentence', text)
                  }
                />
                <TextInput
                  style={styles.sentenceTextInput}
                  placeholder="意味を入力してください"
                  value={item.meaning}
                  onChangeText={text =>
                    handleInputChange(index, 'meaning', text)
                  }
                />
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={addItem} style={styles.settingButton}>
            <Text style={styles.settingButtonTxt}>アイテム追加</Text>
          </TouchableOpacity>

          <View style={{width: 20}}></View>

          <TouchableOpacity onPress={saveData} style={styles.settingButton}>
            <Text style={styles.settingButtonTxt}>保存する</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* OCR 선택 모달 창 */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {photo && (
              <Image source={{uri: photo.uri}} style={styles.modalImage} />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>閉じる</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.reselectButton]}
                onPress={selectPhotoTapped}>
                <Text style={styles.buttonText}>再選択</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleOcr}>
                <Text style={styles.buttonText}>送信</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 180,
    backgroundColor: '#006fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    width: '90%',
    height: 40,
    borderBottomWidth: 1,
    borderColor: 'white',
    marginTop: 50, ///
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    backgroundColor: 'transparent',
    borderColor: 'white',
  },
  buttonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  buttonSpacer: {
    width: 20,
  },
  sentenceContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'white',
    height: '100%',
  },
  sentenceScrollView: {
    width: '95%',
    maxHeight: 500,
  },
  sentenceContentContainer: {
    paddingVertical: 10,
  },
  settingButtonTxt: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  settingButton: {
    width: '30%',
    height: 40,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: '#0077ff',
    justifyContent: 'center',
    marginTop: 10,
  },
  sentenceTextInput: {
    height: 40,
    borderBottomWidth: 1,
    margin: 5,
    fontSize: 13,
    borderColor: '#B4A2D4',
  },
  sentenceNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'grey',
  },
  sentenceBox: {
    borderWidth: 3,
    borderRadius: 5,
    borderColor: '#B4A2D4',
  },
  sentenceNumberBox: {
    width: '100%',
    height: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    elevation: 10,
  },
  modalImage: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 5,
  },
  closeButton: {
    backgroundColor: 'grey',
  },
  reselectButton: {
    backgroundColor: '#0077ff',
  },
  sendButton: {
    backgroundColor: '#00cc00',
  },
});

export default SentenceMain;
