import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import DocumentPicker from "react-native-document-picker";
import RNFS from "react-native-fs";
import BASE_URL from "../api/api";
import { CustomPicker, CustomCheckbox } from "../components";
import CarbonIcon from "../components/common/CarbonIcon";
import Add24 from "@carbon/icons/es/add/24";
import Edit24 from "@carbon/icons/es/edit/24";
import Trash24 from "@carbon/icons/es/trash-can/24";
import { Button } from "@carbon/react-native";

const DashboardScreen = ({ route, navigation }) => {
  const { user } = route.params;

  // Roles management (Super Admin)
  const [roles, setRoles] = useState([]);
  const [rolesTab, setRolesTab] = useState(false); // false: User Mgmt, true: Roles Mgmt
  const [addRoleModalVisible, setAddRoleModalVisible] = useState(false);
  const [editRoleModalVisible, setEditRoleModalVisible] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleId, setNewRoleId] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState({
    addProperty: false,
    updateProperty: false,
    deleteProperty: false,
  });
  const [selectedRole, setSelectedRole] = useState(null);

  // Properties - for Admin and User
  const [properties, setProperties] = useState([]);
  const [newPropertyTitle, setNewPropertyTitle] = useState("");
  const [newPropertyDescription, setNewPropertyDescription] = useState("");
  const [editPropertyModalVisible, setEditPropertyModalVisible] =
    useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editPropertyTitle, setEditPropertyTitle] = useState("");
  const [editPropertyDescription, setEditPropertyDescription] = useState("");
  const [propertySearchQuery, setPropertySearchQuery] = useState("");

  // Users management - for Super Admin
  const [users, setUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [editUserModalVisible, setEditUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRoles, setNewUserRoles] = useState(["user"]); // Changed to array for multiple roles
  const [showAddUserOptions, setShowAddUserOptions] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [csvData, setCsvData] = useState("");

  // Helper function to check if user is superadmin
  const isSuperAdmin = () => {
    if (Array.isArray(user.roles)) {
      return user.roles.includes("superadmin");
    }
    return user.role === "superadmin";
  };

  useEffect(() => {
    if (isSuperAdmin()) {
      fetchUsers();
      fetchRoles();
    } else {
      fetchProperties();
      fetchRoles();
    }
  }, []);

  // Fetch roles from backend
  const fetchRoles = async () => {
    try {
      const response = await fetch(`${BASE_URL}/roles`);
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch roles");
      console.error(error);
    }
  };

  // ============= SUPER ADMIN FUNCTIONS =============
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users`);
      const data = await response.json();
      const filteredUsers = data.filter((u) => u.role !== "superadmin");
      setUsers(filteredUsers);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch users");
      console.error(error);
    }
  };

  const openAddUserModal = () => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRoles(["user"]);
    setAddUserModalVisible(true);
    setShowAddUserOptions(false);
  };

  const toggleRoleSelection = (roleId) => {
    if (newUserRoles.includes(roleId)) {
      // Remove role if already selected
      setNewUserRoles(newUserRoles.filter((r) => r !== roleId));
    } else {
      // Add role if not selected
      setNewUserRoles([...newUserRoles, roleId]);
    }
  };

  const handleImportExcel = () => {
    setImportModalVisible(true);
    setShowAddUserOptions(false);
  };

  const handleImportFromFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.csv, DocumentPicker.types.plainText],
        copyTo: "cachesDirectory",
      });

      if (result && result[0]) {
        const file = result[0];
        const fileUri = file.fileCopyUri || file.uri;

        console.log("Selected file:", file);
        console.log("File URI:", fileUri);

        // Read file content using RNFS
        let fileContent;
        try {
          // Remove file:// prefix if present
          let filePath = fileUri;
          if (filePath.startsWith("file://")) {
            filePath = filePath.replace("file://", "");
          }

          console.log("Reading file from path:", filePath);
          fileContent = await RNFS.readFile(filePath, "utf8");
          console.log(
            "File content length:",
            fileContent ? fileContent.length : 0
          );
        } catch (readError) {
          console.log("RNFS read failed:", readError);
          console.log("Trying fetch as fallback");
          // Fallback to fetch for Android
          try {
            const response = await fetch(fileUri);
            fileContent = await response.text();
            console.log(
              "Fetch succeeded, content length:",
              fileContent ? fileContent.length : 0
            );
          } catch (fetchError) {
            console.error("Fetch also failed:", fetchError);
            throw new Error("Failed to read file with both RNFS and fetch");
          }
        }

        if (fileContent && fileContent.trim()) {
          console.log("Processing CSV data");
          // Process CSV directly
          await processCSVData(fileContent);
        } else {
          Alert.alert("Error", "Failed to read file content or file is empty");
        }
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
        console.log("User cancelled file picker");
      } else {
        Alert.alert(
          "Error",
          "Failed to pick file: " + (err?.message || String(err))
        );
        console.error("File picker error:", err);
      }
    }
  };

  const processCSVData = async (csvContent) => {
    try {
      const lines = csvContent.trim().split("\n");
      const usersToImport = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split by comma, handling quoted values
        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];

        if (values.length >= 4) {
          const rolesString = values[3].replace(/"/g, "");
          const rolesArray = rolesString
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r);

          usersToImport.push({
            name: values[0].replace(/"/g, ""),
            email: values[1].replace(/"/g, ""),
            password: values[2].replace(/"/g, ""),
            roles: rolesArray,
            createdAt: new Date().toISOString(),
          });
        }
      }

      if (usersToImport.length === 0) {
        Alert.alert("Error", "No valid users found in CSV file");
        return;
      }

      // Import users
      let successCount = 0;
      let errorCount = 0;

      for (const userToImport of usersToImport) {
        try {
          const response = await fetch(`${BASE_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userToImport),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      Alert.alert(
        "Import Complete",
        `Successfully imported: ${successCount}\nFailed: ${errorCount}`,
        [
          {
            text: "OK",
            onPress: () => {
              fetchUsers();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to process CSV: " + error.message);
    }
  };

  const processCSVImport = async () => {
    if (!csvData.trim()) {
      Alert.alert("Error", "Please paste CSV data");
      return;
    }

    try {
      const lines = csvData.trim().split("\n");

      if (lines.length < 2) {
        Alert.alert(
          "Error",
          "CSV must have at least a header row and one data row"
        );
        return;
      }

      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));

      // Validate headers
      if (
        headers[0] !== "Name" ||
        headers[1] !== "Email" ||
        headers[2] !== "Password" ||
        headers[3] !== "Roles"
      ) {
        Alert.alert(
          "Invalid Format",
          'CSV must have columns: Name, Email, Password, Roles\n\nExample:\nName,Email,Password,Roles\nJohn Doe,john@example.com,john123,"admin,user"'
        );
        return;
      }

      const usersToImport = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quoted values
        const values = [];
        let currentValue = "";
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = "";
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim());

        if (values.length >= 4) {
          const rolesString = values[3].replace(/"/g, "");
          const rolesArray = rolesString
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r);

          usersToImport.push({
            name: values[0].replace(/"/g, ""),
            email: values[1].replace(/"/g, ""),
            password: values[2].replace(/"/g, ""),
            roles: rolesArray,
            createdAt: new Date().toISOString(),
          });
        }
      }

      if (usersToImport.length === 0) {
        Alert.alert("Error", "No valid users found in CSV data");
        return;
      }

      // Import users
      let successCount = 0;
      let errorCount = 0;

      for (const userToImport of usersToImport) {
        try {
          const response = await fetch(`${BASE_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userToImport),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      Alert.alert(
        "Import Complete",
        `Successfully imported: ${successCount}\nFailed: ${errorCount}`,
        [
          {
            text: "OK",
            onPress: () => {
              setImportModalVisible(false);
              setCsvData("");
              fetchUsers();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to process CSV data: " + error.message);
    }
  };

  const addUser = async () => {
    if (
      !newUserName.trim() ||
      !newUserEmail.trim() ||
      !newUserPassword.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newUserRoles.length === 0) {
      Alert.alert("Error", "Please select at least one role");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (newUserPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    const newUser = {
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      roles: newUserRoles,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        Alert.alert("Success", "User created successfully!");
        setAddUserModalVisible(false);
        fetchUsers();
      } else {
        Alert.alert("Error", "Failed to create user");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create user");
      console.error(error);
    }
  };

  const openEditUserModal = (userItem) => {
    setSelectedUser(userItem);
    setNewUserName(userItem.name);
    setNewUserEmail(userItem.email);
    setNewUserPassword(userItem.password);
    // Support both old single role and new multiple roles format
    if (Array.isArray(userItem.roles)) {
      setNewUserRoles(userItem.roles);
    } else if (userItem.role) {
      setNewUserRoles([userItem.role]);
    } else {
      setNewUserRoles([]);
    }
    setEditUserModalVisible(true);
  };

  const updateUser = async () => {
    if (
      !newUserName.trim() ||
      !newUserEmail.trim() ||
      !newUserPassword.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newUserRoles.length === 0) {
      Alert.alert("Error", "Please select at least one role");
      return;
    }

    const updatedUser = {
      ...selectedUser,
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      roles: newUserRoles,
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${BASE_URL}/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        Alert.alert("Success", "User updated successfully!");
        setEditUserModalVisible(false);
        fetchUsers();
      } else {
        Alert.alert("Error", "Failed to update user");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update user");
      console.error(error);
    }
  };

  const deleteUser = async (userId) => {
    Alert.alert("Delete User", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${BASE_URL}/users/${userId}`, {
              method: "DELETE",
            });

            if (response.ok) {
              Alert.alert("Success", "User deleted successfully!");
              fetchUsers();
            } else {
              Alert.alert("Error", "Failed to delete user");
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete user");
            console.error(error);
          }
        },
      },
    ]);
  };

  // ============= ROLE MANAGEMENT FUNCTIONS =============
  const handleAddRole = async () => {
    if (!newRoleName.trim() || !newRoleId.trim()) {
      Alert.alert("Error", "Please enter role name and ID");
      return;
    }
    if (roles.some((r) => r.id === newRoleId)) {
      Alert.alert("Error", "Role ID must be unique");
      return;
    }
    const newRole = {
      id: newRoleId,
      name: newRoleName,
      permissions: newRolePermissions,
    };
    try {
      const response = await fetch(`${BASE_URL}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRole),
      });
      if (response.ok) {
        Alert.alert("Success", "Role created successfully!");
        setAddRoleModalVisible(false);
        fetchRoles();
      } else {
        Alert.alert("Error", "Failed to create role");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create role");
      console.error(error);
    }
  };

  const handleEditRole = async () => {
    if (!newRoleName.trim() || !newRoleId.trim()) {
      Alert.alert("Error", "Please enter role name and ID");
      return;
    }
    const updatedRole = {
      ...selectedRole,
      id: newRoleId,
      name: newRoleName,
      permissions: newRolePermissions,
    };
    try {
      const response = await fetch(`${BASE_URL}/roles/${selectedRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRole),
      });
      if (response.ok) {
        Alert.alert("Success", "Role updated successfully!");
        setEditRoleModalVisible(false);
        fetchRoles();
      } else {
        Alert.alert("Error", "Failed to update role");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update role");
      console.error(error);
    }
  };

  const handleDeleteRole = async (roleId) => {
    // First, check if any users are assigned to this role
    try {
      const response = await fetch(`${BASE_URL}/users`);
      const allUsers = await response.json();

      // Check both old single role format and new multiple roles format
      const usersWithRole = allUsers.filter((u) => {
        if (Array.isArray(u.roles)) {
          return u.roles.includes(roleId);
        }
        return u.role === roleId;
      });

      if (usersWithRole.length > 0) {
        const userNames = usersWithRole.map((u) => u.name).join(", ");
        Alert.alert(
          "Cannot Delete Role",
          `This role is currently assigned to ${usersWithRole.length} user(s): ${userNames}.\n\nPlease reassign or remove these users before deleting this role.`,
          [{ text: "OK", style: "default" }]
        );
        return;
      }

      // If no users found, proceed with deletion
      Alert.alert("Delete Role", "Are you sure you want to delete this role?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const deleteResponse = await fetch(
                `${BASE_URL}/roles/${roleId}`,
                {
                  method: "DELETE",
                }
              );
              if (deleteResponse.ok) {
                Alert.alert("Success", "Role deleted successfully!");
                fetchRoles();
              } else {
                Alert.alert("Error", "Failed to delete role");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete role");
              console.error(error);
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to check role usage");
      console.error(error);
    }
  };

  // ============= ADMIN & USER FUNCTIONS (Properties) =============
  const fetchProperties = async () => {
    try {
      const response = await fetch(`${BASE_URL}/properties`);
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch properties");
      console.error(error);
    }
  };

  const addProperty = async () => {
    if (!newPropertyTitle.trim()) {
      Alert.alert("Error", "Please enter a property title");
      return;
    }

    const newProperty = {
      title: newPropertyTitle,
      description: newPropertyDescription,
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${BASE_URL}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProperty),
      });

      if (response.ok) {
        Alert.alert("Success", "Property added successfully!");
        setNewPropertyTitle("");
        setNewPropertyDescription("");
        fetchProperties();
      } else {
        Alert.alert("Error", "Failed to add property");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add property");
      console.error(error);
    }
  };

  const openEditPropertyModal = (property) => {
    setSelectedProperty(property);
    setEditPropertyTitle(property.title);
    setEditPropertyDescription(property.description || "");
    setEditPropertyModalVisible(true);
  };

  const updateProperty = async () => {
    if (!editPropertyTitle.trim()) {
      Alert.alert("Error", "Please enter a property title");
      return;
    }

    const updatedProperty = {
      ...selectedProperty,
      title: editPropertyTitle,
      description: editPropertyDescription,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
    };

    try {
      const response = await fetch(
        `${BASE_URL}/properties/${selectedProperty.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProperty),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Property updated successfully!");
        setEditPropertyModalVisible(false);
        fetchProperties();
      } else {
        Alert.alert("Error", "Failed to update property");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update property");
      console.error(error);
    }
  };

  const deleteProperty = async (propertyId) => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${BASE_URL}/properties/${propertyId}`,
                {
                  method: "DELETE",
                }
              );

              if (response.ok) {
                Alert.alert("Success", "Property deleted successfully!");
                fetchProperties();
              } else {
                Alert.alert("Error", "Failed to delete property");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete property");
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: () => navigation.replace("Login"),
      },
    ]);
  };

  // ============= RENDER FUNCTIONS =============
  const getRoleDisplayName = (roleId) => {
    const found = roles.find((r) => r.id === roleId);
    return found ? found.name : roleId;
  };

  const getCurrentRolePermissions = () => {
    // Support both old single role and new multiple roles format
    let userRoles = [];
    if (Array.isArray(user.roles)) {
      userRoles = user.roles;
    } else if (user.role) {
      userRoles = [user.role];
    }

    // Merge permissions from all roles (if ANY role has permission, grant it)
    const mergedPermissions = {
      addProperty: false,
      updateProperty: false,
      deleteProperty: false,
    };

    userRoles.forEach((roleId) => {
      const roleData = roles.find((r) => r.id === roleId);
      if (roleData && roleData.permissions) {
        if (roleData.permissions.addProperty)
          mergedPermissions.addProperty = true;
        if (roleData.permissions.updateProperty)
          mergedPermissions.updateProperty = true;
        if (roleData.permissions.deleteProperty)
          mergedPermissions.deleteProperty = true;
      }
    });

    return mergedPermissions;
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredProperties = properties.filter((p) =>
    p.title.toLowerCase().includes(propertySearchQuery.toLowerCase())
  );

  const renderUserItem = ({ item }) => {
    // Support both old single role and new multiple roles format
    let rolesDisplay = "";
    if (Array.isArray(item.roles)) {
      rolesDisplay = item.roles
        .map((roleId) => getRoleDisplayName(roleId))
        .join(", ");
    } else if (item.role) {
      rolesDisplay = getRoleDisplayName(item.role);
    } else {
      rolesDisplay = "No role assigned";
    }

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{item.email}</Text>
          <Text style={styles.itemMeta}>Roles: {rolesDisplay}</Text>
        </View>
        <View style={styles.itemActions}>
          <Button
            size="small"
            onPress={() => openEditUserModal(item)}
            style={styles.actionButton}
          >
            <CarbonIcon
              icon={Edit24}
              size={14}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            Edit
          </Button>
          <Button
            size="small"
            kind="danger"
            onPress={() => deleteUser(item.id)}
            style={styles.actionButton}
          >
            <CarbonIcon
              icon={Trash24}
              size={14}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            Delete
          </Button>
        </View>
      </View>
    );
  };

  const renderPropertyItem = ({ item }) => {
    const perms = getCurrentRolePermissions();
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.itemDescription}>{item.description}</Text>
          ) : null}
          <Text style={styles.itemMeta}>
            Created by: {item.createdByName || "Unknown"}
          </Text>
        </View>
        {(perms.updateProperty || perms.deleteProperty) && (
          <View style={styles.itemActions}>
            {perms.updateProperty && (
              <Button
                size="small"
                onPress={() => openEditPropertyModal(item)}
                style={[styles.actionButton, styles.editButton]}
              >
                <CarbonIcon
                  icon={Edit24}
                  size={14}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                Edit
              </Button>
            )}
            {perms.deleteProperty && (
              <Button
                size="small"
                kind="danger"
                onPress={() => deleteProperty(item.id)}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <CarbonIcon
                  icon={Trash24}
                  size={14}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                Delete
              </Button>
            )}
          </View>
        )}
      </View>
    );
  };

  // ============= MAIN RENDER =============
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Welcome, {user.name} ({getRoleDisplayName(user.role)})
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* SUPER ADMIN VIEW - Tabs: User Management / Roles Management */}
        {isSuperAdmin() && (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 10,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: !rolesTab ? "#34C759" : "#ddd",
                    marginRight: 10,
                  },
                ]}
                onPress={() => setRolesTab(false)}
              >
                <Text style={{ color: !rolesTab ? "#fff" : "#333" }}>
                  User Management
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  { backgroundColor: rolesTab ? "#34C759" : "#ddd" },
                ]}
                onPress={() => setRolesTab(true)}
              >
                <Text style={{ color: rolesTab ? "#fff" : "#333" }}>
                  Roles Management
                </Text>
              </TouchableOpacity>
            </View>

            {!rolesTab ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>User Management</Text>
                  <Button
                    size="small"
                    onPress={() => setShowAddUserOptions(true)}
                    style={styles.addButton}
                  >
                    <CarbonIcon
                      icon={Add24}
                      size={16}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    + Add User
                  </Button>
                </View>

                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by username..."
                  value={userSearchQuery}
                  onChangeText={setUserSearchQuery}
                />

                <FlatList
                  data={filteredUsers}
                  keyExtractor={(item) => item.id?.toString()}
                  renderItem={renderUserItem}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No users found</Text>
                  }
                />
              </View>
            ) : (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Roles Management</Text>
                  <Button
                    size="small"
                    onPress={() => {
                      setNewRoleName("");
                      setNewRoleId("");
                      setNewRolePermissions({
                        addProperty: false,
                        updateProperty: false,
                        deleteProperty: false,
                      });
                      setAddRoleModalVisible(true);
                    }}
                    style={styles.addButton}
                  >
                    <CarbonIcon
                      icon={Add24}
                      size={16}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    + Add Role
                  </Button>
                </View>
                <FlatList
                  data={roles}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View style={styles.itemCard}>
                      <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>{item.name}</Text>
                        <Text style={styles.itemMeta}>ID: {item.id}</Text>
                        <Text style={styles.itemMeta}>
                          Permissions:{" "}
                          {Object.entries(item.permissions)
                            .map(([k, v]) => (v ? k : null))
                            .filter(Boolean)
                            .join(", ") || "None"}
                        </Text>
                      </View>
                      <View style={styles.itemActions}>
                        <Button
                          size="small"
                          onPress={() => {
                            setSelectedRole(item);
                            setNewRoleName(item.name);
                            setNewRoleId(item.id);
                            setNewRolePermissions(item.permissions);
                            setEditRoleModalVisible(true);
                          }}
                          style={styles.actionButton}
                        >
                          <CarbonIcon
                            icon={Edit24}
                            size={14}
                            color="#fff"
                            style={{ marginRight: 8 }}
                          />
                          Edit
                        </Button>
                        {item.id !== "superadmin" && (
                          <Button
                            size="small"
                            kind="danger"
                            onPress={() => handleDeleteRole(item.id)}
                            style={styles.actionButton}
                          >
                            <CarbonIcon
                              icon={Trash24}
                              size={14}
                              color="#fff"
                              style={{ marginRight: 8 }}
                            />
                            Delete
                          </Button>
                        )}
                      </View>
                    </View>
                  )}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No roles found</Text>
                  }
                />
              </View>
            )}
          </>
        )}

        {/* PROPERTY MANAGEMENT (Dynamic Permissions) */}
        {!isSuperAdmin() && (
          <>
            {getCurrentRolePermissions().addProperty && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Add New Property</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Property title"
                  value={newPropertyTitle}
                  onChangeText={setNewPropertyTitle}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description (optional)"
                  value={newPropertyDescription}
                  onChangeText={setNewPropertyDescription}
                  multiline
                  numberOfLines={3}
                />
                <Button
                  size="small"
                  onPress={addProperty}
                  style={styles.submitButton}
                >
                  <CarbonIcon
                    icon={Add24}
                    size={16}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  Add Property
                </Button>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Properties ({properties.length})
              </Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by title..."
                value={propertySearchQuery}
                onChangeText={setPropertySearchQuery}
              />

              <FlatList
                data={filteredProperties}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderPropertyItem}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No properties available</Text>
                }
              />
            </View>
          </>
        )}
      </ScrollView>

      {/* Add User Options Modal (Super Admin) */}
      <Modal
        visible={showAddUserOptions}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAddUserOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add User</Text>
            <Text style={styles.optionsText}>
              Choose how you want to add users:
            </Text>
            <TouchableOpacity
              style={[styles.optionButton, styles.manualButton]}
              onPress={() => {
                setShowAddUserOptions(false);
                openAddUserModal();
              }}
            >
              <Text style={styles.optionButtonText}>📝 Add Manually</Text>
              <Text style={styles.optionButtonSubtext}>
                Create one user at a time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, styles.importButton]}
              onPress={() => {
                setShowAddUserOptions(false);
                handleImportFromFile();
              }}
            >
              <Text style={styles.optionButtonText}>� Import from Excel</Text>
              <Text style={styles.optionButtonSubtext}>
                Bulk import multiple users
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.cancelButton,
                { marginTop: 20 },
              ]}
              onPress={() => setShowAddUserOptions(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add User Modal (Super Admin) */}
      <Modal
        visible={addUserModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddUserModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New User</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newUserName}
              onChangeText={setNewUserName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newUserEmail}
              onChangeText={setNewUserEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={newUserPassword}
              onChangeText={setNewUserPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={styles.rolesContainer}>
              <Text style={styles.pickerLabel}>
                Roles (select one or more):
              </Text>
              <ScrollView style={styles.rolesScrollView}>
                {roles
                  .filter((r) => r.id !== "superadmin")
                  .map((role) => (
                    <TouchableOpacity
                      key={role.id}
                      style={styles.roleCheckboxContainer}
                      onPress={() => toggleRoleSelection(role.id)}
                    >
                      <CustomCheckbox
                        checked={newUserRoles.includes(role.id)}
                        onPress={() => toggleRoleSelection(role.id)}
                      />
                      <Text style={styles.roleCheckboxLabel}>{role.name}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddUserModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addUser}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal (Super Admin) */}
      <Modal
        visible={editUserModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditUserModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newUserName}
              onChangeText={setNewUserName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={newUserEmail}
              onChangeText={setNewUserEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={newUserPassword}
              onChangeText={setNewUserPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={styles.rolesContainer}>
              <Text style={styles.pickerLabel}>
                Roles (select one or more):
              </Text>
              <ScrollView style={styles.rolesScrollView}>
                {roles
                  .filter((r) => r.id !== "superadmin")
                  .map((role) => (
                    <TouchableOpacity
                      key={role.id}
                      style={styles.roleCheckboxContainer}
                      onPress={() => toggleRoleSelection(role.id)}
                    >
                      <CustomCheckbox
                        checked={newUserRoles.includes(role.id)}
                        onPress={() => toggleRoleSelection(role.id)}
                      />
                      <Text style={styles.roleCheckboxLabel}>{role.name}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditUserModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateUser}
              >
                <Text style={styles.modalButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Role Modal (Super Admin) */}
      <Modal
        visible={addRoleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddRoleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Role</Text>
            <TextInput
              style={styles.input}
              placeholder="Role Name"
              value={newRoleName}
              onChangeText={setNewRoleName}
            />
            <TextInput
              style={styles.input}
              placeholder="Role ID (unique, e.g. 'manager')"
              value={newRoleId}
              onChangeText={setNewRoleId}
              autoCapitalize="none"
            />
            <Text style={{ fontWeight: "600", marginBottom: 5 }}>
              Permissions:
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: newRolePermissions.addProperty
                      ? "#34C759"
                      : "#ddd",
                    marginRight: 5,
                  },
                ]}
                onPress={() =>
                  setNewRolePermissions((p) => ({
                    ...p,
                    addProperty: !p.addProperty,
                  }))
                }
              >
                <Text
                  style={{
                    color: newRolePermissions.addProperty ? "#fff" : "#333",
                  }}
                >
                  Add
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: newRolePermissions.updateProperty
                      ? "#34C759"
                      : "#ddd",
                    marginRight: 5,
                  },
                ]}
                onPress={() =>
                  setNewRolePermissions((p) => ({
                    ...p,
                    updateProperty: !p.updateProperty,
                  }))
                }
              >
                <Text
                  style={{
                    color: newRolePermissions.updateProperty ? "#fff" : "#333",
                  }}
                >
                  Update
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: newRolePermissions.deleteProperty
                      ? "#34C759"
                      : "#ddd",
                  },
                ]}
                onPress={() =>
                  setNewRolePermissions((p) => ({
                    ...p,
                    deleteProperty: !p.deleteProperty,
                  }))
                }
              >
                <Text
                  style={{
                    color: newRolePermissions.deleteProperty ? "#fff" : "#333",
                  }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddRoleModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddRole}
              >
                <Text style={styles.modalButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Role Modal (Super Admin) */}
      <Modal
        visible={editRoleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditRoleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Role</Text>
            <TextInput
              style={styles.input}
              placeholder="Role Name"
              value={newRoleName}
              onChangeText={setNewRoleName}
            />
            <TextInput
              style={styles.input}
              placeholder="Role ID (unique, e.g. 'manager')"
              value={newRoleId}
              onChangeText={setNewRoleId}
              autoCapitalize="none"
              editable={selectedRole?.id !== "superadmin"}
            />
            <Text style={{ fontWeight: "600", marginBottom: 5 }}>
              Permissions:
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: newRolePermissions.addProperty
                      ? "#34C759"
                      : "#ddd",
                    marginRight: 5,
                  },
                ]}
                onPress={() =>
                  setNewRolePermissions((p) => ({
                    ...p,
                    addProperty: !p.addProperty,
                  }))
                }
              >
                <Text
                  style={{
                    color: newRolePermissions.addProperty ? "#fff" : "#333",
                  }}
                >
                  Add
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: newRolePermissions.updateProperty
                      ? "#34C759"
                      : "#ddd",
                    marginRight: 5,
                  },
                ]}
                onPress={() =>
                  setNewRolePermissions((p) => ({
                    ...p,
                    updateProperty: !p.updateProperty,
                  }))
                }
              >
                <Text
                  style={{
                    color: newRolePermissions.updateProperty ? "#fff" : "#333",
                  }}
                >
                  Update
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: newRolePermissions.deleteProperty
                      ? "#34C759"
                      : "#ddd",
                  },
                ]}
                onPress={() =>
                  setNewRolePermissions((p) => ({
                    ...p,
                    deleteProperty: !p.deleteProperty,
                  }))
                }
              >
                <Text
                  style={{
                    color: newRolePermissions.deleteProperty ? "#fff" : "#333",
                  }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditRoleModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditRole}
              >
                <Text style={styles.modalButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Property Modal */}
      <Modal
        visible={editPropertyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditPropertyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Property</Text>
            <TextInput
              style={styles.input}
              placeholder="Property title"
              value={editPropertyTitle}
              onChangeText={setEditPropertyTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={editPropertyDescription}
              onChangeText={setEditPropertyDescription}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditPropertyModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={updateProperty}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        visible={importModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Import Users from CSV</Text>
            <Text style={styles.helperText}>
              Paste CSV data with format:{"\n"}
              Name,Email,Password,Roles{"\n\n"}
              Example:{"\n"}
              John Doe,john@example.com,john123,"admin,user"
            </Text>

            <TouchableOpacity
              style={[styles.button, styles.filePickerButton]}
              onPress={handleImportFromFile}
            >
              <Text style={styles.buttonText}>
                📁 Pick CSV File from Device
              </Text>
            </TouchableOpacity>

            <TextInput
              style={[styles.input, styles.textArea, { height: 200 }]}
              placeholder="Paste CSV data here..."
              value={csvData}
              onChangeText={setCsvData}
              multiline
              numberOfLines={10}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setImportModalVisible(false);
                  setCsvData("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={processCSVImport}
              >
                <Text style={styles.modalButtonText}>Import</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#007AFF",
    padding: 20,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  tabButton: {
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  addButton: {
    backgroundColor: "#34C759",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#34C759",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  itemCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  itemContent: {
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  itemMeta: {
    fontSize: 12,
    color: "#999",
  },
  itemActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: "#007AFF",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  pickerContainer: {
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#999",
  },
  saveButton: {
    backgroundColor: "#34C759",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  rolesContainer: {
    marginBottom: 15,
  },
  rolesScrollView: {
    maxHeight: 150,
  },
  roleCheckboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  roleCheckboxLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  optionsText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  optionButton: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 2,
  },
  manualButton: {
    backgroundColor: "#E8F4F8",
    borderColor: "#007AFF",
  },
  importButton: {
    backgroundColor: "#E8F5E9",
    borderColor: "#34C759",
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  optionButtonSubtext: {
    fontSize: 14,
    color: "#666",
  },
  filePickerButton: {
    backgroundColor: "#007AFF",
    marginVertical: 10,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
});

export default DashboardScreen;
