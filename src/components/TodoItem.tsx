import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "@carbon/react-native";
import CarbonIcon from "./common/CarbonIcon";
import Edit24 from "@carbon/icons/es/edit/24";
import Trash24 from "@carbon/icons/es/trash-can/24";

const TodoItem = ({
  todo,
  onEdit,
  onDelete,
  onPermission,
  canEdit,
  canDelete,
  isAdmin,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{todo.title}</Text>
        {todo.description ? (
          <Text style={styles.description}>{todo.description}</Text>
        ) : null}
        <Text style={styles.meta}>
          Created by: {todo.createdByName || "Unknown"}
        </Text>
      </View>
      <View style={styles.actions}>
        {canEdit && (
          <Button
            size="small"
            onPress={() => onEdit(todo)}
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
        )}
        {canDelete && (
          <Button
            size="small"
            kind="danger"
            onPress={() => onDelete(todo.id)}
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
        {isAdmin && (
          <Button
            size="small"
            onPress={() => onPermission(todo)}
            style={styles.actionButton}
          >
            Permissions
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  meta: {
    fontSize: 12,
    color: "#999",
  },
  actions: {
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
  permissionButton: {
    backgroundColor: "#FF9500",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default TodoItem;
