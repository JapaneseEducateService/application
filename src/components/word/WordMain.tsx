import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import BackButton from '../button/backButton';

type WordMainProps = {
  navigation: StackNavigationProp<RootStackParamList>;
};

type RootStackParamList = {
  CreateVocabulary: undefined;
  MyVocabularyList: undefined;
  DefaultVocabulary: undefined;
};

const WordMain: React.FC<WordMainProps> = ({navigation}) => {
  return (
    <>
      <View style={{backgroundColor: '#212A3E'}}>
        <View
          style={{backgroundColor: '#212A3E', paddingBottom: 20, height: 40}}>
          <BackButton />
        </View>

        <Text style={styles.titleTxt}>단어장</Text>
        <View style={styles.line}></View>
      </View>

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate('CreateVocabulary')}>
          <Text style={styles.menuTxt}>단어장 만들기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate('MyVocabularyList')}>
          <Text style={styles.menuTxt}>내 단어장 보기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate('DefaultVocabulary')}>
          <Text style={styles.menuTxt}>JLPT 급수별 단어 보기</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212A3E',
    alignItems: 'center',
  },
  titleTxt: {
    color: 'white',
    fontSize: 15,
    margin: 10,
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  box: {
    width: 350,
    height: 180,
    backgroundColor: 'white',
    marginVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTxt: {
    fontSize:20
  }
});

export default WordMain;
