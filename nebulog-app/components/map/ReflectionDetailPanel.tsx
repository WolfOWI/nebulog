import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import { BlurView } from "expo-blur";
import { HStack } from "../ui/hstack";
import { getMoodIcon } from "@/constants/moodIcons";
import { mood } from "@/constants/moods";
import { Reflection } from "@/lib/types";
import { VStack } from "../ui/vstack";
import { Divider } from "../ui/divider";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getIcon } from "@/constants/customIcons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

interface ReflectionDetailPanelProps {
  reflection: Reflection | null;
  onClose: () => void;
  className?: string;
}

const ReflectionDetailPanel: React.FC<ReflectionDetailPanelProps> = ({
  reflection,
  onClose,
  className,
}) => {
  // Animation values - these must be called before any conditional returns
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
    if (reflection) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [reflection]);

  const handleClose = () => {
    translateY.value = withSpring(300, { damping: 20, stiffness: 100 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  };

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
        // Snap back to original position if not swiped enough
        translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
      }
    });

  if (!reflection) return null;

  const reflectionMood = reflection.mood?.toLowerCase() || "unselected";
  const moodData = mood[reflectionMood as keyof typeof mood] || mood.unselected;
  const shadowColor = moodData?.shadowColor || "shadow-slate-200/50";

  return (
    <GestureDetector gesture={swipeDownGesture}>
      <Animated.View style={animatedStyle} className={`shadow-lg ${shadowColor} `}>
        <BlurView
          intensity={20}
          className={`absolute bottom-0 left-0 right-0 p-6 mx-6 mb-8 rounded-3xl overflow-hidden border ${moodData?.borderColor} ${className}`}
        >
          <VStack className="gap-2 ">
            <HStack className="flex-row justify-between items-center">
              <HStack className="gap-2 items-center">
                {getMoodIcon(reflectionMood, {
                  fill: moodData?.colorHex,
                  width: 32,
                  height: 32,
                })}
                <Text className={`text-2xl ${moodData?.textColor}`}>
                  {moodData?.spaceObject || "Unknown Planet"}
                </Text>
              </HStack>
            </HStack>
            <Text className="text-typography-900" size="md">
              {moodData?.subemotions || "Unselected Mood"}
            </Text>
            <Text className="text-typography-700" size="lg">
              {reflection.text}
            </Text>
            <Text className="text-typography-600" size="sm">
              {reflection.location?.placeName || "Unknown Location"}
            </Text>
            <Divider className="my-2" />
            <Text className="text-typography-600" size="sm">
              {reflection.authorId || "Someone"}
              {/* TODO: Add author name */}
            </Text>
            <HStack className="flex-row justify-between items-center">
              <Text className="text-typography-600" size="sm">
                {reflection.createdAt ? dayjs(reflection.createdAt).fromNow() : "Some time ago"}
              </Text>
              <HStack className="flex-row items-center gap-2">
                <Text className="text-typography-900" size="md">
                  {reflection.echoCount || "0"}
                </Text>
                {getIcon("echo", { fill: "#F8FAFC", width: 24, height: 24 })}
              </HStack>
            </HStack>
          </VStack>
        </BlurView>
      </Animated.View>
    </GestureDetector>
  );
};

export default ReflectionDetailPanel;
