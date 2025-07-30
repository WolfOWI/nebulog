import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

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
    ? "bg-typography-900"
    : "bg-transparent border border-typography-600";
  let iconHierarchyColor = primary ? "#0f172a" : "#f8fafc";

  return (
    <View
      className={`flex justify-center items-center ${containerHierarchyClasses}  w-${containerSize} h-${containerSize} rounded-full ${className} `}
    >
      <BlurView
        intensity={20}
        style={{
          borderRadius: 999,
          overflow: "hidden",
          width: "100%",
          height: "100%",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <MaterialIcons name={iconName} size={iconSize} color={iconHierarchyColor} />
      </BlurView>
    </View>
  );
};

export default CircleBtn;
