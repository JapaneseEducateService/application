import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  requireNativeComponent,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

interface Item {
  itemId: 'PronounceTest' | 'WordMain' | 'CommunityMain' | 'Game';
  title: string;
  description: string;
  subDescription: string;
  image: string;
}

type RootStackParamList = {
  PronounceTest: undefined;
  WordMain: undefined;
  CommunityMain: undefined;
  Game: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const Main: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const scrollX = useRef(new Animated.Value(0)).current; // 스크롤 위치를 추적하기 위한 Animated.Value
  const windowWidth = Dimensions.get('window').width;

  const [currentIndex, setCurrentIndex] = useState(0); // 현재 중앙에 있는 박스의 인덱스 상태

  const boxWidth = 150; // 박스의 너비를 정의
  const itemMarginHorizontal = 40; // 박스의 양쪽 마진
  const paddingHorizontal =
    (windowWidth - boxWidth - itemMarginHorizontal * 2) / 2; // 첫 번째 및 마지막 아이템에 적용할 패딩 계산
  const snapInterval = boxWidth + itemMarginHorizontal * 2; // 스냅 간격 계산

  // contentInset과 contentOffset을 설정하여 첫 번째 및 마지막 아이템이 화면 중앙에 올 수 있도록 함
  const contentInset = {left: paddingHorizontal, right: paddingHorizontal};
  const contentOffset = {x: -paddingHorizontal, y: 0};

  const data: Item[] = [
    {
      itemId: 'PronounceTest',
      title: '발음 평가',
      description: '원하는 문장을 자유롭게',
      subDescription: 'AI를 사용한 발음 상세 교정',
      image: require('../../assets/background.jpg'),
    },
    {
      itemId: 'WordMain',
      title: '단어장',
      description: '사진으로 편하고 빠르게',
      subDescription: 'OCR기술로 빠른 단어장 생성,',
      image: require('../../assets/background2.jpg'),
    },
    {
      itemId: 'CommunityMain',
      title: '단어 창고',
      description: '단어장의 공유',
      subDescription: '유저들이 직접 만든 단어장을 다운',
      image: require('../../assets/background4.jpeg'),
    },
    {
      itemId: 'Game',
      title: '문법',
      description: '일본어 학습을 재미있게',
      subDescription: '단어장을 활용한 재미있는 게임들',
      image: require('../../assets/background3.jpg'),
    },
  ];

  // 가운데 위치한 인덱스
  useEffect(() => {
    const listener = scrollX.addListener(({value}) => {
      const itemTotalWidth = boxWidth + 80; // 아이템 너비 + 양쪽 마진
      const index = Math.round(value / itemTotalWidth); // 현재 중앙에 위치한 아이템의 인덱스 계산
      // console.log('현재 가운데 있는 박스 인덱스: ', index
      setCurrentIndex(index);
    });

    return () => {
      scrollX.removeListener(listener);
    };
  }, []);

  // 스크롤 위치
  // useEffect(() => {
  //   // scrollX 값이 변할 때마다 콘솔에 출력
  //   const listener = scrollX.addListener(({value}) => {
  //     console.log('스크롤 위치: ', value);
  //   });

  //   // 컴포넌트가 언마운트될 때 리스너 제거
  //   return () => {
  //     scrollX.removeListener(listener);
  //   };
  // }, []);

  const renderItem = ({item, index}: {item: Item; index: number}) => {
    const inputRange = [
      (index - 1) * 220, // 이전 아이템
      index * 220, // 현재 아이템
      (index + 1) * 220, // 다음 아이템
    ];

    // 글자 투명도
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0], // 스크롤에 따라 opacity가 변화하는 범위
      extrapolate: 'clamp', // inputRange 바깥의 값을 'clamp'로 제한
    });

    // 아이템의 scale 변화를 위한 outputRange 정의
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [1, 2, 1], // 예: 목표 지점에서 가장 크기가 커짐
      extrapolate: 'clamp',
    });

    return (
      <View style={{alignItems: 'center', paddingTop: 80}}>
        <TouchableOpacity onPress={() => navigation.navigate(item.itemId)}>
          <Animated.View
            style={[
              styles.box,
              {
                transform: [{scale}],
              },
            ]}>
            <Image
              source={item.image}
              style={{
                width: '100%',
                height: '85%',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
              }}
            />
            <View
              style={{
                height: '15%',
                width: '100%',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
              <Text style={styles.buttonText}>{item.title}</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        <Animated.View style={{opacity, alignItems: 'center'}}>
          <Text
            style={{
              fontSize: 20,
              color: 'white',
              marginTop: 100,
              fontWeight: 'bold',
            }}>
            {item.description}
          </Text>
          <Text style={{fontSize: 15, color: 'white', marginTop: 10}}>
            {item.subDescription}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={data}
        renderItem={renderItem}
        horizontal
        snapToInterval={snapInterval} // 스냅 간격 설정
        contentContainerStyle={[styles.scrollView, {paddingHorizontal}]}
        keyExtractor={item => item.itemId}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: true},
        )}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false} // 스크롤바 표시 안 함
        decelerationRate={'fast'} // 빠른 감속으로 부드러운 스냅 효과
        contentInset={contentInset} // iOS에서만 작동
        contentOffset={contentOffset} // iOS에서 초기 스크롤 위치 조정
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
    marginTop: '30%',
  },
  box: {
    height: 150,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'white',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: 'bold',
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 2,
  },
});

export default Main;
