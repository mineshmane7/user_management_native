import React from "react";
import { StyleSheet, Text } from "react-native";
import { Card as CarbonCard } from "@carbon/react-native";

const Card = ({ children, style, title }) => {
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
