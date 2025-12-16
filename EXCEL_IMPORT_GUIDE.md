# Excel Import Feature Guide

## Overview
The Excel Import feature allows Super Admin users to bulk import multiple users from an Excel (.xlsx), Excel 97-2003 (.xls), or CSV file.

## Requirements
- You must be logged in as a **Super Admin**
- Excel file must have the following columns: **Name**, **Email**, **Password**, **Roles**

## Excel File Format

### Required Columns:
1. **Name** - Full name of the user (e.g., "John Doe")
2. **Email** - Email address (e.g., "john@example.com")
3. **Password** - Initial password for the user (e.g., "john123")
4. **Roles** - User roles (comma-separated for multiple roles)

### Roles Format:
- Single role: `admin` or `user`
- Multiple roles: `admin,user` (comma-separated, no spaces)

### Sample Excel File:
A sample file `sample_users.xlsx` is included in the project root.

| Name            | Email                | Password  | Roles      |
|-----------------|----------------------|-----------|------------|
| John Doe        | john@example.com     | john123   | admin,user |
| Jane Smith      | jane@example.com     | jane123   | user       |
| Mike Johnson    | mike@example.com     | mike123   | admin      |
| Sarah Williams  | sarah@example.com    | sarah123  | admin,user |

## How to Use

### Step 1: Prepare Your Excel File
1. Create or open an Excel file
2. Add the required columns: Name, Email, Password, Roles
3. Fill in the user data
4. Save the file as `.xlsx`, `.xls`, or `.csv`

### Step 2: Transfer File to Device

#### For iOS:
1. Use AirDrop to send the file to your device
2. Or email the file to yourself and open it on the device
3. Or use Files app to access cloud storage (iCloud, Dropbox, etc.)

#### For Android:
1. Transfer file via USB cable to Downloads folder
2. Or email the file to yourself
3. Or use Google Drive/Dropbox

### Step 3: Import Users
1. Login as Super Admin
2. Tap the **"Add User"** button
3. Select **"📊 Import from Excel"**
4. Browse and select your Excel file
5. The app will:
   - Parse the Excel file
   - Validate the format
   - Import all users
   - Show success/error count

### Step 4: Verify Import
- After successful import, you'll see a message: "Successfully imported: X users"
- The user list will refresh automatically
- Check that all users appear in the list with their assigned roles

## Supported File Types
- ✅ **Excel 2007+ (.xlsx)** - Recommended
- ✅ **Excel 97-2003 (.xls)**
- ✅ **CSV (.csv)**

## Features
- ✅ **Bulk Import** - Add multiple users in one operation
- ✅ **Multi-Role Support** - Assign multiple roles to a single user
- ✅ **Validation** - Checks file format before import
- ✅ **Error Handling** - Shows detailed error messages
- ✅ **Progress Reporting** - Displays success/failure count

## Error Messages

### "No data found in the file"
- The Excel file is empty
- Make sure your file has at least one row of data (plus header row)

### "Invalid format"
- Column headers are missing or incorrect
- Required columns: Name, Email, Password, Roles (case-sensitive)

### "Failed to import file"
- File is corrupted or in unsupported format
- Try saving the file in a different format (.xlsx recommended)

## Technical Details

### Libraries Used:
- **react-native-document-picker** (v9.1.1) - File picker
- **xlsx** (latest) - Excel file parser
- **react-native-fs** (latest) - File system access

### Data Processing:
1. File is read as base64
2. XLSX library parses the Excel file
3. Data is converted to JSON format
4. Each row is validated
5. Users are created via POST requests to backend
6. Results are reported back to user

## Troubleshooting

### Import button not appearing?
- Make sure you're logged in as Super Admin
- Check that you have the "superadmin" role

### File picker not opening?
- Grant file access permissions to the app
- Check that the file exists in an accessible location

### Some users failed to import?
- Check that emails are unique (no duplicates)
- Verify role names match existing roles in the system
- Check backend server is running

## Best Practices

1. **Test with small file first** - Import 2-3 users to verify format
2. **Use sample file as template** - Copy sample_users.xlsx and modify
3. **Backup data** - Export current users before bulk import
4. **Verify roles exist** - Create roles before importing users with those roles
5. **Check for duplicates** - Ensure emails are unique

## Sample Data Generation

To create a sample Excel file:
```bash
cd UserManagementApp
node create_sample_excel.js
```

This creates `sample_users.xlsx` with test data.

## API Endpoint
POST `/users` - Creates a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "john123",
  "roles": ["admin", "user"],
  "createdAt": "2025-12-15T10:30:00.000Z"
}
```

## Next Steps
- Test the import feature with sample_users.xlsx
- Create your own user list in Excel
- Import users to your system
- Verify all users have correct roles and permissions
