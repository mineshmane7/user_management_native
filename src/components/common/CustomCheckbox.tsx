import React from "react";
import { StyleSheet, ViewStyle, TouchableOpacity, View } from "react-native";
import { Checkbox } from "@carbon/react-native";

interface CustomCheckboxProps {
  label: string;
  checked: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const CustomCheckbox = ({ 
  label, 
  checked, 
  onPress, 
  style 
}: CustomCheckboxProps) => {
  const handlePress = () => {
    console.log('Checkbox pressed, current state:', checked);
    onPress();
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      activeOpacity={0.7}
      style={{ width: '100%' }}
    >
      <View pointerEvents="none">
        <Checkbox
          label={label}
          checked={checked}
          value={checked}
          style={style}
          testID="custom-checkbox"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});

export default CustomCheckbox;
