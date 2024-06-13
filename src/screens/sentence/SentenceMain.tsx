import React, {useState, useRef} from 'react';
import BackButton from '../../components/button/backButton';
import {
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SentenceMain: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null); // ScrollView의 ref를 만듭니다.

  // 유저가 입력한 문장 데이터 (기본 4개)
  const [sentenceData, setSentenceData] = useState([
    {id: 1, sentence: '', meaning: ''},
    {id: 2, sentence: '', meaning: ''},
    {id: 3, sentence: '', meaning: ''},
    {id: 4, sentence: '', meaning: ''},
  ]);

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

  return (
    <>
    <View style={{zIndex:99}}>
      <BackButton />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>문장노트 만들기</Text>
        <TextInput
          style={styles.input}
          placeholder="단어장의 제목을 입력해주세요"
          placeholderTextColor={'white'}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Excel로 문장 입력</Text>
          </TouchableOpacity>
          <View style={styles.buttonSpacer} />
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>OCR로 문장 입력</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.sentenceContainer}>
        <ScrollView
          style={styles.sentenceScrollView}
          contentContainerStyle={styles.sentenceContentContainer}
          ref={scrollViewRef}>
          {sentenceData.map((item, index) => (
            <View key={item.id}>
              <View style={styles.sentenceNumberBox}>
                <Text style={styles.sentenceNumber}>00{item.id}</Text>
                <TouchableOpacity onPress={() => deleteItem(index)}>
                  <Icon name="trash-bin" size={20} color={'grey'} />
                </TouchableOpacity>
              </View>
              <View style={styles.sentenceBox}>
                <TextInput
                  style={styles.sentenceTextInput}
                  placeholder="문장을 입력해주세요">
                  {item.sentence}
                </TextInput>
                <TextInput
                  style={styles.sentenceTextInput}
                  placeholder="뜻을 입력해주세요">
                  {item.meaning}
                </TextInput>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={addItem} style={styles.settingButton}>
            <Text style={styles.settingButtonTxt}>항목 추가</Text>
          </TouchableOpacity>

          <View style={{width: 20}}></View>

          <TouchableOpacity onPress={addItem} style={styles.settingButton}>
            <Text style={styles.settingButtonTxt}>저장하기</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    height: '100%'
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
    width: '20%',
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
});

export default SentenceMain;
