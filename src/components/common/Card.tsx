import React from "react";
import { StyleSheet, Text, StyleProp, ViewStyle } from "react-native";
import { Tile } from "@carbon/react-native";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  title?: string;
}

const Card = ({ children, style, title }: CardProps) => {
  return (
    <Tile style={style}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </Tile>
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
