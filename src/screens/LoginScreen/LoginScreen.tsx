import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CustomInput, CustomButton, ScreenContainer } from "../../components";
import { useAuth } from "./hooks/useAuth";
import CustomPasswordInput from "../../components/common/PasswordInput";

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const { email, setEmail, password, setPassword, loading, handleLogin } =
    useAuth();

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>

        <CustomInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomPasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <CustomButton
          title="Login"
          onPress={() => handleLogin(navigation)}
          loading={loading}
        />

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Register here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 40,
    textAlign: "center",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  registerText: {
    fontSize: 16,
    color: "#666",
  },
  registerLink: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default LoginScreen;
