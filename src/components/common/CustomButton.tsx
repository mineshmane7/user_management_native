import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Button } from "@carbon/react-native";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const CustomButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
}: CustomButtonProps) => {
  return (
    <Button
      text={loading ? "Loading..." : title}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, style]}
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
