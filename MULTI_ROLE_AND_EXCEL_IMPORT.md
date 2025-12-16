# Multi-Role & Excel Import Implementation

## Overview
This document describes the implementation of multi-role assignment for users and Excel import functionality for bulk user creation. These features are exclusive to the Super Admin role.

## Features Implemented

### 1. Multi-Role Assignment
- Users can now have multiple roles (e.g., a user can be both Admin and User)
- Changed from single `role` string to `roles` array in user data structure
- Permission system updated to grant permission if ANY of the user's roles has that permission

### 2. Excel Import for Bulk User Creation
- Super Admin can import users from Excel/CSV file
- Template format: Name, Email, Password, Roles (comma-separated)
- Sample file created: `sample_users.csv`

### 3. Add User Options
- When clicking "Add User", Super Admin sees two options:
  - **Add Manually**: Opens form to create one user at a time
  - **Import from Excel**: Opens file picker to select Excel/CSV file

## Technical Changes

### Database Schema (db.json)
```json
// OLD FORMAT:
{
  "id": "1",
  "name": "User Name",
  "role": "admin"  // Single role string
}

// NEW FORMAT:
{
  "id": "1",
  "name": "User Name",
  "roles": ["admin", "user"]  // Array of roles
}
```

### Key Functions Updated

#### 1. `getCurrentRolePermissions()`
- Now checks all roles a user has
- Merges permissions: if ANY role grants permission, it's granted
- Backward compatible with old single role format

#### 2. `handleDeleteRole(roleId)`
- Updated to check `roles` array when validating if role can be deleted
- Prevents deletion if any user has this role assigned

#### 3. `addUser()` & `updateUser()`
- Changed from single role to roles array
- Validates at least one role is selected

#### 4. `handleImportExcel()`
- New function for Excel/CSV import
- Validates file format (requires Name, Email, Password, Roles columns)
- Parses roles by splitting comma-separated values
- Creates users in bulk via POST requests

### UI Changes

#### Add/Edit User Modals
```javascript
// OLD: Single role picker
<CustomPicker
  selectedValue={newUserRole}
  onValueChange={setNewUserRole}
  items={roles}
/>

// NEW: Multiple role checkboxes
<ScrollView style={styles.rolesScrollView}>
  {roles.map(role => (
    <TouchableOpacity onPress={() => toggleRoleSelection(role.id)}>
      <CustomCheckbox checked={newUserRoles.includes(role.id)} />
      <Text>{role.name}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>
```

#### User List Display
```javascript
// OLD: Shows single role
<Text>Role: {getRoleDisplayName(item.role)}</Text>

// NEW: Shows all roles
<Text>Roles: {item.roles.map(getRoleDisplayName).join(', ')}</Text>
```

#### Add User Options Modal
- New modal with two buttons:
  1. 📝 Add Manually
  2. 📊 Import from Excel
- Shown when "Add User" button is clicked

## State Variables Added
```javascript
const [newUserRoles, setNewUserRoles] = useState([]);  // Array instead of single role
const [showAddUserOptions, setShowAddUserOptions] = useState(false);  // Show add options modal
```

## Helper Functions Added
```javascript
// Toggle role selection in checkbox list
const toggleRoleSelection = (roleId) => {
  if (newUserRoles.includes(roleId)) {
    setNewUserRoles(newUserRoles.filter(id => id !== roleId));
  } else {
    setNewUserRoles([...newUserRoles, roleId]);
  }
};
```

## Excel Import File Format

### Template (sample_users.csv)
```csv
Name,Email,Password,Roles
John Doe,john@example.com,john123,"admin,user"
Jane Smith,jane@example.com,jane123,user
Mike Admin,mike@example.com,mike123,admin
```

### Important Notes:
- First row must be headers: Name, Email, Password, Roles
- Roles column can contain multiple comma-separated role IDs
- Wrap roles in quotes if multiple: "admin,user"
- All columns are required

## Backward Compatibility
The implementation maintains backward compatibility with the old single role format:

1. **Reading Users**: Code checks for both `roles` array and `role` string
2. **Display**: If old format detected, converts to array for display
3. **Permissions**: Works with both formats when checking permissions
4. **Role Deletion**: Checks both formats when validating role usage

## Packages Installed
```json
{
  "xlsx": "^0.18.5",
  "react-native-document-picker": "^9.3.1",
  "react-native-fs": "^2.20.0"
}
```

## Testing Recommendations

### Test Cases:
1. **Multi-Role Assignment**
   - Create user with multiple roles
   - Verify user gets combined permissions
   - Edit user to add/remove roles

2. **Excel Import**
   - Import sample CSV file
   - Verify users created with correct roles
   - Test error handling for invalid format

3. **Role Deletion**
   - Try to delete role assigned to user with multiple roles
   - Verify restriction popup shows user names

4. **Backward Compatibility**
   - Verify old users (with single role) still work
   - Verify they can be edited to add more roles

5. **Permissions**
   - Create user with Admin + User roles
   - Verify they get Admin permissions (higher privilege wins)

## Known Limitations
1. Excel import uses CSV format internally (XLSX parsing in React Native can be tricky)
2. File picker requires native permissions on Android
3. Large imports (100+ users) may take time due to sequential POST requests

## Future Enhancements
1. Add progress indicator for bulk imports
2. Support XLSX format directly
3. Add import validation preview before creating users
4. Allow import to update existing users by email
5. Export users to Excel
