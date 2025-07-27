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

interface RightwardSwipeBtnProps {
  onSwipeComplete: () => void;
  iconName: keyof typeof MaterialIcons.glyphMap;
  threshold?: number; // How much to swipe before triggering (0-1)
  touchMessage?: string;
  className?: string;
}

export default function RightwardSwipeBtn({
  onSwipeComplete,
  iconName,
  threshold = 0.3,
  touchMessage = "Swipe Right",
  className,
}: RightwardSwipeBtnProps) {
  // Track the button's position
  const translateX = useSharedValue(0);

  // Show/hide the swipe instruction message
  const [showMessage, setShowMessage] = useState(false);

  // Store the component's width for calculations
  const [componentWidth, setComponentWidth] = useState(0);

  // Create the swipe gesture
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      // Show message when user starts touching
      runOnJS(setShowMessage)(true);
    })
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

      // Hide the message when finger is lifted
      runOnJS(setShowMessage)(false);
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
        style={{ width: "100%", position: "relative" }}
        onLayout={handleLayout}
        className={className}
      >
        {/* Show swipe instruction when touched */}
        {showMessage && (
          <View className="absolute top-0 left-0 right-0 bottom-0 flex-row justify-center items-center z-1000">
            <Text className="text-white text-center text-lg">{touchMessage}</Text>
            <MaterialIcons name="arrow-forward" size={24} color="#f8fafc" />
          </View>
        )}

        {/* The animated button */}
        <Animated.View style={[animatedStyle]}>
          <CircleBtn iconName={iconName} className="self-start" />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
