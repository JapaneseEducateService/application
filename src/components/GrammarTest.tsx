import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import api from '../api';
import BackButton from './button/backButton';
import LoadingBar from './LoadingBar';

const GrammarTest = ({ route, navigation }) => {
  const { level } = route.params;
  const [testData, setTestData] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    fetchData(level);
  }, [level]);

  const fetchData = async (level) => {
    setIsLoading(true);
    try {
      const response = await api.get('/jlpt/grammar');
      const grammars = response.data[level][0].grammars;
      generateTestData(grammars);
    } catch (error) {
      console.error('서버 요청 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTestData = (grammars) => {
    const questions = grammars.map((grammar) => {
      const cleanGrammar = grammar.grammar.replace(/[\s~!@#$%^&*()_+|<>?:{}.,;'"[\]\\]/g, '');
      const questionText = grammar.grammar_examples[0].example.replace(new RegExp(cleanGrammar, 'g'), '_____').split('<br>').join('\n');
      const correctAnswer = grammar.grammar;
      const incorrectAnswers = grammars
        .filter(g => g.grammar !== grammar.grammar)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(g => g.grammar);
      
      return {
        questionText,
        correctAnswer,
        options: shuffleArray([correctAnswer, ...incorrectAnswers]),
      };
    });
    setTestData(questions);
    setOptions(questions[0].options);
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleOptionPress = (option) => {
    const isCorrectAnswer = option === testData[currentQuestion].correctAnswer;
    setIsCorrect(isCorrectAnswer);
    setShowResult(true);

    if (isCorrectAnswer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      setShowResult(false);
      if (currentQuestion < testData.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setOptions(testData[currentQuestion + 1].options);
      } else {
        alert(`테스트 완료! 점수: ${score + (isCorrectAnswer ? 1 : 0)} / ${testData.length}`);
        navigation.goBack();
      }
    }, 1000);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingBar />
      </View>
    );
  }

  return (
    <>
      <View style={{ zIndex: 999, marginBottom: 100 }}>
        <BackButton />
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>문제 {currentQuestion + 1} / {testData.length}</Text>
        <Text style={styles.questionText}>{testData[currentQuestion].questionText}</Text>
        <FlatList
          data={options}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionButton,
                showResult && item === testData[currentQuestion].correctAnswer && styles.correctAnswer,
                showResult && item !== testData[currentQuestion].correctAnswer && styles.wrongAnswer,
              ]}
              onPress={() => !showResult && handleOptionPress(item)}
              disabled={showResult}
            >
              <Text style={styles.optionText}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        {showResult && (
          <Text style={isCorrect ? styles.correctText : styles.wrongText}>
            {isCorrect ? 'O' : 'X'}
          </Text>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  backButtonContainer: {
    zIndex: 99,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 20,
  },
  optionButton: {
    padding: 15,
    backgroundColor: '#006fff',
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
  correctAnswer: {
    backgroundColor: '#28a745',
  },
  wrongAnswer: {
    backgroundColor: '#dc3545',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctText: {
    fontSize: 24,
    color: '#28a745',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  wrongText: {
    fontSize: 24,
    color: '#dc3545',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default GrammarTest;
