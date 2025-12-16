import React from 'react';
import {TouchableOpacity, Text, StyleSheet, ActivityIndicator} from 'react-native';

const CustomButton = ({
  title,
  onPress,
  backgroundColor = '#007AFF',
  textColor = '#fff',
  disabled = false,
  loading = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {backgroundColor},
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, {color: textColor}]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default CustomButton;
