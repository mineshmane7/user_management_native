import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import {
  CustomInput,
  CustomButton,
  CustomPicker,
  ScreenContainer,
} from "../components";
import BASE_URL from "../api/api";

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${BASE_URL}/roles`);
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const roleItems = roles
    .filter((r) => r.id !== "superadmin")
    .map((r) => ({ label: r.name, value: r.id }));

  const handleSubmit = async () => {
    // Validation
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Password validation
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    const userData = {
      name,
      email,
      password,
      role,
    };

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        Alert.alert("Success", "Registration successful!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]);
        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setRole("user");
      } else {
        Alert.alert("Error", "Failed to register. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to server. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
          onPress={handleSubmit}
          backgroundColor="#34C759"
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
