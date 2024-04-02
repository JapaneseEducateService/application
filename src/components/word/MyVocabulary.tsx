import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import axios from 'axios';
import {getToken} from '../../utils/AuthStorage';
import {ScrollView} from 'react-native-gesture-handler';
import {useNavigation, NavigationProp} from '@react-navigation/native';

type RootStackParamList = {
  CreateVocabulary: undefined;
  MyVocabulary: undefined;
};

const MyVocabulary: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [vocabularyList, setVocabularyList] = useState([]);

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
          setVocabularyList(response.data.data.notes); // 상태 업데이트
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
    <ScrollView>
      <View style={styles.container}>
      {vocabularyList.map((note) => (
        <TouchableOpacity
          key={note.id}
          style={styles.noteContainer}
          onPress={() => navigation.navigate('VocabularyInfo', { id: note.id })}
        >
          <Text style={styles.noteTitle}>{note.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212A3E',
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
});

export default MyVocabulary;
