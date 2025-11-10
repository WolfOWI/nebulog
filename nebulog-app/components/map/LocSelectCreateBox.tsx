import React, { useEffect, useRef } from "react";
import { View, Platform } from "react-native";
import { Text } from "@/components/ui/text";
import { BlurView } from "expo-blur";
import { VStack } from "../ui/vstack";
import { PlaceDetails } from "@/lib/types";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import LaunchThoughtSwipeBtn from "../buttons/LaunchThoughtSwipeBtn";

interface LocSelectCreateBoxProps {
  onClose: () => void;
  onCreateThought: () => void;
  className?: string;
  selectedLocation: PlaceDetails;
  style?: any;
}

const LocSelectCreateBox: React.FC<LocSelectCreateBoxProps> = ({
  onClose,
  onCreateThought,
  className,
  selectedLocation,
  style,
}) => {
  // Animation values
  const translateY = useSharedValue(300); // Start off-screen
  const opacity = useSharedValue(0);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  // Animate in when component mounts
  useEffect(() => {
    if (selectedLocation) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [selectedLocation]);

  // Cleanup animations when component unmounts or location changes
  useEffect(() => {
    return () => {
      // Reset animation values when component unmounts
      translateY.value = 300;
      opacity.value = 0;
    };
  }, []);

  const handleClose = () => {
    translateY.value = withTiming(300, { duration: 300 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  };

  // Closing the panel swipe gesture
  const swipeDownGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only trigger if swiping down
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      // Close panel (if swiped down more than 50 pixels)
      if (event.translationY > 50) {
        runOnJS(handleClose)();
      } else {
        translateY.value = withTiming(0, { duration: 300 });
      }
    });

  if (!selectedLocation) return null;

  return (
    <Animated.View style={[animatedStyle, style]}>
      <GestureDetector gesture={swipeDownGesture}>
        <BlurView
          intensity={Platform.OS === "android" ? 0 : 20}
          className={`absolute bottom-0 left-0 right-0 p-6 mx-6 mb-8 rounded-3xl overflow-hidden ${className}`}
          style={{
            borderWidth: 1,
            borderColor: "#1e293b",
            borderRadius: 24,
            ...Platform.select({
              android: {
                backgroundColor: "rgba(15, 23, 42, 0.95)",
              },
            }),
          }}
        >
          <VStack className="gap-4">
            {/* Place name display
            {selectedLocation.name && (
              <View className="bg-slate-800 px-4 py-3 rounded-2xl">
                <Text className="text-white text-center text-sm font-medium" numberOfLines={2}>
                  {selectedLocation.name}
                </Text>
              </View>
            )} */}

            {/* Create Thought Button */}
            <LaunchThoughtSwipeBtn
              onSwipeComplete={onCreateThought}
              iconName="rocket-launch"
              displayMessage={`Reflect at ${selectedLocation.name}`}
              size="small"
            />
          </VStack>
        </BlurView>
      </GestureDetector>
    </Animated.View>
  );
};

export default LocSelectCreateBox;
