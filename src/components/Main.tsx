import React from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface Item {
  itemId: "PronounceTest" | "WordMain" | "Community" | "Game";
  title: string;
  description: string;
}

type RootStackParamList = {
  PronounceTest: undefined;
  WordMain: undefined;
  Community: undefined;
  Game: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const Main: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const data: Item[] = [
    { itemId: 'PronounceTest', title: '발음 평가', description: '설명1' },
    { itemId: 'WordMain', title: '단어장', description: '설명2' },
    { itemId: 'Community', title: '커뮤니티', description: '설명3' },
    { itemId: 'Game', title: '게임', description: '설명4' },
  ];

  const renderItem = ({ item }: { item: Item }) => (
    <View style={{alignItems:"center"}}>
      <TouchableOpacity
        style={styles.box}
        onPress={() => navigation.navigate(item.itemId)}
      >
        <Text style={styles.buttonText}>{item.title}</Text>
      </TouchableOpacity>
      <Text style={{fontSize:20, marginTop: 30, color: "white"}}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        horizontal
        contentContainerStyle={styles.scrollView}
        keyExtractor={(item) => item.itemId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212A3E',
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