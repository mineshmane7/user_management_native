# Dynamic Role Management System - User Guide

## Overview
The app now features a fully dynamic role management system where the Super Admin can create, update, and delete roles directly from the app. Property permissions (add, update, delete) are controlled by the role configuration stored in the backend.

## Key Features

### 1. **Backend-Driven Roles**
- All roles and their permissions are stored in the `db.json` file under the `roles` array
- Each role has:
  - `id`: Unique identifier (e.g., "admin", "user", "manager")
  - `name`: Display name (e.g., "Admin", "User", "Manager")
  - `permissions`: Object with three permission flags
    - `addProperty`: Can add new properties
    - `updateProperty`: Can update existing properties
    - `deleteProperty`: Can delete properties

### 2. **Super Admin Role Management Tab**
- Super Admin can switch between two tabs:
  - **User Management**: Manage users (add, edit, delete)
  - **Roles Management**: Manage roles (add, edit, delete)

### 3. **Dynamic Permissions**
- Property management UI adapts based on the user's role permissions
- "Add Property" section only appears if the role has `addProperty` permission
- Edit and Delete buttons on properties only appear if the role has the respective permissions

### 4. **Registration Screen**
- Role picker now dynamically populates from the backend
- Super Admin role is excluded from the registration screen
- Only available roles (admin, user, and any custom roles) are shown

## Usage Guide

### For Super Admin:

#### Managing Roles:
1. **Login** as Super Admin (email: `superadmin@test.com`, password: `super123`)
2. Navigate to the **Roles Management** tab
3. **Add a New Role:**
   - Click "**+ Add Role**"
   - Enter a **Role Name** (e.g., "Manager")
   - Enter a unique **Role ID** (e.g., "manager")
   - Toggle permissions: **Add**, **Update**, **Delete**
   - Click "**Create**"
4. **Edit a Role:**
   - Click "**Edit**" on any role card
   - Update the name and/or permissions
   - Click "**Update**"
5. **Delete a Role:**
   - Click "**Delete**" on any role card (except Super Admin)
   - Confirm the deletion

#### Managing Users:
1. Switch to the **User Management** tab
2. **Add a User:**
   - Click "**+ Add User**"
   - Enter user details and select a role
   - Click "**Create**"
3. **Edit/Delete Users:** Similar to the previous implementation

### For Admin & User:

#### Property Management:
- The property management interface adapts based on your role's permissions
- **Admin** (default permissions):
  - Can add, update, and delete properties
- **User** (default permissions):
  - Can only view properties (no add/update/delete)

## Database Structure

### db.json - Roles Array:
```json
{
  "roles": [
    {
      "id": "superadmin",
      "name": "Super Admin",
      "permissions": {
        "addProperty": true,
        "updateProperty": true,
        "deleteProperty": true
      }
    },
    {
      "id": "admin",
      "name": "Admin",
      "permissions": {
        "addProperty": true,
        "updateProperty": true,
        "deleteProperty": true
      }
    },
    {
      "id": "user",
      "name": "User",
      "permissions": {
        "addProperty": false,
        "updateProperty": false,
        "deleteProperty": false
      }
    }
  ]
}
```

## Example: Creating a "Manager" Role

1. Login as Super Admin
2. Navigate to **Roles Management** tab
3. Click "**+ Add Role**"
4. Enter:
   - **Role Name**: "Manager"
   - **Role ID**: "manager"
   - **Permissions**:
     - Add: ✅ Enabled
     - Update: ✅ Enabled
     - Delete: ❌ Disabled
5. Click "**Create**"
6. Now users assigned the "manager" role can add and update properties, but cannot delete them

## Testing the System

### Test Scenario 1: Create and Test a New Role
1. Login as Super Admin
2. Create a "Manager" role with:
   - Add: ✅
   - Update: ✅
   - Delete: ❌
3. Go to **User Management** tab
4. Create a new user with the "Manager" role
5. Logout and login as the new Manager user
6. Verify:
   - "Add Property" section is visible
   - Edit button appears on properties
   - Delete button does NOT appear on properties

### Test Scenario 2: Update Role Permissions
1. Login as Super Admin
2. Go to **Roles Management** tab
3. Edit the "User" role
4. Enable "Add Property" permission
5. Click "**Update**"
6. Logout and login as a regular user
7. Verify: "Add Property" section now appears

### Test Scenario 3: Delete a Custom Role
1. Login as Super Admin
2. Create a test role (e.g., "Tester")
3. Go back to **Roles Management** tab
4. Click "**Delete**" on the "Tester" role
5. Confirm deletion
6. Verify: Role is removed from the list

## Technical Implementation

### Key Components:

1. **DashboardScreen.js**:
   - Fetches roles from backend on mount
   - Implements `getCurrentRolePermissions()` to check permissions
   - Renders UI based on dynamic permissions
   - Provides role management CRUD operations

2. **RegisterScreen.js**:
   - Fetches roles from backend
   - Dynamically populates role picker (excludes superadmin)

3. **db.json**:
   - Stores roles and permissions
   - Acts as the single source of truth for role configuration

### Permission Check Flow:
```javascript
// Get current user's role permissions
const getCurrentRolePermissions = () => {
  const found = roles.find(r => r.id === user.role);
  return found ? found.permissions : {};
};

// Use in UI
const perms = getCurrentRolePermissions();
if (perms.addProperty) {
  // Show "Add Property" section
}
```

## Benefits of Dynamic Role Management

1. **Flexibility**: Create custom roles without code changes
2. **Scalability**: Easily add new roles as your organization grows
3. **Control**: Fine-grained permission management for each role
4. **Maintainability**: Centralized role configuration in the backend
5. **User Experience**: UI adapts automatically based on permissions

## Future Enhancements

- Add more granular permissions (e.g., view own vs. view all properties)
- Implement role hierarchy (roles inherit permissions from parent roles)
- Add permission for user management (allow certain roles to manage users)
- Implement audit logs for role changes
- Add role templates for quick setup

## Troubleshooting

### Issue: Role picker is empty on registration
- **Solution**: Ensure `json-server` is running and roles are properly configured in `db.json`

### Issue: Property actions not appearing
- **Solution**: Verify the role has the correct permissions in the backend

### Issue: Cannot delete Super Admin role
- **Solution**: This is by design - Super Admin role cannot be deleted to protect system integrity

## Conclusion

The dynamic role management system provides a flexible, scalable solution for managing user permissions. Super Admins can now configure roles and permissions on-the-fly without requiring code changes or app redeployment.
