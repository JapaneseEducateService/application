import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Button,
  Text,
  Image,
  Modal,
  Touchable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {getToken} from '../../utils/AuthStorage';
import api from '../../api';
import BackButton from '../../components/button/backButton';

interface Props {}

const CommunityMain: React.FC<Props> = () => {
  const [publicNoteData, setPublicNoteData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); // 모달창유무
  const [vocabularyData, setVocabularyData] = useState([]); // 선택한 단어장의 정보 가져오기

  const [person, setPerson] = useState(); // 작성자

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('작성자', person);
  }, [person]);

  useEffect(() => {
    console.log('받아온 단어장 정보', vocabularyData);
  }, [vocabularyData]);

  // 데이터 가져오기
  const fetchData = async () => {
    try {
      const response = await api.get('/vocabularyNote/public/notes');
      const data = response.data.notes.map(note => ({
        id: note.id,
        title: note.title,
        user: note.user.nickname,
        level: note.level.level,
      }));
      console.log('받아온 단어장 목록', data);
      setPublicNoteData(data);
    } catch (error) {
      console.error('서버 요청 에러:', error);
    }
  };

  // 단어장의 제목을 클릭하면 단어장의 상세정보가 모달창으로 출력
  const showVocabularyModal = async (id: number, user: string) => {
    // 모달창 On
    setModalVisible(!modalVisible);
    // 단어장 상세정보 받아오기
    const response = await api.get(`/vocabularyNote/${id}`);
    // 유저 키 추가
    const noteWithUser = {...response.data.note, user: user || 'Unknown'};
    setVocabularyData(noteWithUser);
  };

  // 단어장 다운받기 버튼을 누르면 복사하는 함수
  const copyVocabulary = async () => {
    const response = await api.post(`/vocabularyNote/copy/${vocabularyData.id}`);
    console.log(response.data)
  }

  return (
    <>
      <View style={{zIndex: 999}}>
        <BackButton />
      </View>
      <View
        style={{
          width: '100%',
          height: 50,
          backgroundColor: '#006fff',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontSize: 20,
            color: 'white',
            fontWeight: 'bold',
          }}>
          단어 창고
        </Text>
      </View>
      <View style={styles.container}>
        {publicNoteData.map((note, index) => (
          // 개별 단어장 블럭
          <TouchableOpacity
            key={index}
            style={{
              width: '100%',
              height: 70,
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: 'white',
              margin: 5,
              borderRadius: 7,
              elevation: 3,
            }}
            // 클릭하면 클릭한 단어장의 내용을 onClickedVocabulary에 저장하고 모달창을 띄움
            onPress={() => showVocabularyModal(note.id, note.user)}>
            {/* 단어장 등급 표시 */}
            <View
              style={{
                position: 'absolute',
                right: 0,
                width: 90,
                height: 20,
                backgroundColor: '#87CEEB',
                margin: 3,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 5,
              }}>
              <Text style={{color: 'white'}}>{note.level}</Text>
            </View>

            {/* 단어장 제목 */}
            <View style={{justifyContent: 'center', marginLeft: 15}}>
              <Text style={{fontSize: 20}}>{note.title}</Text>
            </View>
            {/* 작성자 이름 */}
            <View
              style={{
                justifyContent: 'center',
                marginRight: 5,
                width: 120,
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 16, marginTop: 10, color: 'black'}}>
                {note.user}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 단어 모달창 */}
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}>
          <View
            style={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                width: '80%',
                height: '80%',
                backgroundColor: '#f5f5f5',
                borderRadius: 10,
                elevation: 5,
              }}>
              {/* 단어장 제목 부분 */}
              <View
                style={{
                  width: '100%',
                  height: 30,
                  marginLeft: 5,
                  // borderWidth: 1,
                }}>
                <Text style={{fontSize: 20, color: 'black'}}>
                  {vocabularyData.title}
                </Text>
              </View>
              {/* 작성자 + 단어갯수 부분 */}
              <View
                style={{
                  width: '100%',
                  height: 30,
                  marginLeft: 5,
                  // borderWidth: 1,
                }}>
                <Text style={{fontSize: 15, color: 'black'}}>
                  작성자 : {vocabularyData.user}
                </Text>
              </View>
              {/* 선 */}
              <View
                style={{
                  width: '100%',
                  borderWidth: 1,
                  marginBottom: 5,
                  borderColor: '#B4A2D4',
                }}
              />

              <ScrollView>
                <View style={{width: '100%', alignItems: 'center'}}>
                  {vocabularyData.kanji &&
                    vocabularyData.gana &&
                    vocabularyData.meaning &&
                    JSON.parse(vocabularyData.kanji).map((kanji, index) => (
                      <View
                        key={index}
                        style={{
                          width: '90%',
                          height: 70,
                          borderWidth: 1,
                          margin: 5,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          borderRadius: 15,
                        }}>
                        <View
                          style={{
                            width: '30%',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: 20,
                              fontWeight: 'bold',
                              color: 'black',
                            }}>
                            {kanji}
                          </Text>
                          <Text>
                            [{JSON.parse(vocabularyData.gana)[index]}]
                          </Text>
                        </View>
                        <View
                          style={{
                            width: '30%',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: 20,
                              fontWeight: 'bold',
                              color: 'black',
                            }}>
                            {JSON.parse(vocabularyData.meaning)[index]}
                          </Text>
                        </View>
                      </View>
                    ))}
                </View>
              </ScrollView>
              {/* 선 */}
              <View
                style={{
                  width: '100%',
                  borderWidth: 1,
                  marginTop: 5,
                  borderColor: '#B4A2D4',
                }}
              />
              {/* 다운받기 및 닫기 버튼 */}
              <View
                style={{
                  width: '100%',
                  height: 60,
                  // borderWidth: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={{
                    width: 80,
                    height: 40,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#FFE4C4',
                    elevation: 5,
                  }}
                  onPress={() => {
                    copyVocabulary();
                  }}>
                  <Text
                    style={{fontSize: 17, fontWeight: 'bold', color: 'black'}}>
                    복사하기
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: 80,
                    height: 40,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#006fff',
                    elevation: 5,
                  }}
                  onPress={() => {
                    setModalVisible(false);
                    setVocabularyData([]);
                  }}>
                  <Text
                    style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>
                    닫기
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
});

export default CommunityMain;
