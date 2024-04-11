import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface TabItem {
  id: string;
  iconName: string;
  description: string;
}

interface CustomTabBarProps {
  onSelect: (screenName: string) => void; // 선택 시 실행될 콜백 함수
}

const tabs: TabItem[] = [
  {id: 'PronunciationDirectly', iconName: 'brush-outline', description: '직접 발음 평가',},
  {id: 'PronunciationFromVocabulary', iconName: 'book-outline', description: '단어장 발음 평가',},
  {id: 'PronunciationWithExample', iconName: 'newspaper-outline', description: '예문 발음 평가',},
];

const CustomTabBar: React.FC<CustomTabBarProps> = ({ onSelect }) => {
  const selectedTabAnim = useRef(new Animated.Value(0)).current;
  
  const handlePress = (index: number, tabId: string) => {
    Animated.spring(selectedTabAnim, {
      toValue: index * (100 / tabs.length), // 탭의 너비에 따른 위치
      useNativeDriver: false,
    }).start();

    onSelect(tabId);
  };

  return (
    <View style={styles.tabBar}>
      <Animated.View
        style={[
          styles.selectedTab,
          {
            // 애니메이션 효과 적용
            position: 'absolute',
            width: `${100 / tabs.length}%`, // 탭 하나의 너비
            left: selectedTabAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'], // 전체 너비 기준으로 위치 계산
            }),
          },
        ]}
      />
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tabItem}
          onPress={() => handlePress(index, tab.id)}>
          <Icon name={tab.iconName} size={25} color={'black'}/>
          <Text style={styles.descriptionTxt}>{tab.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    marginBottom:10,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'black',
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    width: '95%',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '20%',
    // borderWidth: 1,
  },
  selectedTab: {
    height: '100%',
    width: '100%',
    backgroundColor: '#3EB489',
    borderRadius: 40,
  },
  descriptionTxt: {
    fontSize: 13,
  },
});

export default CustomTabBar;
