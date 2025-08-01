import React, { useState, useEffect } from "react";
import { View, Pressable, Text } from "react-native";
import { BlurView } from "expo-blur";

interface CircularSwitchBtnProps {
  isOn?: boolean;
  onToggle?: (isOn: boolean) => void;
  onText?: string;
  offText?: string;
  size?: number;
  className?: string;
}

const CircularSwitchBtn = ({
  isOn = false,
  onToggle,
  onText = "On",
  offText = "Off",
  size = 80,
  className,
}: CircularSwitchBtnProps) => {
  const [internalIsOn, setInternalIsOn] = useState(isOn);

  // Sync internal state with prop changes
  useEffect(() => {
    setInternalIsOn(isOn);
  }, [isOn]);

  const handlePress = () => {
    const newState = !internalIsOn;
    setInternalIsOn(newState);
    onToggle?.(newState);
  };

  const isActive = internalIsOn;

  // Colors
  const activeColor = "#22c55e";
  const activeGlowColor = "#16a34a";
  const inactiveColor = "#64748b";
  const textColor = isActive ? activeColor : inactiveColor;
  const borderColor = isActive ? activeColor : inactiveColor;
  const glowColor = isActive ? activeGlowColor : "transparent";

  return (
    <Pressable onPress={handlePress} className={className}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: isActive ? 4 : 1,
          borderColor: borderColor,
          backgroundColor: "transparent",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isActive ? 0.8 : 0,
          shadowRadius: isActive ? 8 : 0,
        }}
      >
        <BlurView
          intensity={20}
          style={{
            borderRadius: size / 2,
            overflow: "hidden",
            width: "100%",
            height: "100%",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: textColor,
              fontSize: 16,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {isActive ? onText : offText}
          </Text>
        </BlurView>
      </View>
    </Pressable>
  );
};

export default CircularSwitchBtn;
