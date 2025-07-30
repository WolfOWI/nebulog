import React, { useState, useRef } from "react";
import { View, Pressable, Animated } from "react-native";
import { Text } from "@/components/ui/text";
import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@/contexts/UserContext";
import { defaultProfileColour } from "@/constants/Colors";

interface LaunchButtonProps {
  onLaunch: () => void;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  holdDuration?: number;
  size?: number;
  label?: string;
  fillColor?: string;
}

export default function LaunchButton({
  onLaunch,
  iconName,
  holdDuration = 2000,
  size = 80,
  label,
  fillColor = "#3730a3",
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

    // console.log("Starting hold animation");
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

      //   console.log(`Fill progress: ${newProgress}%`);

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
    // console.log("Completing launch");
    if (isFull) {
      stopShake();
      onLaunch();
      // Reset after launch
      setTimeout(() => {
        setIsHolding(false);
        setIsFull(false);
        setProgress(0);
        // Reset fill animation
        Animated.timing(fillHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }, 100);
    }
  };

  const cancelHold = () => {
    // console.log("Canceling hold animation");
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
    outputRange: [-1, 1],
  });

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
          //   className="w-full border-2 bg-slate-800 rounded-2xl border-[#f8fafc] justify-center items-center overflow-hidden relative gap-2"
          className="w-full rounded-2xl justify-center items-center overflow-hidden relative gap-2 "
          style={{
            height: size,
          }}
        >
          {/* Fill background */}
          <Animated.View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: fillColor,
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
          {iconName && (
            <MaterialIcons
              name={iconName}
              size={size * 0.3}
              color="#f8fafc"
              style={{ zIndex: 2 }}
            />
          )}

          {label && (
            <Text className="text-typography-400 z-10" size="md">
              {label}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}
