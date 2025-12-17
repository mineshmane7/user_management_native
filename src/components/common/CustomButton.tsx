import React from 'react';
import {ActivityIndicator, StyleSheet} from 'react-native';
import {Button} from '@carbon/react-native';

const CustomButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
}) => {
  return (
    <Button
      text={loading ? 'Loading...' : title}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, style]}
      testID="custom-button"
    />
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
  },
});

export default CustomButton;
