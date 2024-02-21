import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Main from './src/components/Main';
import Login from './src/components/Login';
import OcrTest from './src/components/OcrTest';
import PronounceTest from './src/components/PronounceTest';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Main"
        screenOptions={{
          headerTitleAlign: 'center',
        }}
        >
          
        <Stack.Screen 
          name="Main"
          component={Main}
          options={{ headerShown: false }}
          />

        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="OcrTest" component={OcrTest} />
        <Stack.Screen name="PronounceTest" component={PronounceTest} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
