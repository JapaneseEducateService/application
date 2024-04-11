import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button,
} from 'react-native';
import axios from 'axios';
import {getToken} from '../../utils/AuthStorage';
import {useRoute, RouteProp} from '@react-navigation/native';
import LoadingBar from '../LoadingBar';
import BackButton from '../button/backButton';
import {SwipeListView} from 'react-native-swipe-list-view';

type RootStackParamList = {
  VocabularyInfo: {id: string};
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
  const [detail, setDetail] = useState<VocabularyDetail>({});
  const route = useRoute<RouteProp<RootStackParamList, 'VocabularyInfo'>>();

  const SwipeableRow = ({item, index}) => {
    return (
      <View style={styles.rowFront}>
        <Text>{item.kanji}</Text>
        <Text>[ {item.gana} ]</Text>
        <Text>{item.meaning}</Text>
      </View>
    );
  };

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
  }, [route.params]);

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
        <Text style={{fontSize: 20, fontWeight:'bold', color:'black'}}>{data.item.kanji}</Text>
        <Text style={{ color:'black'}}>[ {data.item.gana} ]</Text>
      </View>
      <View style={{width: '70%', height: '100%', justifyContent: 'center'}}>
        <Text style={{fontSize: 15, marginLeft: 10, color:'black'}}>{data.item.meaning}</Text>
      </View>
    </View>
  );

  // 슬라이드 시 나타날 숨겨진 항목을 렌더링하는 함수
  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backLeftBtn, styles.backLeftBtnRight]} // 수정 버튼 스타일
        onPress={() => console.log('Edit', data.item)}>
        <Text style={{fontSize: 15, marginLeft: 10, color:'black'}}>수정하기</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]} // 삭제 버튼 스타일
        onPress={() => console.log('Delete', data.item)}>
        <Text style={{fontSize: 15, marginLeft: 10, color:'black'}}>삭제하기</Text>
      </TouchableOpacity>
    </View>
  );

  // 단어장 삭제 함수
  const deleteVocabulary = async () => {
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
        console.log(response.data)
        console.log("삭제완료");
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
        </View>
      </View>
      <View style={styles.container}>
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
          />
          <Button title="단어장 삭제" onPress={deleteVocabulary}></Button>
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
    marginRight: 10,
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
