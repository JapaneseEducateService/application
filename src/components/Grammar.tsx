import React, {useEffect, useState} from 'react';
import api from '../api';
import {StyleSheet, Text, TouchableOpacity, View, FlatList} from 'react-native';
import BackButton from './button/backButton';
import GrammarModal from './GrammarModal';
import LoadingBar from './LoadingBar';
import TestModal from './TestModal';

const Grammar: React.FC = ({navigation}) => {
  const [grammarData, setGrammarData] = useState([]);
  const [selectedGrammar, setSelectedGrammar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
  const [selectedLevel, setSelectedLevel] = useState('N3'); // 기본 등급 설정
  const [testModalVisible, setTestModalVisible] = useState(false); // 테스트 모달 상태

  useEffect(() => {
    fetchData(selectedLevel);
  }, [selectedLevel]);

  // 데이터 가져오기
  const fetchData = async level => {
    setIsLoading(true); // 로딩 시작
    try {
      const response = await api.get('/jlpt/grammar');
      console.log(
        `받아온 문법 목록 (${level}):`,
        response.data[level][0].grammars,
      );
      setGrammarData(response.data[level][0].grammars);
    } catch (error) {
      console.error('서버 요청 에러:', error);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  const openModal = grammar => {
    setSelectedGrammar(grammar);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedGrammar(null);
    setModalVisible(false);
  };

  const openTestModal = () => {
    setTestModalVisible(true);
  };

  const closeTestModal = () => {
    setTestModalVisible(false);
  };

  const startTest = level => {
    closeTestModal();
    navigation.navigate('GrammarTest', {level});
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => openModal(item)}
      style={styles.grammarItem}>
      <Text style={styles.grammarText}>{item.grammar}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.backButtonContainer}>
        <BackButton />
      </View>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>文法</Text>
        <TouchableOpacity
          onPress={openTestModal}
          style={{
            width: 80,
            height: 30,
            position: 'absolute',
            right: 5,
            margin: 10,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#004bbb',
            elevation: 5,
          }}>
          <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white'}}>
            テスト
          </Text>
        </TouchableOpacity>
        <View style={styles.levelsContainer}>
          {['N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelButton,
                selectedLevel === level && styles.selectedLevelButton,
              ]}
              onPress={() => setSelectedLevel(level)}>
              <Text style={styles.levelText}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.listContainer}>
        {isLoading ? (
          <LoadingBar />
        ) : (
          <FlatList
            data={grammarData}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            style={styles.grammarList}
          />
        )}
      </View>
      {selectedGrammar && (
        <GrammarModal
          visible={modalVisible}
          onClose={closeModal}
          grammar={selectedGrammar}
        />
      )}
      <TestModal
        visible={testModalVisible}
        onClose={closeTestModal}
        onStartTest={startTest}
      />
    </>
  );
};

const styles = StyleSheet.create({
  backButtonContainer: {
    zIndex: 999,
  },
  headerContainer: {
    backgroundColor: '#006fff',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 15,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 10,
  },
  levelsContainer: {
    width: '100%',
    height: 50,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  levelButton: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLevelButton: {
    backgroundColor: '#004bbb',
    borderRadius: 10,
  },
  levelText: {
    color: 'white',
    fontSize: 20,
  },
  grammarList: {
    width: '100%',
    marginTop: 20,
  },
  grammarItem: {
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: '#ccc',
    elevation: 5,
  },
  grammarText: {
    fontSize: 18,
  },
});

export default Grammar;
