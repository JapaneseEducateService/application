import {Alert, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const PronunciationWithExample: React.FC = () => {
  const buttonsData = [
    {
      id: '1',
      title: '여행',
      imgSource: require('../../../assets/background.jpg'),
      onPress: () => Alert.alert('여행'),
    },
    {
      id: '2',
      title: '호텔',
      imgSource: require('../../../assets/background2.jpg'),
      onPress: () => Alert.alert('호텔'),
    },
    {
      id: '3',
      title: '공항',
      imgSource: require('../../../assets/background3.jpg'),
      onPress: () => Alert.alert('공항'),
    },
    {
      id: '4',
      title: '경찰서',
      imgSource: require('../../../assets/background4.jpeg'),
      onPress: () => Alert.alert('경찰서'),
    },
    {
      id: '5',
      title: '식당',
      imgSource: require('../../../assets/background.jpg'),
      onPress: () => Alert.alert('식당'),
    },
    {
      id: '6',
      title: '시장',
      imgSource: require('../../../assets/background2.jpg'),
      onPress: () => Alert.alert('시장'),
    },
    {
      id: '7',
      title: '바다',
      imgSource: require('../../../assets/background3.jpg'),
      onPress: () => Alert.alert('바다'),
    },
    {
      id: '8',
      title: '대중교통',
      imgSource: require('../../../assets/background4.jpeg'),
      onPress: () => Alert.alert('대중교통'),
    },
    {
      id: '9',
      title: '백화점',
      imgSource: require('../../../assets/background.jpg'),
      onPress: () => Alert.alert('백화점'),
    },
  ];
  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>어느 상황의 예문을 연습해보시겠습니까?</Text>
        <Image
          source={require('../../../assets/Tama.png')}/>
      </View>
      <View style={styles.buttonsContainer}>
        {buttonsData.map((button) => (
          <TouchableOpacity key={button.id} style={styles.button} onPress={button.onPress}>
            <Image source={button.imgSource} style={styles.image} />
            <Text style={styles.buttonText}>{button.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#212A3E',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    height: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 20,
    color: 'white',
    marginBottom:20,
  },
  buttonsContainer: {
    width: '95%',
    height: '70%',
    borderRadius: 30,
    // backgroundColor: '#f5f5f7',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    width: 100,
    height: 100,
    margin: 8,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonText: {
    fontSize: 30,
    color: 'white',
    position: 'absolute',
    fontWeight: 'bold',
  },
});

export default PronunciationWithExample;