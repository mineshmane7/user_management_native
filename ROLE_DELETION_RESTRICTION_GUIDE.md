# Role Deletion Restriction - Testing Guide

## Feature Overview
When attempting to delete a role, the system now checks if any users are assigned to that role. If users exist with that role, deletion is prevented and a restriction popup is shown.

## Implementation Details

### Updated Function: `handleDeleteRole()`
Located in: `src/screens/DashboardScreen.js`

**Logic Flow:**
1. Fetch all users from the backend
2. Filter users who have the role being deleted
3. If users found:
   - Show restriction popup with user names
   - Prevent deletion
4. If no users found:
   - Show confirmation dialog
   - Proceed with deletion

### Restriction Popup Message:
```
"Cannot Delete Role"

"This role is currently assigned to X user(s): [User Names].

Please reassign or remove these users before deleting this role."
```

## Testing Scenarios

### Test Case 1: Delete Role with Assigned Users ❌

**Steps:**
1. Login as Super Admin (`superadmin@test.com` / `super123`)
2. Go to **Roles Management** tab
3. Note: "User" role has 2 users assigned (test11, Test User)
4. Click **Delete** on "User" role
5. **Expected Result:**
   - Popup appears: "Cannot Delete Role"
   - Message shows: "This role is currently assigned to 2 user(s): test11, Test User."
   - Role is NOT deleted

### Test Case 2: Delete Role with No Assigned Users ✅

**Steps:**
1. Login as Super Admin
2. Go to **Roles Management** tab
3. Click **+ Add Role**
4. Create a new role:
   - Name: "Tester"
   - ID: "tester"
   - Permissions: Any
5. Click **Create**
6. Click **Delete** on the newly created "Tester" role
7. **Expected Result:**
   - Confirmation dialog appears: "Are you sure you want to delete this role?"
   - Click **Delete**
   - Role is successfully deleted

### Test Case 3: Reassign Users Then Delete ✅

**Steps:**
1. Login as Super Admin
2. Go to **User Management** tab
3. Edit a user with role "User"
4. Change their role to "Admin"
5. Click **Update**
6. Repeat for all users with "User" role
7. Go to **Roles Management** tab
8. Click **Delete** on "User" role
9. **Expected Result:**
   - Confirmation dialog appears (no restriction)
   - Role can be deleted successfully

### Test Case 4: Check Current User Count

**Current Database State:**
- **Super Admin** role: 1 user (Super Admin) - Protected from deletion
- **Admin** role: 1 user (Admin User)
- **User** role: 2 users (test11, Test User)
- **Test** role: 1 user (test45) - Note: This appears to be a custom role created during testing

## Expected Behavior

### ✅ Roles That Can Be Deleted:
- Custom roles with no users assigned
- Roles where all users have been reassigned to other roles

### ❌ Roles That Cannot Be Deleted:
- "Super Admin" role (protected by design)
- Any role with users currently assigned to it

## Code Implementation

```javascript
const handleDeleteRole = async (roleId) => {
  // Step 1: Fetch all users
  const response = await fetch(`${BASE_URL}/users`);
  const allUsers = await response.json();
  
  // Step 2: Filter users with this role
  const usersWithRole = allUsers.filter(u => u.role === roleId);
  
  // Step 3: Check if users exist
  if (usersWithRole.length > 0) {
    const userNames = usersWithRole.map(u => u.name).join(', ');
    Alert.alert(
      'Cannot Delete Role',
      `This role is currently assigned to ${usersWithRole.length} user(s): ${userNames}.\n\nPlease reassign or remove these users before deleting this role.`,
      [{text: 'OK', style: 'default'}]
    );
    return; // Stop execution
  }
  
  // Step 4: If no users, proceed with deletion confirmation
  Alert.alert('Delete Role', 'Are you sure you want to delete this role?', [
    {text: 'Cancel', style: 'cancel'},
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        // Perform actual deletion
      }
    }
  ]);
};
```

## Benefits

1. **Data Integrity**: Prevents orphaned user records
2. **User Safety**: Protects against accidental deletion of roles in use
3. **Clear Communication**: Shows exactly which users are affected
4. **Easy Resolution**: Tells users what they need to do (reassign/remove users)

## User Workflow

### To Delete a Role in Use:
1. Go to **User Management** tab
2. For each user with the role:
   - Click **Edit**
   - Change role to another option
   - Click **Update**
   - OR click **Delete** to remove the user entirely
3. Return to **Roles Management** tab
4. Click **Delete** on the role
5. Confirm deletion

## Database Verification

You can verify role usage with this query:
```bash
# Count users per role
curl -s http://localhost:3000/users | jq 'group_by(.role) | map({role: .[0].role, count: length})'
```

## Notes

- Super Admin role has additional protection - it cannot be deleted regardless of user count
- The restriction check happens before the confirmation dialog
- User names are displayed to help identify who needs to be reassigned
- The feature works seamlessly with the existing CRUD operations

## Testing Completed ✅

- [x] Delete role with assigned users (shows restriction)
- [x] Delete role with no assigned users (allows deletion)
- [x] Super Admin role protection maintained
- [x] User count displayed correctly in popup
- [x] User names listed in popup
- [x] App runs successfully on Android
