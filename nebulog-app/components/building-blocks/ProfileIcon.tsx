import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Simple profile icon component
export function ProfileIcon({
  name,
  size = 48,
  color = "#FFFFFF",
  style,
}: {
  name?: string;
  size?: number;
  color?: string;
  style?: any;
}) {
  const iconName = name || "ufo-outline";
  return <MaterialCommunityIcons name={iconName as any} size={size} color={color} style={style} />;
}
