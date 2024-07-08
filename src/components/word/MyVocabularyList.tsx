import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import axios from 'axios';
import {getToken} from '../../utils/AuthStorage';
import {ScrollView} from 'react-native-gesture-handler';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import LoadingBar from '../LoadingBar';
import Icon from 'react-native-vector-icons/Ionicons';
import BackButton from '../button/backButton';
import api from '../../api';

type RootStackParamList = {
  CreateVocabulary: undefined;
  MyVocabularyList: undefined;
};

const MyVocabularyList: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [vocabularyList, setVocabularyList] = useState([]);
  const [adminVocabularyList, setAdminVocabularyList] = useState([]);

  // User + Admin 단어장 리스트 불러오기
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        const response = await api.get('/vocabularyNote');
        if (response.status === 200) {
          // Admin 단어장에서 id와 title만 뽑아서 저장하기
          const adminVocabularyTitle = response.data.adminNotes.map(note => ({
            id: note.id,
            title: note.title,
          }));
          // User 단어장에서 id와 title만 뽑아서 저장하기
          const userVocabularyTitle = response.data.notes.map(note => ({
            id: note.id,
            title: note.title,
          }));
          setAdminVocabularyList(adminVocabularyTitle);
          setVocabularyList(userVocabularyTitle); // 상태 업데이트
        } else {
          console.error('단어장 리스트 가져오기 실패');
        }
      } catch (error) {
        console.error('서버 통신 중 에러 발생:', error);
      }
    };

    fetchVocabulary();
  }, []);

  return (
    <>
      <View
        style={{
          backgroundColor: '#006fff',
          height: 60,
        }}>
        <BackButton />
        <View
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={styles.txt}>マイ単語帳</Text>
        </View>
      </View>
      <ScrollView style={{flex: 1, backgroundColor: 'white', minHeight: 300}}>
      <Text style={{margin:5, fontSize:15, fontWeight:'bold', color:'black'}}>ユーザー単語帳</Text>
        {vocabularyList || adminVocabularyList ? (
          <>
            <View style={styles.container}>
              {vocabularyList.map(note => (
                <TouchableOpacity
                  key={note.id}
                  style={styles.noteContainer}
                  onPress={() =>
                    navigation.navigate('VocabularyInfo', {id: note.id})
                  }>
                  <Text style={styles.noteTitle}>{note.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{width: '100%', alignItems: 'center'}}>
              <View style={{width: '95%', borderWidth: 1, margin:10, borderColor:'#B4A2D4'}} />
            </View>
            <Text style={{margin:5, fontSize:15, fontWeight:'bold', color:'black'}}>基本単語帳</Text>

            <View style={styles.container}>
              {adminVocabularyList.map(note => (
                <TouchableOpacity
                  key={note.id}
                  style={styles.noteContainer}
                  onPress={() =>
                    navigation.navigate('VocabularyInfo', {id: note.id})
                  }>
                  <Text style={styles.noteTitle}>{note.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <LoadingBar />
        )}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteContainer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    width: '90%',
    borderWidth: 2,
    borderColor: '#B4A2D4',
    elevation: 5,
  },
  noteTitle: {
    fontSize: 16,
    color: '#000',
  },
  txt: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
});

export default MyVocabularyList;
