import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../api';
import BackButton from '../../components/button/backButton';

const SentenceList: React.FC = () => {
  const [titles, setTitles] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/sentenceNotes/lists');
      const data = response.data.map(note => ({
        id: note.id,
        title: note.title,
      }));
      setTitles(data);
    } catch (error) {
      console.error('서버 요청 에러:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('SentenceInfo', { id: item.id })}>
      <Text style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={{ zIndex: 99 }}>
        <BackButton />
      </View>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>マイ文章ノート</Text>
      </View>
      <View style={styles.container}>
        <FlatList
          data={titles}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#006fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginVertical: 8,
    // marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default SentenceList;
