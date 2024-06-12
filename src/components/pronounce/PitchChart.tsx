import React from 'react';
import {LineChart} from 'react-native-chart-kit';
import {View, Dimensions, Text} from 'react-native';

const formatLabel = (data, index) => {
  return index % 10 === 0 ? data.time.toFixed(2) + 's' : '';
};

const PitchChart = React.memo(({ pitchData, TTSPitchData }) => {
  console.log('전달받은 피치값 : ', pitchData);
  console.log('전달받은 TTS 피치값 : ', TTSPitchData);

  if (!pitchData && !TTSPitchData) {
    return <Text>Data error</Text>;
  }

  // 데이터셋 준비
  const datasets = [];
  if (pitchData && pitchData.length > 0) {
    datasets.push({
      data: pitchData.map(item => item.pitch),
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
      strokeWidth: 2,
    });
  }

  if (TTSPitchData && TTSPitchData.length > 0) {
    datasets.push({
      data: TTSPitchData.map(item => item.pitch),
      color: (opacity = 1) => `rgba(244, 70, 66, ${opacity})`,
      strokeWidth: 2,
    });
  }

  const chartData = {
    labels: (pitchData.length > 0 ? pitchData : TTSPitchData).map((item, index) => formatLabel(item, index)),
    datasets: datasets,
  };

  return (
    <View style={{width: '100%', overflow: 'hidden'}}>
      <LineChart
        data={chartData}
        width={350} // 차트의 너비를 디바이스 너비에 맞춤
        height={200} // 차트의 높이
        chartConfig={{
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 0.5) => `rgba(0, 0, 255, ${opacity})`,
          labelColor: (opacity = 0) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '0',
            strokeWidth: '1',
            stroke: '#ffa726',
          },
        }}
        bezier
        withVerticalLines={false}
        withHorizontalLines={true}
        withDots={false}
      />
    </View>
  );
});

export default PitchChart;
