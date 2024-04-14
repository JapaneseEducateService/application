import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Switch,
  TextInput,
} from 'react-native';
import axios from 'axios';
import {getToken} from '../../utils/AuthStorage';
import {useRoute, RouteProp} from '@react-navigation/native';
import LoadingBar from '../LoadingBar';
import BackButton from '../button/backButton';
import {SwipeListView} from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import Tts from 'react-native-tts';

type RootStackParamList = {
  VocabularyInfo: {id: string};
  WordMain: undefined;
};

// 단어장 속성 정의
type VocabularyDetail = {
  title?: string;
  kanji?: string[];
  gana?: string[];
  meaning?: string[];
  created_at: string;
};

const VocabularyInfo: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [detail, setDetail] = useState<VocabularyDetail>({});
  const [settingModalVisible, setSettingModalVisible] = useState(false);
  const [vocabularyModalVisible, setVocabularyModalVisible] = useState(false);
  const [changeModalVisible, setChangeModalVisible] = useState(false);

  const [newKanji, setNewKanji] = useState<string>('');
  const [newGana, setNewGana] = useState<string>('');
  const [newMeaning, setNewMeaning] = useState<string>('');

  const [currentKanji, setCurrentKanji] = useState<string>('');
  const [currentGana, setCurrentGana] = useState<string>('');
  const [currentMeaning, setCurrentMeaning] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>();

  const [refresh, setRefresh] = useState(false);

  const route = useRoute<RouteProp<RootStackParamList, 'VocabularyInfo'>>();
  const {width, height} = Dimensions.get('window');

  Tts.setDefaultLanguage('ja-JP'); // 언어 설정

  // 한자 On/Off
  const [isKanji, setIsKanji] = useState(true);
  const toggleKanjiSwitch = () => setIsKanji(previousState => !previousState);
  // 가나 On/Off
  const [isGana, setIsGana] = useState(true);
  const toggleGanaSwitch = () => setIsGana(previousState => !previousState);
  // 뜻 On/Off
  const [isMeaning, setIsMeaning] = useState(true);
  const toggleMeaningSwitch = () =>
    setIsMeaning(previousState => !previousState);
  // 발음듣기 On/Off
  const [isPronunciation, setIsPronunciation] = useState(true);
  const togglePronunciationSwitch = () => {
    console.log(isPronunciation);
    setIsPronunciation(previousState => !previousState);
  };

  // 최초 단어장 로드
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const tokenData = await getToken();
        const accessToken = tokenData?.access_token;

        const {id} = route.params;
        const response = await axios.get(
          `http://10.0.2.2:8000/api/vocabularyNote/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.status === 200) {
          const parsedDetail = {...response.data.note};
          // kanji, gana, meaning 필드만 JSON.parse를 이용하여 파싱
          parsedDetail.kanji = JSON.parse(parsedDetail.kanji);
          parsedDetail.gana = JSON.parse(parsedDetail.gana);
          parsedDetail.meaning = JSON.parse(parsedDetail.meaning);

          console.log(parsedDetail);

          setDetail(parsedDetail);
        } else {
          console.error('단어장 상세 정보 가져오기 실패');
        }
      } catch (error) {
        console.error('서버 통신 중 에러 발생:', error);
      }
    };

    fetchDetail();
  }, [route.params, refresh]);

  useEffect(
    () => console.log(newKanji, newGana, newMeaning),
    [newKanji, newGana, newMeaning],
  );

  // 항목을 렌더링하는 함수
  const renderItem = data => (
    <View style={styles.rowFront}>
      <View
        style={{
          width: '30%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {isKanji && (
          <Text style={{fontSize: 20, fontWeight: 'bold', color: 'black'}}>
            {data.item.kanji}
          </Text>
        )}
        {isGana && <Text style={{color: 'black'}}>[ {data.item.gana} ]</Text>}
      </View>

      <View
        style={{
          width: '50%',
          height: '100%',
          justifyContent: 'center',
          // borderWidth: 1,
        }}>
        {isMeaning && (
          <Text style={{fontSize: 15, marginLeft: 10, color: 'black'}}>
            {data.item.meaning}
          </Text>
        )}
      </View>
      <View
        style={{
          width: '20%',
          height: '100%',
        }}>
        {isPronunciation && (
          <TouchableOpacity
            onPress={() => Tts.speak(data.item.kanji)}
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              // borderWidth: 1,
            }}>
            <View
              style={{
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderRadius: 25,
              }}>
              <Icon name="volume-high-outline" size={30} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // 슬라이드 시 수정 삭제 버튼
  const renderHiddenItem = (data: any, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backLeftBtn, styles.backLeftBtnRight]} // 수정 버튼 스타일
        onPress={() => OnModalChangeVocabulary(data.item)}>
        <Text style={{fontSize: 15, color: 'black'}}>수정하기</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]} // 삭제 버튼 스타일
        onPress={() => deleteVocabulary(data.item)}>
        <Text style={{fontSize: 15, color: 'black'}}>삭제하기</Text>
      </TouchableOpacity>
    </View>
  );

  // 새로운 단어 추가하는 로직
  const addVocabulary = async () => {
    if (newKanji==="" || newGana==="" || newMeaning===""){
      return console.log("빈칸 있음") 
    }
    setVocabularyModalVisible(!vocabularyModalVisible);

    detail.kanji?.push(newKanji);
    detail.gana?.push(newGana);
    detail.meaning?.push(newMeaning);

    try {
      const tokenData = await getToken();
      const accessToken = tokenData?.access_token;

      const {id} = route.params;
      const response = await axios.patch(
        `http://10.0.2.2:8000/api/vocabularyNote/${id}`,
        detail,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        console.log('새로운 단어 생성 성공');
        setNewKanji('');
        setNewGana('');
        setNewMeaning('');

        setRefresh(!refresh);
      } else {
        console.error('새로운 단어 생성 실패');
      }
    } catch (error) {
      console.error('서버 통신 중 에러 발생:', error);
    }
  };

  // 기존의 단어를 수정하는 모달 창을 여는 로직
  const OnModalChangeVocabulary = async data => {
    console.log(data);
    setCurrentKanji(data.kanji);
    setCurrentGana(data.gana);
    setCurrentMeaning(data.meaning);
    setCurrentIndex(data.key);
    setChangeModalVisible(true)
  };

  // 단어 수정 모달 창에서 저장버튼을 눌렀을 때
  const changeVocabulary = async () => {  // async 키워드 추가
    // 올바른 배열 요소 접근 방식
    detail.kanji[currentIndex] = currentKanji;
    detail.gana[currentIndex] = currentGana;
    detail.meaning[currentIndex] = currentMeaning;
    console.log(detail);

    try {
      const tokenData = await getToken();
      const accessToken = tokenData?.access_token;

      const {id} = route.params;
      const response = await axios.patch(
        `http://10.0.2.2:8000/api/vocabularyNote/${id}`,
        detail,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        console.log('단어 수정 성공');  // 메시지가 '단어 삭제 성공'에서 '단어 수정 성공'으로 변경
        setRefresh(!refresh); // 상태 업데이트를 위해 refresh 상태 토글
      } else {
        console.error('단어장 수정 실패');  // 메시지가 '단어장 삭제 실패'에서 '단어장 수정 실패'로 변경
      }
    } catch (error) {
      console.error('서버 통신 중 에러 발생:', error);
    }

    setChangeModalVisible(false);
};


  // 단어장에서 단어 한개 삭제하는 로직
  const deleteVocabulary = async (data: any) => {
    // data의 key를 숫자 형태로 변환
    const index = parseInt(data.key, 10);

    // 각 배열에서 해당 인덱스의 요소를 제거
    detail.gana = detail.gana?.filter((_, idx) => idx !== index);
    detail.kanji = detail.kanji?.filter((_, idx) => idx !== index);
    detail.meaning = detail.meaning?.filter((_, idx) => idx !== index);

    try {
      const tokenData = await getToken();
      const accessToken = tokenData?.access_token;

      const {id} = route.params;
      const response = await axios.patch(
        `http://10.0.2.2:8000/api/vocabularyNote/${id}`,
        detail,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        console.log('단어 삭제 성공');
        setRefresh(!refresh);
      } else {
        console.error('단어장 삭제 실패');
      }
    } catch (error) {
      console.error('서버 통신 중 에러 발생:', error);
    }
  };

  // 단어장 삭제하는 로직
  const deleteAllVocabulary = async () => {
    try {
      const tokenData = await getToken();
      const accessToken = tokenData?.access_token;

      const {id} = route.params;
      const response = await axios.delete(
        `http://10.0.2.2:8000/api/vocabularyNote/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        console.log(response.data);
        navigation.navigate('WordMain');
      } else {
        console.error('단어장 삭제 실패');
      }
    } catch (error) {
      console.error('서버 통신 중 에러 발생:', error);
    }
  };

  return (
    <>
      <View
        style={{
          backgroundColor: '#212A3E',
          height: 60,
        }}>
        <BackButton />
        <View
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}>
          <Text style={styles.txt}>{detail.title}</Text>
          <TouchableOpacity
            style={{
              width: 35,
              height: 35,
              position: 'absolute',
              right: 40,
              marginEnd: 5,
            }}
            onPress={() => setVocabularyModalVisible(!vocabularyModalVisible)}>
            <Icon name="add" size={30} color={'white'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: 35,
              height: 35,
              position: 'absolute',
              right: 5,
              marginEnd: 5,
            }}
            onPress={() => setSettingModalVisible(!settingModalVisible)}>
            <Icon name="settings" size={30} color={'white'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        {/* 단어장 설정 모달창 */}
        <View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={settingModalVisible}
            onRequestClose={() => {
              setSettingModalVisible(!settingModalVisible);
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
                  height: '40%',
                  borderWidth: 3,
                  backgroundColor: 'white',
                  borderRadius: 20,
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 20, marginTop: 10}}>단어장 설정</Text>
                <View
                  style={{
                    width: '80%',
                    // backgroundColor: 'grey',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 20,
                  }}>
                  <Text style={{fontSize: 15}}>한자 보기</Text>
                  <Switch
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={isKanji ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleKanjiSwitch}
                    value={isKanji}
                  />
                </View>

                <View
                  style={{
                    width: '80%',
                    // backgroundColor: 'grey',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{fontSize: 15}}>가나 보기</Text>
                  <Switch
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={isGana ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleGanaSwitch}
                    value={isGana}
                  />
                </View>

                <View
                  style={{
                    width: '80%',
                    // backgroundColor: 'grey',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{fontSize: 15}}>뜻 보기</Text>
                  <Switch
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={isMeaning ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleMeaningSwitch}
                    value={isMeaning}
                  />
                </View>

                <View
                  style={{
                    width: '80%',
                    // backgroundColor: 'grey',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={{fontSize: 15}}>발음 듣기 보기</Text>
                  <Switch
                    trackColor={{false: '#767577', true: '#81b0ff'}}
                    thumbColor={isPronunciation ? '#f5dd4b' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={togglePronunciationSwitch}
                    value={isPronunciation}
                  />
                </View>

                <View
                  style={{
                    width: 160,
                    height: 30,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    // backgroundColor:'grey',
                    marginTop: 40,
                  }}>
                  <TouchableOpacity
                    onPress={() => setSettingModalVisible(!settingModalVisible)}
                    style={{
                      width: 100,
                      height: '100%',
                      backgroundColor: 'green',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 10,
                    }}>
                    <Text style={{color: 'white'}}>확인</Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    width: 160,
                    height: 20,
                    // backgroundColor: 'red',
                    marginTop: 20,
                  }}>
                  <TouchableOpacity
                    onPress={deleteAllVocabulary}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={{color: 'red'}}>단어장 삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
        {/* 단어장 설정 모달창 */}

        {/* 새로운 단어 생성 모달창 */}
        <View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={vocabularyModalVisible}
            onRequestClose={() => {
              setVocabularyModalVisible(!vocabularyModalVisible);
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
                  height: '40%',
                  borderWidth: 3,
                  backgroundColor: 'white',
                  borderRadius: 20,
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 20, margin: 10}}>새로운 단어 추가</Text>
                <View
                  style={{
                    width: '80%',
                    height: '70%',
                    // borderWidth: 3,
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      height: '30%',
                      width: '80%',
                      // borderWidth: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text>한자</Text>
                    <TextInput
                      style={{
                        width: '80%',
                        height: '90%',
                        borderWidth: 2,
                        marginLeft: 10,
                      }}
                      onChangeText={text => setNewKanji(text)}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      height: '30%',
                      width: '80%',
                      // borderWidth: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text>가나</Text>
                    <TextInput
                      style={{
                        width: '80%',
                        height: '90%',
                        borderWidth: 2,
                        marginLeft: 10,
                      }}
                      onChangeText={text => setNewGana(text)}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      height: '30%',
                      width: '80%',
                      // borderWidth: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text>의미</Text>
                    <TextInput
                      style={{
                        width: '80%',
                        height: '90%',
                        borderWidth: 2,
                        marginLeft: 10,
                      }}
                      onChangeText={text => setNewMeaning(text)}
                    />
                  </View>
                </View>

                <View
                  style={{
                    width: 160,
                    height: 30,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    // backgroundColor:'grey',
                  }}>
                  <TouchableOpacity
                    onPress={() => setVocabularyModalVisible(false)}
                    style={{
                      width: 100,
                      height: '100%',
                      backgroundColor: 'grey',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 10,
                    }}>
                    <Text style={{color: 'white'}}>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => addVocabulary()}
                    style={{
                      width: 100,
                      height: '100%',
                      backgroundColor: 'green',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 10,
                    }}>
                    <Text style={{color: 'white'}}>저장</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
        {/* 새로운 단어 생성 모달창 */}

        {/* 기존 단어 수정 모달창 */}
        <View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={changeModalVisible}
            onRequestClose={() => {
              setChangeModalVisible(!changeModalVisible);
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
                  height: '40%',
                  borderWidth: 3,
                  backgroundColor: 'white',
                  borderRadius: 20,
                  alignItems: 'center',
                }}>
                <Text style={{fontSize: 20, margin: 10}}>단어 수정</Text>
                <View
                  style={{
                    width: '80%',
                    height: '70%',
                    // borderWidth: 3,
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      height: '30%',
                      width: '80%',
                      // borderWidth: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text>한자</Text>
                    <TextInput
                      style={{
                        width: '80%',
                        height: '90%',
                        borderWidth: 2,
                        marginLeft: 10,
                      }}
                      value={currentKanji}
                      onChangeText={text => setCurrentKanji(text)}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      height: '30%',
                      width: '80%',
                      // borderWidth: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text>가나</Text>
                    <TextInput
                      style={{
                        width: '80%',
                        height: '90%',
                        borderWidth: 2,
                        marginLeft: 10,
                        
                      }}
                      value={currentGana}
                      onChangeText={text => setCurrentGana(text)}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      height: '30%',
                      width: '80%',
                      // borderWidth: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text>의미</Text>
                    <TextInput
                      style={{
                        width: '80%',
                        height: '90%',
                        borderWidth: 2,
                        marginLeft: 10,
                      }}
                      value={currentMeaning}
                      onChangeText={text => setCurrentMeaning(text)}
                    />
                  </View>
                </View>

                <View
                  style={{
                    width: 160,
                    height: 30,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    // backgroundColor:'grey',
                  }}>
                  <TouchableOpacity
                    onPress={() => changeVocabulary()}
                    style={{
                      width: 100,
                      height: '100%',
                      backgroundColor: 'green',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 10,
                    }}>
                    <Text style={{color: 'white'}}>저장</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
        {/* 기존 단어 수정 모달창 */}

        {detail.kanji ? (
          <>
            <SwipeListView
              data={detail.kanji.map((kanji, index) => ({
                key: `${index}`,
                kanji,
                gana: detail.gana[index],
                meaning: detail.meaning[index],
              }))}
              renderItem={renderItem}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-75}
              leftOpenValue={75}
              stopRightSwipe={-75}
              stopLeftSwipe={75}
              style={{marginBottom: 50}}
            />
          </>
        ) : (
          <LoadingBar />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#212A3E',
    borderWidth: 3,
    alignItems: 'center',
  },
  txt: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  rowFront: {
    backgroundColor: 'white',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    justifyContent: 'center',
    height: 80,
    margin: 10,
    borderRadius: 10,
    flexDirection: 'row',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#212A3E',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 10,
    justifyContent: 'center',
    position: 'absolute',
    top: 10,
    width: 80,
    marginRight: 10,
    borderTopRightRadius: 10,
    borderBottomEndRadius: 10,
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },
  backLeftBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 10,
    bottom: 10,
    width: 85,
    marginLeft: 10,
    borderTopLeftRadius: 10,
    borderBottomStartRadius: 10,
  },
  backLeftBtnRight: {
    backgroundColor: 'green', // 수정 버튼 색상
    left: 0, // 수정 버튼 위치
  },
});

export default VocabularyInfo;
