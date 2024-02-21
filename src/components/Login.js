import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = () => {
    // 간단한 로그인 체크
    if (username === "user" && password === "password") {
      Alert.alert("로그인 성공", "환영합니다!");
    } else {
      Alert.alert("로그인 실패", "아이디 또는 비밀번호가 잘못되었습니다.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>로그인</Text>

      <TextInput
        style={{ height: 40, borderColor: "gray", borderWidth: 1, marginBottom: 10, padding: 10 }}
        placeholder="아이디"
        value={username}
        onChangeText={(text) => setUsername(text)}
      />

      <TextInput
        style={{ height: 40, borderColor: "gray", borderWidth: 1, marginBottom: 20, padding: 10 }}
        placeholder="비밀번호"
        secureTextEntry={true}
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      <TouchableOpacity
        style={{ backgroundColor: "blue", padding: 10, alignItems: "center" }}
        onPress={onLogin}
      >
        <Text style={{ color: "white", fontSize: 16 }}>로그인</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;
