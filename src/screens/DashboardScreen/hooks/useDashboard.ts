import { useState, useEffect } from "react";
import { Alert } from "react-native";
import DocumentPicker from "react-native-document-picker";
import RNFS from "react-native-fs";
import { apiService } from "../../../api/apiService";

export const useDashboard = (user: any) => {
  // Roles management (Super Admin)
  const [roles, setRoles] = useState<any[]>([]);
  const [rolesTab, setRolesTab] = useState(false);
  const [addRoleModalVisible, setAddRoleModalVisible] = useState(false);
  const [editRoleModalVisible, setEditRoleModalVisible] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleId, setNewRoleId] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState({
    addProperty: false,
    updateProperty: false,
    deleteProperty: false,
  });
  const [selectedRole, setSelectedRole] = useState<any>(null);

  // Properties
  const [properties, setProperties] = useState<any[]>([]);
  const [newPropertyTitle, setNewPropertyTitle] = useState("");
  const [newPropertyDescription, setNewPropertyDescription] = useState("");
  const [editPropertyModalVisible, setEditPropertyModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [editPropertyTitle, setEditPropertyTitle] = useState("");
  const [editPropertyDescription, setEditPropertyDescription] = useState("");
  const [propertySearchQuery, setPropertySearchQuery] = useState("");

  // Users management
  const [users, setUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [editUserModalVisible, setEditUserModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRoles, setNewUserRoles] = useState(["user"]);
  const [showAddUserOptions, setShowAddUserOptions] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [csvData, setCsvData] = useState("");

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

  const fetchRoles = async () => {
    try {
      const response = await apiService.get<any[]>("/roles");
      setRoles(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch roles");
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiService.get<any[]>("/users");
      const filteredUsers = response.data.filter((u: any) => u.role !== "superadmin");
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

  const toggleRoleSelection = (roleId: string) => {
    if (newUserRoles.includes(roleId)) {
      setNewUserRoles(newUserRoles.filter((r: string) => r !== roleId));
    } else {
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

        let fileContent;
        try {
          let filePath = fileUri;
          if (filePath.startsWith("file://")) {
            filePath = filePath.replace("file://", "");
          }

          fileContent = await RNFS.readFile(filePath, "utf8");
        } catch (readError) {
          try {
            const response = await fetch(fileUri);
            fileContent = await response.text();
          } catch (fetchError) {
            throw new Error("Failed to read file with both RNFS and fetch");
          }
        }

        if (fileContent && fileContent.trim()) {
          await processCSVData(fileContent);
        } else {
          Alert.alert("Error", "Failed to read file content or file is empty");
        }
      }
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        console.log("User cancelled file picker");
      } else {
        Alert.alert("Error", "Failed to pick file: " + (err?.message || String(err)));
      }
    }
  };

  const processCSVData = async (csvContent: string) => {
    try {
      const lines = csvContent.trim().split("\n");
      const usersToImport: any[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];

        if (values.length >= 4) {
          const rolesString = values[3].replace(/"/g, "");
          const rolesArray = rolesString.split(",").map((r: string) => r.trim()).filter((r: string) => r);

          usersToImport.push({
            name: values[0]?.replace(/"/g, "") || "",
            email: values[1]?.replace(/"/g, "") || "",
            password: values[2]?.replace(/"/g, "") || "",
            roles: rolesArray,
            createdAt: new Date().toISOString(),
          });
        }
      }

      if (usersToImport.length === 0) {
        Alert.alert("Error", "No valid users found in CSV file");
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const userToImport of usersToImport) {
        try {
          const response = await apiService.post("/users", userToImport);

          if (response.status === 200 || response.status === 201) {
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
        [{ text: "OK", onPress: () => fetchUsers() }]
      );
    } catch (error: any) {
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
        Alert.alert("Error", "CSV must have at least a header row and one data row");
        return;
      }

      const headers = lines[0].split(",").map((h: string) => h.trim().replace(/"/g, ""));

      if (headers[0] !== "Name" || headers[1] !== "Email" || headers[2] !== "Password" || headers[3] !== "Roles") {
        Alert.alert("Invalid Format", 'CSV must have columns: Name, Email, Password, Roles');
        return;
      }

      const usersToImport: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values: string[] = [];
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
          const rolesArray = rolesString.split(",").map((r) => r.trim()).filter((r) => r);

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

      let successCount = 0;
      let errorCount = 0;

      for (const userToImport of usersToImport) {
        try {
          const response = await apiService.post("/users", userToImport);

          if (response.status === 200 || response.status === 201) {
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
    } catch (error: any) {
      Alert.alert("Error", "Failed to process CSV data: " + error.message);
    }
  };

  const addUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
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
      const response = await apiService.post("/users", newUser);

      if (response.status === 200 || response.status === 201) {
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

  const openEditUserModal = (userItem: any) => {
    setSelectedUser(userItem);
    setNewUserName(userItem.name);
    setNewUserEmail(userItem.email);
    setNewUserPassword(userItem.password);
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
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
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
      const response = await apiService.put(`/users/${selectedUser.id}`, updatedUser);

      if (response.status === 200 || response.status === 204) {
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

  const deleteUser = async (userId: string) => {
    Alert.alert("Delete User", "Are you sure you want to delete this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await apiService.delete(`/users/${userId}`);

            if (response.status === 200 || response.status === 204) {
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

  const handleAddRole = async () => {
    if (!newRoleName.trim() || !newRoleId.trim()) {
      Alert.alert("Error", "Please enter role name and ID");
      return;
    }
    if (roles.some((r: any) => r.id === newRoleId)) {
      Alert.alert("Error", "Role ID must be unique");
      return;
    }
    const newRole = {
      id: newRoleId,
      name: newRoleName,
      permissions: newRolePermissions,
    };
    try {
      const response = await apiService.post("/roles", newRole);
      if (response.status === 200 || response.status === 201) {
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
      const response = await apiService.put(`/roles/${selectedRole.id}`, updatedRole);
      if (response.status === 200 || response.status === 204) {
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

  const handleDeleteRole = async (roleId: string) => {
    try {
      const response = await apiService.get<any[]>("/users");
      const allUsers = response.data;

      const usersWithRole = allUsers.filter((u: any) => {
        if (Array.isArray(u.roles)) {
          return u.roles.includes(roleId);
        }
        return u.role === roleId;
      });

      if (usersWithRole.length > 0) {
        const userNames = usersWithRole.map((u: any) => u.name).join(", ");
        Alert.alert(
          "Cannot Delete Role",
          `This role is currently assigned to ${usersWithRole.length} user(s): ${userNames}.\n\nPlease reassign or remove these users before deleting this role.`,
          [{ text: "OK", style: "default" }]
        );
        return;
      }

      Alert.alert("Delete Role", "Are you sure you want to delete this role?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const deleteResponse = await apiService.delete(`/roles/${roleId}`);
              if (deleteResponse.status === 200 || deleteResponse.status === 204) {
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

  const fetchProperties = async () => {
    try {
      const response = await apiService.get<any[]>("/properties");
      setProperties(response.data);
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
      const response = await apiService.post("/properties", newProperty);

      if (response.status === 200 || response.status === 201) {
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

  const openEditPropertyModal = (property: any) => {
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
      const response = await apiService.put(`/properties/${selectedProperty.id}`, updatedProperty);

      if (response.status === 200 || response.status === 204) {
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

  const deleteProperty = async (propertyId: string) => {
    Alert.alert("Delete Property", "Are you sure you want to delete this property?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await apiService.delete(`/properties/${propertyId}`);

            if (response.status === 200 || response.status === 204) {
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
    ]);
  };

  const handleLogout = (navigation: any) => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: () => navigation.replace("Login"),
      },
    ]);
  };

  const getRoleDisplayName = (roleId: string) => {
    const found = roles.find((r: any) => r.id === roleId);
    return found ? found.name : roleId;
  };

  const getCurrentRolePermissions = () => {
    let userRoles: string[] = [];
    if (Array.isArray(user.roles)) {
      userRoles = user.roles;
    } else if (user.role) {
      userRoles = [user.role];
    }

    const mergedPermissions = {
      addProperty: false,
      updateProperty: false,
      deleteProperty: false,
    };

    userRoles.forEach((roleId) => {
      const roleData = roles.find((r: any) => r.id === roleId);
      if (roleData && roleData.permissions) {
        if (roleData.permissions.addProperty) mergedPermissions.addProperty = true;
        if (roleData.permissions.updateProperty) mergedPermissions.updateProperty = true;
        if (roleData.permissions.deleteProperty) mergedPermissions.deleteProperty = true;
      }
    });

    return mergedPermissions;
  };

  const filteredUsers = users.filter((u: any) =>
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredProperties = properties.filter((p: any) =>
    p.title.toLowerCase().includes(propertySearchQuery.toLowerCase())
  );

  return {
    // State
    roles,
    rolesTab,
    setRolesTab,
    addRoleModalVisible,
    setAddRoleModalVisible,
    editRoleModalVisible,
    setEditRoleModalVisible,
    newRoleName,
    setNewRoleName,
    newRoleId,
    setNewRoleId,
    newRolePermissions,
    setNewRolePermissions,
    selectedRole,
    setSelectedRole,
    properties,
    newPropertyTitle,
    setNewPropertyTitle,
    newPropertyDescription,
    setNewPropertyDescription,
    editPropertyModalVisible,
    setEditPropertyModalVisible,
    selectedProperty,
    editPropertyTitle,
    setEditPropertyTitle,
    editPropertyDescription,
    setEditPropertyDescription,
    propertySearchQuery,
    setPropertySearchQuery,
    users,
    userSearchQuery,
    setUserSearchQuery,
    addUserModalVisible,
    setAddUserModalVisible,
    editUserModalVisible,
    setEditUserModalVisible,
    selectedUser,
    newUserName,
    setNewUserName,
    newUserEmail,
    setNewUserEmail,
    newUserPassword,
    setNewUserPassword,
    newUserRoles,
    setNewUserRoles,
    showAddUserOptions,
    setShowAddUserOptions,
    importModalVisible,
    setImportModalVisible,
    csvData,
    setCsvData,
    filteredUsers,
    filteredProperties,

    // Functions
    isSuperAdmin,
    fetchRoles,
    fetchUsers,
    openAddUserModal,
    toggleRoleSelection,
    handleImportExcel,
    handleImportFromFile,
    processCSVImport,
    addUser,
    openEditUserModal,
    updateUser,
    deleteUser,
    handleAddRole,
    handleEditRole,
    handleDeleteRole,
    fetchProperties,
    addProperty,
    openEditPropertyModal,
    updateProperty,
    deleteProperty,
    handleLogout,
    getRoleDisplayName,
    getCurrentRolePermissions,
  };
};
