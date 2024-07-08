import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../../api';
import BackButton from '../../components/button/backButton';

const SentenceInfo: React.FC = () => {
  const [sentenceInfo, setSentenceInfo] = useState(null);
  const [showHiragana, setShowHiragana] = useState(false);
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
      <View style={{ width: '100%', height: 50 }}>
        <BackButton />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {sentenceInfo ? (
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>{sentenceInfo.title}</Text>
              
              <Text style={styles.situation}>{sentenceInfo.situation}</Text>
            </View>
            <View style={{width:'100%', height:45, justifyContent:'center'}}>
            <TouchableOpacity
                style={styles.smallButton}
                onPress={() => setShowHiragana(!showHiragana)}>
                <Text style={styles.buttonText}>
                  {showHiragana ? 'ひらがなを隠す' : 'ひらがなを見る'}
                </Text>
              </TouchableOpacity>
              </View>
            
            <View style={styles.sentences}>
              
              {sentenceInfo.sentences.map((sentence, index) => (
                <View key={index} style={styles.sentenceContainer}>
                  <Text style={styles.sentenceNumber}>{index + 1}</Text>
                  <Text style={styles.sentence}>{sentence.문장}</Text>
                  <Text style={styles.meaning}>{sentence.의미}</Text>
                  {showHiragana && sentence.히라가나 && (
                    <Text style={styles.hiragana}>{sentence.히라가나}</Text>
                  )}
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
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#006fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  situation: {
    fontSize: 18,
    color: 'white',
    marginTop: 10,
  },
  smallButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: '#ffffff',
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#006fff',
  },
  buttonText: {
    color: '#006fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sentences: {
    marginTop: 10,
  },
  sentenceContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sentenceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  sentence: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  meaning: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  hiragana: {
    fontSize: 16,
    color: 'gray',
  },
});

export default SentenceInfo;
