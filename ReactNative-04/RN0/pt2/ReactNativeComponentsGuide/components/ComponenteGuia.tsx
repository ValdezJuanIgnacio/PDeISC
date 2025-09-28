import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles/styles";

type Props = {
  title: string;
  explanation: string;
  children: React.ReactNode;
};

const ComponenteGuia = ({ title, explanation, children }: Props) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionExplanation}>{explanation}</Text>
    <View style={styles.componentDemo}>{children}</View>
  </View>
);

export default ComponenteGuia;
