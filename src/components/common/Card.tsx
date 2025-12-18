import React from "react";
import { StyleSheet, Text, StyleProp, ViewStyle } from "react-native";
import { Card as CarbonCard } from "@carbon/react-native";

interface CardProps {
  children: any;
  style?: StyleProp<ViewStyle>;
  title?: string;
}

const Card = ({ children, style, title }: CardProps) => {
  return (
    <CarbonCard style={style} testID="carbon-card">
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </CarbonCard>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
});

export default Card;
