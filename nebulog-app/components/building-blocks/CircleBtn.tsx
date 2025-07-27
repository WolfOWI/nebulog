import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

interface CircleBtnProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  className?: string;
  size?: string;
  primary?: boolean;
}

const CircleBtn = ({ iconName, className, size, primary = false }: CircleBtnProps) => {
  let iconSize;
  let containerSize;

  switch (size) {
    case "medium":
      iconSize = 24;
      containerSize = 12;
      break;
    case "large":
      iconSize = 24;
      containerSize = 16;
      break;
    default:
      iconSize = 24;
      containerSize = 12;
      break;
  }

  let containerHierarchyClasses = primary
    ? "bg-slate-50"
    : "bg-transparent border border-slate-500";
  let iconHierarchyColor = primary ? "#0f172a" : "#f8fafc";

  return (
    <View
      className={`flex justify-center items-center ${containerHierarchyClasses}  w-${containerSize} h-${containerSize} rounded-full ${className}`}
    >
      <MaterialIcons name={iconName} size={iconSize} color={iconHierarchyColor} />
    </View>
  );
};

export default CircleBtn;
