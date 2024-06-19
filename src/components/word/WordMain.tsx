import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import BackButton from '../button/backButton';
import Icon from 'react-native-vector-icons/Ionicons';

type WordMainProps = {
  navigation: StackNavigationProp<RootStackParamList>;
};

type RootStackParamList = {
  CreateVocabulary: undefined;
  MyVocabularyList: undefined;
  SentenceMain: undefined;
  SentenceList: undefined;
};

const WordMain: React.FC<WordMainProps> = ({navigation}) => {
  return (
    <>  
      <View style={{backgroundColor: '#006fff'}}>
        <View
          style={{backgroundColor: '#006fff', paddingBottom: 20, height: 40}}>
          <BackButton />
        </View>

        <Text style={styles.titleTxt}>단어장</Text>
        <View style={styles.line}></View>
      </View>

      <View style={styles.container}>
        {/* 단어장 만들기 + 내 단어장 보기 */}
        <View
          style={{
            width: '100%',
            height: 200,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}>
          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate('CreateVocabulary')}>
            <View style={styles.circle} />
            <Icon name="book-outline" size={60} color={'black'} />
            <Text style={styles.menuTxt}>단어장 만들기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate('MyVocabularyList')}>
            <View style={styles.circle} />
            <Icon name="eye-outline" size={60} color={'black'} />
            <Text style={styles.menuTxt}>내 단어장 보기</Text>
          </TouchableOpacity>
        </View>
        <View style={{height: 30, width: '100%'}}>
          <Text style={{color: 'black', fontSize: 15, marginLeft: 10}}>
            문장노트
          </Text>
        </View>

        <View
          style={{
            borderWidth: 0.5,
            borderBottomColor: 'black',
            width: '95%',
          }}></View>

        {/* 문장노트 만들기 + 문장노트만들기 */}
        <View
          style={{
            width: '100%',
            height: 200,
            // borderWidth: 1,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}>
          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate('SentenceMain')}>
              <View style={styles.circle} />
              <Icon name="newspaper-outline" size={60} color={'black'} />
            <Text style={styles.menuTxt}>문장 노트 만들기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate('SentenceList')}>
              <View style={styles.circle} />
              <Icon name="glasses-outline" size={60} color={'black'} />
            <Text style={styles.menuTxt}>문장 노트 보기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    width: 180,
    height: 180,
    backgroundColor: 'white',
    marginVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 15,
    borderColor: '#E2CCF6',
    borderWidth: 1,
  },
  menuTxt: {
    fontSize: 20,
    color:'black'
  },
  circle: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    left: 0,
    top: 0,
    margin: 10,
    borderWidth: 1,
    borderColor: '#E2CCF6',
  },
});

export default WordMain;
