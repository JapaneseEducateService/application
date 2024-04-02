import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";

type WordMainProps = {
  navigation: StackNavigationProp<RootStackParamList>;
};

type RootStackParamList = {
  CreateVocabulary: undefined;
  MyVocabulary: undefined;
};

const WordMain: React.FC<WordMainProps> = ({ navigation }) => {
  return (
    <>
    <View style={{backgroundColor: "#212A3E"}}>
      <Text style={styles.titleTxt}>단어장</Text>
      <View style={styles.line}></View>
    </View>

    <View style={styles.container}>
      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate("CreateVocabulary")}
      >
        <Text>단어장 만들기</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate("MyVocabulary")}
      >
        <Text>내 단어장 보기</Text>
      </TouchableOpacity>

      <View style={styles.box}>
        <Text>JLPT 급수별 단어 보기</Text>
      </View>
    </View>

    </>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#212A3E",
    alignItems: "center",
  },
  titleTxt: {
    color: "white",
    fontSize: 15,
    margin: 10,
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "white",
    marginHorizontal: 10,
    marginBottom:10,
  },
  box: {
    width: 350,
    height: 180,
    backgroundColor: "white",
    marginVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default WordMain;
