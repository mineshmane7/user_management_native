import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {CustomInput, CustomButton, ScreenContainer} from '../components';
import BASE_URL from '../config/api';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login to:', `${BASE_URL}/users`);
      
      // Fetch users from JSON server
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const users = await response.json();
      console.log('Fetched users count:', users.length);

      // Check if user exists with matching credentials
      const user = users.find(
        u => u.email === email && u.password === password,
      );

      if (user) {
        console.log('Login successful for:', user.email);
        // Navigate to dashboard with user data
        navigation.replace('Dashboard', {user});
        setEmail('');
        setPassword('');
      } else {
        console.log('Invalid credentials for email:', email);
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Connection Error', 
        `Cannot connect to server at ${BASE_URL}. Please ensure:\n1. json-server is running on port 3001\n2. Your device/emulator can access the server\n\nError: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

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

        <CustomInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <CustomButton
          title="Login"
          onPress={handleLogin}
          backgroundColor="#007AFF"
          loading={loading}
        />

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 40,
    textAlign: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  registerLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default LoginScreen;
