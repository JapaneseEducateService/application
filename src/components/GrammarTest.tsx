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
      console.log("문법22222", grammar.grammar);
      console.log(grammar.grammar_examples[0]);

      let japaneseExample = '';
      let koreanExample = '';

      // 예제가 존재하고 <br> 태그로 분리 가능한지 확인
      if (grammar.grammar_examples && grammar.grammar_examples[0] && grammar.grammar_examples[0].example) {
        const examples = grammar.grammar_examples[0].example.split('<br>');
        japaneseExample = examples[0] || '';
        koreanExample = examples[1] || '';
      }

      // 괄호와 괄호 안의 내용을 제거
      const cleanJapaneseExample = japaneseExample.replace(/（[^）]*）/g, '');

      // 특수 문자를 제거하여 비교
      const cleanGrammar = grammar.grammar.replace(/[\s~!@#$%^&*()_+|<>?:{}.,;'"[\]\\]/g, '');
      const cleanJapaneseExampleWithoutSpecialChars = cleanJapaneseExample.replace(/[\s~!@#$%^&*()_+|<>?:{}.,;'"[\]\\]/g, '');

      // 문법 패턴을 빈칸으로 대체
      let questionText = cleanJapaneseExampleWithoutSpecialChars;
      questionText = questionText.replace(new RegExp(cleanGrammar, 'g'), '_____');

      const correctAnswer = grammar.grammar;
      const incorrectAnswers = grammars
        .filter(g => g.grammar !== grammar.grammar)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(g => g.grammar);

      // 빈칸이 생기지 않은 문제는 제외
      if (!questionText.includes('_____')) {
        return null;
      }

      return {
        japaneseExample: questionText,
        koreanExample: koreanExample.trim(),
        correctAnswer,
        options: shuffleArray([correctAnswer, ...incorrectAnswers]),
      };
    }).filter(Boolean); // null 값을 제외

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
        <Text style={styles.title}>問題 {currentQuestion + 1} / {testData.length}</Text>
        <Text style={styles.questionText}>
          {testData[currentQuestion].japaneseExample}
        </Text>
        <Text style={styles.translationText}>
          {'\n'}{testData[currentQuestion].koreanExample}
        </Text>
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
    marginBottom: 10,
    paddingLeft: 10,
  },
  translationText: {
    fontSize: 18,
    marginBottom: 20,
    paddingLeft: 10,
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
    fontSize: 90,
    color: '#28a745',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  wrongText: {
    fontSize: 90,
    color: '#dc3545',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default GrammarTest;
