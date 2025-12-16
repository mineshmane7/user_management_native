# User Management App - Setup Instructions

## Features
- Login Screen with email and password
- Register Screen with name, email, password, and role (Admin/User) dropdown
- Navigation between Login and Register screens
- Data persistence using JSON Server

## Setup

### 1. Start JSON Server
Open a new terminal and run:
```bash
cd UserManagementApp
npx json-server --watch db.json --port 3000
```

The JSON server will run on `http://localhost:3000`

### 2. Run the App on Android

#### Make sure you have:
- Android Studio installed
- An Android emulator running OR a physical device connected
- Android SDK configured

#### Run the app:
```bash
cd UserManagementApp
npx react-native run-android
```

## Usage

### Register a New User
1. Open the app
2. Tap on "Register here" link
3. Fill in:
   - Name
   - Select Role (Admin or User) from dropdown
   - Email
   - Password (minimum 6 characters)
4. Tap "Submit"
5. On success, you'll be navigated to Login screen

### Login
1. Enter your registered email and password
2. Tap "Login"
3. On success, you'll see a welcome message

## API Endpoints

The JSON server provides the following endpoints:

- `GET /users` - Get all users
- `POST /users` - Create a new user
- `GET /users/:id` - Get a specific user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

## Project Structure
```
UserManagementApp/
├── src/
│   └── screens/
│       ├── LoginScreen.js
│       └── RegisterScreen.js
├── db.json (JSON Server database)
├── App.tsx (Main app with navigation)
└── package.json
```

## Notes
- Make sure JSON server is running before testing the app
- For Android emulator, use `http://10.0.2.2:3000` instead of `localhost:3000`
- For physical device on same network, use your computer's IP address
