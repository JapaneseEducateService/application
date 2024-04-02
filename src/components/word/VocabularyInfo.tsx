import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { getToken } from '../../utils/AuthStorage';
import { useRoute, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  VocabularyInfo: { id: string };
};

const VocabularyInfo: React.FC = () => {
  const [detail, setDetail] = useState(null);
  const route = useRoute<RouteProp<RootStackParamList, 'VocabularyInfo'>>();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { access_token } = await getToken();
        const { id } = route.params;
        const response = await axios.get(`http://10.0.2.2:8000/api/vocabularyNote/${id}`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
            console.log(response.data.data)
          setDetail(response.data.data);
        } else {
          console.error('단어장 상세 정보 가져오기 실패');
        }
      } catch (error) {
        console.error('서버 통신 중 에러 발생:', error);
      }
    };

    fetchDetail();
  }, [route.params]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        {detail ? (
          <>
            <Text style={styles.title}>{detail.title}</Text>
            <Text style={styles.title}>{JSON.parse(detail.kanji)}</Text>
            <Text style={styles.title}>{JSON.parse(detail.gana)}</Text>
            <Text style={styles.title}>{JSON.parse(detail.meaning)}</Text>
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default VocabularyInfo;
