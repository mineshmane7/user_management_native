# User Management App - Dashboard & Todo Features

## 🎯 Features Overview

### Role-Based Access Control
- **Admin Role**: Full access to all todo operations + permission management
- **User Role**: View todos and perform actions based on assigned permissions

### Dashboard Features

#### For All Users (Admin & User):
✅ **View Todo List**: See all todos with creator information
✅ **Add New Todo**: Create todos with title and description
✅ **Personal Dashboard**: View welcome message with role badge

#### For Admin Users:
✅ **Edit Any Todo**: Full edit access to all todos
✅ **Delete Any Todo**: Can remove any todo item
✅ **Assign Permissions**: Grant edit/delete permissions to specific users

#### For Regular Users:
✅ **View All Todos**: Can see todos created by all users
✅ **Add New Todos**: Can create their own todos
✅ **Permission-Based Actions**: 
   - Can edit todos if admin grants "Edit" permission
   - Can delete todos if admin grants "Delete" permission

## 🚀 How to Use

### 1. Login as Admin
```
Email: test@gmail.com
Password: test12
Role: admin
```

### 2. Dashboard Operations

#### Adding a Todo:
1. Enter title in "Todo title" field
2. (Optional) Add description
3. Click "Add Todo" button

#### Editing a Todo (Admin/Permitted Users):
1. Click "Edit" button on any todo
2. Modify title/description in modal
3. Click "Save"

#### Deleting a Todo (Admin/Permitted Users):
1. Click "Delete" button on todo
2. Confirm deletion in alert

#### Assigning Permissions (Admin Only):
1. Click "Permissions" button on any todo
2. Select a user from dropdown
3. Check "Can Edit" to allow editing
4. Check "Can Delete" to allow deletion
5. Click "Assign"

### 3. Testing Permission Flow

**As Admin:**
1. Create a todo item
2. Register a new user (or use existing user account)
3. Click "Permissions" on the todo
4. Select the user and grant permissions
5. Logout

**As User:**
1. Login with the user account
2. You'll see all todos
3. Todos with granted permissions will show Edit/Delete buttons
4. Perform allowed actions

## 📊 Data Structure

### User Object
```json
{
  "id": "d8a5",
  "name": "Test",
  "email": "test@gmail.com",
  "password": "test12",
  "role": "admin" // or "user"
}
```

### Todo Object
```json
{
  "id": "1",
  "title": "Complete project",
  "description": "Finish the dashboard implementation",
  "createdBy": "d8a5",
  "createdByName": "Test",
  "createdAt": "2025-12-11T10:30:00.000Z",
  "completed": false,
  "permissions": {
    "user123": {
      "canEdit": true,
      "canDelete": false
    }
  }
}
```

## 🎨 Screen Layout

### Dashboard Components:
1. **Header**
   - Welcome message with user name and role
   - Logout button

2. **Add Todo Section**
   - Title input
   - Description textarea
   - Add button

3. **Todo List**
   - Todo cards with:
     - Title
     - Description
     - Creator name
     - Action buttons (Edit/Delete/Permissions)

4. **Modals**
   - Edit Modal: Edit todo details
   - Permission Modal: Assign user permissions

## 🔄 Navigation Flow

```
Login Screen
    ↓ (successful login)
Dashboard Screen
    ↓ (logout)
Back to Login Screen
```

## 📝 API Endpoints Used

- `GET /users` - Fetch all users (for permission assignment)
- `GET /todos` - Fetch all todos
- `POST /todos` - Create new todo
- `PUT /todos/:id` - Update todo or assign permissions
- `DELETE /todos/:id` - Delete todo

## 🛡️ Permission System

### How Permissions Work:
1. **Admin**: Bypass all permission checks (full access)
2. **User**: Check permissions object for each todo
   - If `permissions[userId].canEdit === true` → Show Edit button
   - If `permissions[userId].canDelete === true` → Show Delete button
   - No permissions → View only

### Permission Structure:
```javascript
permissions: {
  "userId1": { canEdit: true, canDelete: false },
  "userId2": { canEdit: true, canDelete: true }
}
```

## 🎬 Demo Scenario

### Scenario 1: Admin Workflow
1. Login as admin
2. Add 3 todos
3. Register a new user
4. Assign edit permission to user for todo #1
5. Assign edit+delete permission to user for todo #2
6. Logout

### Scenario 2: User Workflow
1. Login as the newly registered user
2. View all 3 todos
3. Todo #1: Can edit only
4. Todo #2: Can edit and delete
5. Todo #3: View only (no buttons)
6. Add your own todo
7. View all todos including yours

## 🔧 Technical Notes

- **State Management**: React hooks (useState, useEffect)
- **Navigation**: React Navigation with replace for logout
- **API**: JSON Server REST API
- **Styling**: React Native StyleSheet
- **Modals**: React Native Modal component
- **Form Controls**: TextInput, Picker, custom checkboxes

## 📱 Screenshots Description

### Dashboard Screen:
- Blue header with user info and logout
- White card for adding new todos
- Scrollable list of todo cards
- Color-coded action buttons:
  - Blue for Edit
  - Red for Delete
  - Orange for Permissions

### Edit Modal:
- Centered modal with overlay
- Input fields for title/description
- Cancel and Save buttons

### Permission Modal:
- User selection dropdown
- Custom checkboxes for permissions
- Cancel and Assign buttons

## 🚨 Important Notes

1. JSON server must be running on port 3000
2. Use `http://10.0.2.2:3000` for Android emulator
3. Logout uses `navigation.replace()` to prevent back navigation
4. Permission changes take effect immediately
5. Admin role has unrestricted access to all features
