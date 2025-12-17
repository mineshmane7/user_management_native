import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { apiService } from "../../../api/apiService";

interface Role {
  id: string;
  name: string;
  permissions: any;
}

interface RoleItem {
  label: string;
  value: string;
}

interface UseRegisterReturn {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  role: string;
  setRole: (role: string) => void;
  loading: boolean;
  roleItems: RoleItem[];
  handleSubmit: (navigation: any) => Promise<void>;
}

export const useRegister = (): UseRegisterReturn => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await apiService.get<Role[]>("/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const roleItems: RoleItem[] = roles
    .filter((r: Role) => r.id !== "superadmin")
    .map((r: Role) => ({ label: r.name, value: r.id }));

  const handleSubmit = async (navigation: any) => {
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
      const response = await apiService.post("/users", userData);

      if (response.status === 201 || response.status === 200) {
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

  return {
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
  };
};
