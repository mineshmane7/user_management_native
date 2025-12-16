import React from 'react';
import {TouchableOpacity, View, Text, StyleSheet} from 'react-native';

const CustomCheckbox = ({label, checked, onPress, style}) => {
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
});

export default CustomCheckbox;
