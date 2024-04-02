import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingBar = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#ff5e5e" />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingBar;
