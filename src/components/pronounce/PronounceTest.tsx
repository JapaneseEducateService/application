import React, {useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import PronunciationDirectly from './PronunciationDirectly';
import PronunciationFromVocabulary from './PronunciationFromVocabulary';
import PronunciationWithExample from './PronunciationWithExample';
import CustomTabBar from '../tabBar/CustomTabBar';
import BackButton from '../button/backButton';

const PronounceTest: React.FC = ({}) => {
  // 현재 선택된 탭의 상태
  const [selectedTab, setSelectedTab] = useState<string>(
    'PronunciationDirectly',
  );

  const handleSelectTab = (screenName: string) => {
    setSelectedTab(screenName); // 선택된 탭을 상태로 설정
  };

  return (
    <>
      <View style={{backgroundColor: '#212A3E', paddingBottom: 20, height: 40}}>
        <BackButton />
      </View>
      <View style={styles.container}>
        {selectedTab === 'PronunciationDirectly' && <PronunciationDirectly />}
        {selectedTab === 'PronunciationFromVocabulary' && (
          <PronunciationFromVocabulary />
        )}
        {selectedTab === 'PronunciationWithExample' && (
          <PronunciationWithExample />
        )}

        <CustomTabBar onSelect={handleSelectTab} />
      </View>
    </>
  );
};

export default PronounceTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
  },
});
