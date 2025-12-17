import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  CustomInput,
  CustomButton,
  CustomPicker,
  ScreenContainer,
} from "../../components";
import { useRegister } from "./hooks/useRegister";

const RegisterScreen = ({ navigation }) => {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    loading,
    roleItems,
    handleSubmit,
  } = useRegister();

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Register</Text>

        <CustomInput
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <CustomPicker
          label="Role"
          selectedValue={role}
          onValueChange={setRole}
          items={roleItems}
        />

        <CustomInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <CustomInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <CustomButton
          title="Submit"
          onPress={() => handleSubmit(navigation)}
          loading={loading}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Login here</Text>
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  loginText: {
    fontSize: 16,
    color: "#666",
  },
  loginLink: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default RegisterScreen;
