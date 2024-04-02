import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const Home: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/TamagoLogo.png')}
          style={{width: 300, height: 70, marginTop: 100}}
        />
        <Text style={{fontSize:20}}>일본어 학습 도우미 앱</Text>


        <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
          <Text style={styles.buttonText}>ログイン</Text>
        </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: 'white',
    marginBottom: 20,
  },
  button: {
    width:150,
    height:50,
    backgroundColor: '#5E81F4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 350,
    justifyContent: "center"
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    textAlign:"center",
    marginBottom: 5
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center', 
  },
});

export default Home;
