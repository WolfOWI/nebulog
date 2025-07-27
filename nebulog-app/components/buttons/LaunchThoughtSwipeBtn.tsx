import React, { useState } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import CircleBtn from "../building-blocks/CircleBtn";

interface LaunchThoughtSwipeBtnProps {
  onSwipeComplete: () => void;
  iconName: keyof typeof MaterialIcons.glyphMap;
  threshold?: number; // How much to swipe before triggering (0-1)
  displayMessage: string;
  className?: string;
}

export default function LaunchThoughtSwipeBtn({
  onSwipeComplete,
  iconName,
  threshold = 0.3,
  displayMessage,
  className,
}: LaunchThoughtSwipeBtnProps) {
  // Track the button's position
  const translateX = useSharedValue(0);

  // Store the component's width for calculations
  const [componentWidth, setComponentWidth] = useState(0);

  // Create the swipe gesture
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow swiping right (positive X)
      if (event.translationX > 0) {
        // Calculate how far the button can move (component width minus button width)
        const maxSwipeDistance = componentWidth - 48;
        // Limit the movement to prevent going too far
        translateX.value = Math.min(event.translationX, maxSwipeDistance);
      }
    })
    .onFinalize((event) => {
      // Calculate how far user needs to swipe to trigger the action
      const maxSwipeDistance = componentWidth - 48;
      const swipeThreshold = maxSwipeDistance * threshold;

      if (event.translationX > swipeThreshold) {
        // User swiped enough - trigger the action with subtle spring
        translateX.value = withSpring(
          maxSwipeDistance,
          {
            damping: 20, // Higher damping = less bouncy
            stiffness: 150, // Lower stiffness = softer spring
          },
          () => {
            runOnJS(onSwipeComplete)();
          }
        );
      } else {
        // User didn't swipe enough - reset to starting position with subtle spring
        translateX.value = withSpring(0, {
          damping: 20, // Higher damping = less bouncy
          stiffness: 150, // Lower stiffness = softer spring
        });
      }
    });

  // Create the animated style for the button
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Get the component's width when it renders
  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setComponentWidth(width);
  };

  return (
    <GestureDetector gesture={panGesture}>
      <View
        className={`bg-slate-900 w-full ${className} relative rounded-full`}
        onLayout={handleLayout}
      >
        <View className="absolute top-0 left-0 right-0 bottom-0 flex-row justify-start items-center z-1000 gap-4">
          <View className="w-16 h-16" />
          <Text className="text-slate-50 text-center text-lg">{displayMessage}</Text>
        </View>

        {/* The animated button */}
        <Animated.View style={[animatedStyle]}>
          <CircleBtn primary iconName={iconName} className="self-start" size="large" />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
