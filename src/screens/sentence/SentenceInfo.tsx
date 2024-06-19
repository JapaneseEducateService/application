import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../../api';
import BackButton from '../../components/button/backButton';

const SentenceInfo: React.FC = () => {
  const [sentenceInfo, setSentenceInfo] = useState(null);
  const route = useRoute();
  const { id } = route.params;

  useEffect(() => {
    fetchSentenceInfo();
  }, []);

  const fetchSentenceInfo = async () => {
    try {
      const response = await api.get(`/sentenceNotes/get/${id}`);
      setSentenceInfo(response.data);
    } catch (error) {
      console.error('서버 요청 에러:', error);
    }
  };

  return (
    <>
    <View style={{width:'100%', height:50}}>
      <BackButton/>
    </View>
    <ScrollView contentContainerStyle={styles.container}>
      {sentenceInfo ? (
        <>
          <Text style={styles.title}>{sentenceInfo.title}</Text>
          <Text style={styles.situation}>{sentenceInfo.situation}</Text>
          <View style={styles.sentences}>
            {sentenceInfo.sentences.map((sentence, index) => (
              <View key={index} style={styles.sentenceContainer}>
                <Text style={styles.sentence}>{sentence.문장}</Text>
                <Text style={styles.gana}>{sentence.가나}</Text>
                <Text style={styles.meaning}>{sentence.의미}</Text>
                <Text style={styles.hiragana}>{sentence.히라가나}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  situation: {
    fontSize: 18,
    marginBottom: 20,
  },
  sentences: {
    marginTop: 10,
  },
  sentenceContainer: {
    marginBottom: 15,
  },
  sentence: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gana: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  meaning: {
    fontSize: 16,
  },
  hiragana: {
    fontSize: 16,
    color: 'gray',
  },
});

export default SentenceInfo;
