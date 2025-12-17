import {Platform} from 'react-native';

// For Android emulator, use 10.0.2.2 to access localhost
// For iOS simulator, use localhost directly
const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3001' 
  : 'http://localhost:3001';

export default BASE_URL;
