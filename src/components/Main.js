import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Main = () => {
  const navigation = useNavigation();

  const navigateToLogin = () => {
    navigation.navigate('Login');
  }

  const navigateToOcrTest = () => {
    navigation.navigate('OcrTest');
  };

  const navigateToPronounceTest = () => {
    navigation.navigate('PronounceTest');
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal contentContainerStyle={styles.scrollView}>
        <TouchableOpacity style={styles.box} onPress={navigateToLogin}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.box} onPress={navigateToOcrTest}>
          <Text style={styles.buttonText}>OCR 테스트</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.box} onPress={navigateToPronounceTest}>
          <Text style={styles.buttonText}>발음 테스트</Text>
        </TouchableOpacity>
        <View style={styles.box}><Text>Box 4</Text></View>
        <View style={styles.box}><Text>Box 5</Text></View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#394867',
  },
  scrollView: {
    marginTop: '40%',
  },
  box: {
    height: 230,
    width: 230,
    backgroundColor: 'white',
    borderColor: 'black',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Main;
