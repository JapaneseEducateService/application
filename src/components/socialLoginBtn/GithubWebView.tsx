import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const GITHUB_CLIENT_ID = '5fd7aa1f56fa20c6f79c';
const REDIRECT_URI = 'https://socialloginapp-2d87f.firebaseapp.com/__/auth/handler';

const GithubWebView = () => {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user` }}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default GithubWebView;
