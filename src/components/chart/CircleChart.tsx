import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg'; // SvgText를 추가로 임포트합니다.

interface Props {
    percent: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText); // Text 컴포넌트도 애니메이션 가능하게 만듭니다.

const CircleChart: React.FC<Props> = ({percent}) => {
  console.log(percent)
  const size = 60; // 원형 차트 크기
  const strokeWidth = 10; // 선 두께
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const animation = useRef(new Animated.Value(0)).current;

  const strokeDashoffset = animation.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  useEffect(() => {
    Animated.timing(animation, {
      toValue: percent, // 몇 %까지 채울지
      duration: 1000, // 애니메이션 시간
      useNativeDriver: true,
    }).start();
  }, [percent, animation]); // animation 대신 percent를 의존성 배열에 추가합니다.

  return (
    <View style={styles.container}> 
      <Svg width={size} height={size}>
        <Circle
          stroke="white"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke="#2E64FE"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
        {/* 여기에 텍스트를 추가합니다 */}
        <SvgText
          fill="black" // 텍스트 색상
          fontSize="15" // 텍스트 크기
          x={size / 2} // 텍스트의 x 좌표 (원의 중심)
          y={size / 2 + 10} // 텍스트의 y 좌표 (원의 중심에서 약간 아래로 조정)
          textAnchor="middle" // 텍스트 정렬을 중앙으로 설정
        >
          {`${percent}점`}
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CircleChart;
