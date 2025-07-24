import React, { useState, useRef } from "react";
import { View, Pressable, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@/contexts/UserContext";
import { defaultProfileColour } from "@/constants/Colors";

interface LaunchButtonProps {
  onLaunch: () => void;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  holdDuration?: number;
  size?: number;
}

export default function LaunchButton({
  onLaunch,
  iconName = "rocket-launch",
  holdDuration = 2000,
  size = 80,
}: LaunchButtonProps) {
  const { user } = useUser();
  const [isHolding, setIsHolding] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation values
  const fillHeight = useRef(new Animated.Value(0)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const startHold = () => {
    // Prevent multiple starts
    if (isHolding || progressInterval.current) {
      return;
    }

    console.log("Starting hold animation");
    setIsHolding(true);
    setIsFull(false);
    setProgress(0);
    fillHeight.setValue(0);

    const interval = 16; // ~60fps
    const steps = holdDuration / interval;
    let currentStep = 0;

    progressInterval.current = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      // Update fill height directly for smoother animation
      fillHeight.setValue(newProgress / 100);

      console.log(`Fill progress: ${newProgress}%`);

      if (currentStep >= steps) {
        setIsFull(true);
        startShake();
        // Clear interval when complete
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
      }
    }, interval);
  };

  const startShake = () => {
    // Create shake animation
    const shakeSequence = Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

    // Repeat shake until released
    Animated.loop(shakeSequence).start();
  };

  const stopShake = () => {
    shakeAnimation.stopAnimation();
    shakeAnimation.setValue(0);
  };

  const completeLaunch = () => {
    console.log("Completing launch");
    if (isFull) {
      stopShake();
      onLaunch();
      // Reset after launch
      setTimeout(() => {
        setIsHolding(false);
        setIsFull(false);
        setProgress(0);
        fillHeight.setValue(0);
      }, 100);
    }
  };

  const cancelHold = () => {
    console.log("Canceling hold animation");
    setIsHolding(false);
    setIsFull(false);
    setProgress(0);
    stopShake();

    // Reset fill animation
    Animated.timing(fillHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  // Interpolate shake values
  const shakeTranslateX = shakeAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: [-8, 8],
  });

  const buttonColor = user?.profileColor || defaultProfileColour;
  const fillColor = "#ff6b6b"; // Bright red for testing visibility

  return (
    <View style={{ width: "100%", height: size }}>
      <Animated.View
        style={{
          width: "100%",
          height: size,
          transform: [{ translateX: shakeTranslateX }],
        }}
      >
        <Pressable
          onPressIn={startHold}
          onPressOut={isFull ? completeLaunch : cancelHold}
          style={{
            width: "100%",
            height: size,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: "#f8fafc",
            overflow: "hidden",
            backgroundColor: "#374151", // Dark background to see fill
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Fill background */}
          <Animated.View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "green",
              height: fillHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, size],
              }),
              zIndex: 1,
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            }}
          />

          {/* Icon */}
          <MaterialIcons name={iconName} size={size * 0.4} color="#f8fafc" style={{ zIndex: 2 }} />
        </Pressable>
      </Animated.View>
    </View>
  );
}
