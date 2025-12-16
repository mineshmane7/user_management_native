import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

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
          Created by: {todo.createdByName || 'Unknown'}
        </Text>
      </View>
      <View style={styles.actions}>
        {canEdit && (
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEdit(todo)}>
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
        {canDelete && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(todo.id)}>
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.actionButton, styles.permissionButton]}
            onPress={() => onPermission(todo)}>
            <Text style={styles.actionButtonText}>Permissions</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  meta: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  permissionButton: {
    backgroundColor: '#FF9500',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TodoItem;
