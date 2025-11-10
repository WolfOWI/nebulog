import React, { useState, useRef } from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
} from "react-native-reanimated";
import { Text } from "@/components/ui/text";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "@/contexts/UserContext";
import { defaultProfileColour } from "@/constants/Colors";

const getIconComponent = (iconName: string) => {
  if (iconName in MaterialCommunityIcons.glyphMap) {
    return MaterialCommunityIcons;
  }
  if (iconName in MaterialIcons.glyphMap) {
    return MaterialIcons;
  }
  return MaterialIcons;
};

interface LaunchButtonProps {
  onLaunch: () => void;
  iconName?: string;
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

  // Animation values using react-native-reanimated
  const fillHeight = useSharedValue(0);
  const shakeTranslateX = useSharedValue(0);

  const startHold = () => {
    // Prevent multiple starts
    if (isHolding || progressInterval.current) {
      return;
    }

    // console.log("Starting hold animation");
    setIsHolding(true);
    setIsFull(false);
    setProgress(0);
    fillHeight.value = 0;

    const interval = 16; // ~60fps
    const steps = holdDuration / interval;
    let currentStep = 0;

    progressInterval.current = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      // Update fill height directly for smoother animation
      fillHeight.value = newProgress / 100;

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
    // Cancel any existing animation
    cancelAnimation(shakeTranslateX);

    // Create shake animation sequence that repeats infinitely
    shakeTranslateX.value = withRepeat(
      withSequence(withTiming(1, { duration: 50 }), withTiming(-1, { duration: 50 })),
      -1, // Infinite repetitions
      false // Don't reverse
    );
  };

  const stopShake = () => {
    cancelAnimation(shakeTranslateX);
    shakeTranslateX.value = withTiming(0, { duration: 100 });
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
        fillHeight.value = withTiming(0, { duration: 200 });
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
    fillHeight.value = withTiming(0, { duration: 200 });

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  // Animated style for shake
  const shakeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeTranslateX.value }],
    };
  });

  // Animated style for fill height
  const fillAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: fillHeight.value * size,
    };
  });

  return (
    <View style={{ width: "100%", height: size }}>
      <Animated.View
        style={[
          {
            width: "100%",
            height: size,
          },
          shakeAnimatedStyle,
        ]}
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
            style={[
              {
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: fillColor,
                zIndex: 1,
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
              },
              fillAnimatedStyle,
            ]}
          />

          {/* Icon */}
          {iconName &&
            (() => {
              const IconComponent = getIconComponent(iconName);
              return (
                <IconComponent
                  name={iconName as any}
                  size={size * 0.3}
                  color="#f8fafc"
                  style={{ zIndex: 2 }}
                />
              );
            })()}

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
