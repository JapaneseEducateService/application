import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, View } from 'react-native';
import Main from './src/components/Main';
import Login from './src/components/Login';
import OcrTest from './src/components/OcrTest';
import PronounceTest from './src/components/PronounceTest';
import Register from './src/components/Register';
import Word from './src/components/Word';
import Game from './src/components/Game';
import Community from './src/components/Community';

interface Props {}

const Stack = createStackNavigator();

const App: React.FC<Props> = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerTitleAlign: 'center',
        }}>
        <Stack.Screen
          name="Main"
          component={Main}
          options={({ navigation }) => ({
            headerRight: () => (
              <View style={{ marginRight: 10 }}>
                <Button
                  onPress={() => navigation.navigate('Login')}
                  title="Login"
                  color="blue"
                />
              </View>
            ),
          })}
        />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="OcrTest" component={OcrTest} />
        <Stack.Screen name="PronounceTest" component={PronounceTest} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        <Stack.Screen name="Word" component={Word} />
        <Stack.Screen name="Game" component={Game} />
        <Stack.Screen name="Community" component={Community} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
