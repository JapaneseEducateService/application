import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import axios from 'axios';
import {getToken} from '../../utils/AuthStorage';
import {ScrollView} from 'react-native-gesture-handler';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import LoadingBar from '../LoadingBar';
import Icon from 'react-native-vector-icons/Ionicons';
import BackButton from '../button/backButton';

type RootStackParamList = {
  CreateVocabulary: undefined;
  MyVocabularyList: undefined;
};

const MyVocabularyList: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [vocabularyList, setVocabularyList] = useState([]);

  // User 단어장 리스트 불러오기
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        const {access_token} = await getToken();
        const response = await axios.get(
          'http://10.0.2.2:8000/api/vocabularyNote',
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (response.status === 200) {
          setVocabularyList(response.data.notes); // 상태 업데이트
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
          }}>
          <Text style={styles.txt}>내 단어장 리스트</Text>
        </View>
      </View>
      <ScrollView style={{flex: 1, backgroundColor: '#212A3E'}}>
      
        {vocabularyList ? (
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
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: '90%',
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
