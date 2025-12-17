# Quick API Service Reference

## Import
```typescript
import { apiService } from '../api/apiService';
```

## Basic Usage

### GET Request
```typescript
const response = await apiService.get<User[]>('/users');
const users = response.data;
```

### POST Request
```typescript
const response = await apiService.post('/users', {
  name: 'John',
  email: 'john@example.com'
});
const newUser = response.data;
```

### PUT Request
```typescript
const response = await apiService.put(`/users/${id}`, {
  name: 'John Updated'
});
const updatedUser = response.data;
```

### DELETE Request
```typescript
const response = await apiService.delete(`/users/${id}`);
// Check response.status for success
```

## With Query Parameters
```typescript
const response = await apiService.get('/users', {
  params: { role: 'admin', active: true }
});
// Calls: /users?role=admin&active=true
```

## Token Management
```typescript
// Set token after login
apiService.setAuthToken('your-jwt-token');

// Clear token on logout
apiService.clearAuthToken();
```

## Error Handling
```typescript
try {
  const response = await apiService.get('/users');
  // Handle success
} catch (error: any) {
  console.error('API Error:', error.message);
  Alert.alert('Error', error.message || 'Something went wrong');
}
```

## Status Code Checks
```typescript
const response = await apiService.post('/users', userData);

if (response.status === 200 || response.status === 201) {
  Alert.alert('Success', 'User created!');
} else {
  Alert.alert('Error', 'Failed to create user');
}
```

## TypeScript Types
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

// Use generic type for type safety
const response = await apiService.get<User[]>('/users');
// response.data is now typed as User[]
```

## All Available Methods
- `apiService.get<T>(url, config?)`
- `apiService.post<T>(url, data, config?)`
- `apiService.put<T>(url, data, config?)`
- `apiService.patch<T>(url, data, config?)`
- `apiService.delete<T>(url, config?)`
- `apiService.request<T>(config)` - For custom requests

## Response Structure
```typescript
{
  data: T,           // Response data
  status: number,    // HTTP status code
  statusText: string, // Status message
  headers: any,      // Response headers
  config: any,       // Request config
  request?: any      // Original request
}
```

## Logging
All requests and responses are automatically logged with:
- Timestamp
- HTTP Method
- URL
- Request/Response data
- Status codes

Check your console for colored logs! 🎨
