import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ListRenderItemInfo,
} from "react-native";
import { CustomCheckbox } from "../../components";
import { Button } from "@carbon/react-native";
import { useDashboard } from "./hooks/useDashboard";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  roles: string[];
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Property {
  id: string;
  title: string;
  description?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface Role {
  id: string;
  name: string;
  permissions?: {
    addProperty?: boolean;
    updateProperty?: boolean;
    deleteProperty?: boolean;
  };
}

interface Permissions {
  addProperty: boolean;
  updateProperty: boolean;
  deleteProperty: boolean;
}

const DashboardScreen = ({ route, navigation }: any) => {
  const { user } = route.params;

  const {
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
  } = useDashboard(user);

  const renderUserItem = ({ item }: ListRenderItemInfo<User>) => {
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
            text="Edit"
            onPress={() => openEditUserModal(item)}
            style={styles.actionButton}
          />
          <Button
            text="Delete"
            kind="danger"
            onPress={() => deleteUser(item.id)}
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  };

  const renderPropertyItem = ({ item }: ListRenderItemInfo<Property>) => {
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
                text="Edit"
                onPress={() => openEditPropertyModal(item)}
                style={[styles.actionButton, styles.editButton]}
              />
            )}
            {perms.deleteProperty && (
              <Button
                text="Delete"
                kind="danger"
                onPress={() => deleteProperty(item.id)}
                style={[styles.actionButton, styles.deleteButton]}
              />
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
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => handleLogout(navigation)}
        >
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
                    text="+ Add User"
                    onPress={() => setShowAddUserOptions(true)}
                    style={styles.addButton}
                  />
                </View>

                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by username..."
                  value={userSearchQuery}
                  onChangeText={setUserSearchQuery}
                />

                <FlatList
                  data={filteredUsers}
                  keyExtractor={(item: User) => item.id?.toString()}
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
                    text="+ Add Role"
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
                  />
                </View>
                <FlatList
                  data={roles}
                  keyExtractor={(item: Role) => item.id}
                  renderItem={({ item }: ListRenderItemInfo<Role>) => (
                    <View style={styles.itemCard}>
                      <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>{item.name}</Text>
                        <Text style={styles.itemMeta}>ID: {item.id}</Text>
                        <Text style={styles.itemMeta}>
                          Permissions:{" "}
                          {item.permissions
                            ? Object.entries(item.permissions)
                                .map(([k, v]) => (v ? k : null))
                                .filter(Boolean)
                                .join(", ") || "None"
                            : "None"}
                        </Text>
                      </View>
                      <View style={styles.itemActions}>
                        <Button
                          text="Edit"
                          onPress={() => {
                            setSelectedRole(item);
                            setNewRoleName(item.name);
                            setNewRoleId(item.id);
                            setNewRolePermissions(item.permissions);
                            setEditRoleModalVisible(true);
                          }}
                          style={styles.actionButton}
                        />
                        {item.id !== "superadmin" && (
                          <Button
                            text="Delete"
                            kind="danger"
                            onPress={() => handleDeleteRole(item.id)}
                            style={styles.actionButton}
                          />
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
                  text="Add Property"
                  onPress={addProperty}
                  style={styles.submitButton}
                />
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
                keyExtractor={(item: Property) => item.id?.toString()}
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
                  .filter((r: Role) => r.id !== "superadmin")
                  .map((role: Role) => (
                    <View style={styles.roleCheckboxContainer}>
                      <CustomCheckbox
                        label={role.name}
                        checked={newUserRoles.includes(role.id)}
                        onPress={() => toggleRoleSelection(role.id)}
                        style={styles.checkbox}
                      />
                    </View>
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
                  .filter((r: Role) => r.id !== "superadmin")
                  .map((role: Role) => (
                    <View style={styles.roleCheckboxContainer}>
                      <CustomCheckbox
                        label={role.name}
                        checked={newUserRoles.includes(role.id)}
                        onPress={() => toggleRoleSelection(role.id)}
                        style={styles.checkbox}
                      />
                    </View>
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
                  setNewRolePermissions((p: Permissions) => ({
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
                  setNewRolePermissions((p: Permissions) => ({
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
                  setNewRolePermissions((p: Permissions) => ({
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
                  setNewRolePermissions((p: Permissions) => ({
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
                  setNewRolePermissions((p: Permissions) => ({
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
                  setNewRolePermissions((p: Permissions) => ({
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
  checkbox: {
    marginBottom: 0,
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
  helperText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    lineHeight: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DashboardScreen;
