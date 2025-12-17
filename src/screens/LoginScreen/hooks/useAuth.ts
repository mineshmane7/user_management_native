import { useState } from "react";
import { Alert } from "react-native";
import { apiService } from "../../../api/apiService";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  roles?: string[];
}

interface UseAuthReturn {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  handleLogin: (navigation: any) => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (navigation: any) => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // Fetch users using apiService
      const response = await apiService.get<User[]>("/users");
      const users = response.data;

      console.log("Fetched users count:", users.length);

      // Check if user exists with matching credentials
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        console.log("Login successful for:", user.email);
        
        // Set auth token if needed (you can generate a token or use user ID)
        // apiService.setAuthToken(`Bearer ${user.id}`);
        
        // Navigate to dashboard with user data
        navigation.replace("Dashboard", { user });
        setEmail("");
        setPassword("");
      } else {
        console.log("Invalid credentials for email:", email);
        Alert.alert("Error", "Invalid email or password");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Connection Error",
        `Cannot connect to server. Please ensure:\n1. json-server is running on port 3001\n2. Your device/emulator can access the server\n\nError: ${error.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
  };
};
