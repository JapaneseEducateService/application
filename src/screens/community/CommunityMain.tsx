import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Button, Text, Image} from 'react-native';
import {getToken} from '../../utils/AuthStorage';
import api from '../../api';
import BackButton from '../../components/button/backButton';

interface Props {}

const CommunityMain: React.FC<Props> = () => {
  const [publicNoteData, setPublicNoteData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

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
      console.log(data);
      setPublicNoteData(data);
    } catch (error) {
      console.error('서버 요청 에러:', error);
    }
  };

  return (
    <>
      <View style={{zIndex:999}}>
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
          <View
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
            }}>
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
              <Text style={{fontSize: 16, marginTop: 10}}>{note.user}</Text>
            </View>
          </View>
        ))}
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
