import React from "react";
import { useNavigation } from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import { Image, TouchableOpacity } from "react-native";

interface BackButtonProps {
  onPress: () => void;
}

type RootStackParamList = {
  PronounceTest: undefined;
  Main: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const BackButton: React.FC<BackButtonProps> = ({onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} style={{width: 40, height: 40}}>
      <Image
        source={require('../../assets/backButton.png')}
        style={{width: 40, height: 40, margin: 2}}
      />
    </TouchableOpacity>
  );
};

const DefaultVocabulary: React.FC = () => {
    return(
        <>
        </>
    )
}

export default DefaultVocabulary;

