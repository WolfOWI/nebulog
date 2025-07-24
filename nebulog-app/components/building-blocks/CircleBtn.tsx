import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

interface CircleBtnProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  className?: string;
}

const CircleBtn = ({ iconName, className }: CircleBtnProps) => {
  return (
    <View
      className={`flex justify-center items-center bg-transparent border border-slate-500 w-12 h-12 rounded-full ${className}`}
    >
      <MaterialIcons name={iconName} size={24} color="#f8fafc" />
    </View>
  );
};

export default CircleBtn;
