import React from "react";
import { StyleSheet } from "react-native";
import { Checkbox } from "@carbon/react-native";

const CustomCheckbox = ({ label, checked, onPress, style }) => {
  return (
    <Checkbox
      label={label}
      value={checked}
      onValueChange={onPress}
      style={style}
      testID="custom-checkbox"
    />
  );
};

const styles = StyleSheet.create({});

export default CustomCheckbox;
