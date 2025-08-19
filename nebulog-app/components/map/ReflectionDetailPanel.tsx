import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
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
import EchoCounter from "../information/EchoCounter";
import ProfileAvatar from "../avatars/ProfileAvatar";
import { router } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import {
  likeReflection,
  unlikeReflection,
  listenToReflectionEchoStatus,
  listenToReflectionEchoCount,
} from "@/services/echoService";

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

interface ReflectionDetailPanelProps {
  reflection: Reflection | null;
  onClose: () => void;
  className?: string;
  style?: any;
}

const ReflectionDetailPanel: React.FC<ReflectionDetailPanelProps> = ({
  reflection,
  onClose,
  className,
  style,
}) => {
  const { user, updateEchoedReflections } = useUser();
  const [isLiked, setIsLiked] = useState(false);
  const [isEchoing, setIsEchoing] = useState(false);
  const [echoCount, setEchoCount] = useState(0);

  const translateY = useSharedValue(300); // Start off-screen
  const opacity = useSharedValue(0);
  const fillHeight = useSharedValue(0); // Animated fill height
  const fillOpacity = useSharedValue(0); // Animated fill opacity

  const [isHolding, setIsHolding] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [isAuthor, setIsAuthor] = useState(true);
  const [holdProgress, setHoldProgress] = useState(0);
  const [blurViewHeight, setBlurViewHeight] = useState(0);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdDuration = 500;

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  // Animated fill style
  const animatedFillStyle = useAnimatedStyle(() => {
    return {
      height: fillHeight.value,
      opacity: fillOpacity.value,
    };
  });

  // Animate in when component mounts
  useEffect(() => {
    if (reflection) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [reflection]);

  // Set up real-time listeners for echo status and count
  useEffect(() => {
    if (!reflection || !user) return;

    // Listen to echo status changes
    const unsubscribeEchoStatus = listenToReflectionEchoStatus(
      user.id!,
      reflection.id!,
      (isLiked) => {
        setIsLiked(isLiked);
      }
    );

    // Listen to echo count changes
    const unsubscribeEchoCount = listenToReflectionEchoCount(reflection.id!, (count) => {
      setEchoCount(count);
    });

    // Cleanup listeners when component unmounts or dependencies change
    return () => {
      unsubscribeEchoStatus();
      unsubscribeEchoCount();
    };
  }, [reflection?.id, user?.id]);

  const handleClose = () => {
    translateY.value = withSpring(300, { damping: 20, stiffness: 100 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onClose)();
    });
  };

  // Hold gesture functions
  const startHold = () => {
    // Prevent multiple starts
    if (isHolding || holdInterval.current) {
      return;
    }

    setIsHolding(true);
    setIsFull(false);
    setHoldProgress(0);
    fillHeight.value = 0;
    fillOpacity.value = withTiming(1, { duration: 200 });

    const interval = 16;
    const steps = holdDuration / interval;
    let currentStep = 0;

    holdInterval.current = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setHoldProgress(newProgress);
      fillHeight.value = (newProgress / 100) * blurViewHeight;

      if (currentStep >= steps) {
        setIsFull(true);
        // Clear interval when complete
        if (holdInterval.current) {
          clearInterval(holdInterval.current);
          holdInterval.current = null;
        }
      }
    }, interval);
  };

  const completeHold = () => {
    if (isFull) {
      handleToggleEcho();

      // Reset after completion
      setTimeout(() => {
        setIsFull(false);
        setHoldProgress(0);
        fillHeight.value = withTiming(0, { duration: 300 });
        fillOpacity.value = withTiming(0, { duration: 300 });

        // Hide the fill after animation completes
        setTimeout(() => {
          setIsHolding(false);
        }, 300);
      }, 100);
    }
  };

  const cancelHold = () => {
    setIsFull(false);
    setHoldProgress(0);

    // Animate the fill dropping down and fading out
    fillHeight.value = withTiming(0, { duration: 300 });
    fillOpacity.value = withTiming(0, { duration: 300 });

    // Hide the fill after animation completes
    setTimeout(() => {
      setIsHolding(false);
    }, 300);

    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
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
        translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
      }
    });

  // Handle echo toggle
  const handleToggleEcho = async () => {
    if (!reflection || !user || isEchoing) return;

    setIsEchoing(true);
    try {
      if (isLiked) {
        // Unlike the reflection
        await unlikeReflection(user.id!, reflection.id!, reflection.authorId);
        updateEchoedReflections(reflection.id!, false);
        setIsLiked(false);
      } else {
        // Like the reflection
        await likeReflection(user.id!, reflection.id!, reflection.authorId);
        updateEchoedReflections(reflection.id!, true);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling echo:", error);
    } finally {
      setIsEchoing(false);
    }
  };

  // Handle user profile press
  const handleUserProfilePress = () => {
    // User is the author, go to their profile
    if (reflection?.authorId === user?.id) {
      router.push({
        pathname: "/(app)/myprofile",
      } as any);
    }
    // User is NOT author, go to the author's profile
    else {
      router.push({
        pathname: "/(app)/userprofile",
        params: { userId: reflection?.authorId },
      } as any);
    }
  };

  // Check if user is the author of the reflection
  useEffect(() => {
    if (reflection?.authorId === user?.id) {
      setIsAuthor(true);
    } else {
      setIsAuthor(false);
    }
  }, [reflection?.authorId, user?.id]);

  if (!reflection) return null;

  const reflectionMood = reflection.mood?.toLowerCase() || "unselected";
  const moodData = mood[reflectionMood as keyof typeof mood] || mood.unselected;

  return (
    <Animated.View style={[animatedStyle, style]}>
      <GestureDetector gesture={swipeDownGesture}>
        <View
          style={{
            ...Platform.select({
              ios: {
                shadowColor: moodData?.colorHex,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isLiked ? 0.5 : 0,
                shadowRadius: 24,
              },
            }),
          }}
        >
          <BlurView
            intensity={Platform.OS === "android" ? 0 : 20}
            className={`absolute bottom-0 left-0 right-0 p-6 mx-6 mb-8 rounded-3xl overflow-hidden ${className}`}
            style={{
              borderWidth: 1,
              borderColor: isLiked ? moodData?.colorHex : "#1e293b",
              borderRadius: 24,

              ...Platform.select({
                android: {
                  backgroundColor: "rgba(15, 23, 42, 1)",
                  shadowColor: moodData?.colorHex,
                  shadowOffset: { width: 0, height: 0 },
                  shadowRadius: 24,
                  elevation: isLiked ? 24 : 0,
                },
              }),
            }}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setBlurViewHeight(height);
            }}
          >
            {/* Hold gesture container #1 - top area */}
            {!isAuthor && (
              <Pressable
                onPressIn={startHold}
                onPressOut={isFull ? completeHold : cancelHold}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 80,
                  zIndex: 10,
                }}
              />
            )}
            {/* Hold gesture container #2 - bottom (echo) area */}
            {!isAuthor && (
              <Pressable
                onPressIn={startHold}
                onPressOut={isFull ? completeHold : cancelHold}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "80%",
                  right: 0,
                  height: 80,
                  zIndex: 10,
                }}
              />
            )}
            {/* Animated fill overlay */}
            {isHolding && !isAuthor && (
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: moodData?.colorHex
                      ? `${moodData.colorHex}80`
                      : "rgba(0, 0, 0, 0.5)",
                    borderRadius: 16,
                    zIndex: 1,
                  },
                  animatedFillStyle,
                ]}
              />
            )}
            <VStack className="gap-2" style={{ zIndex: 2 }}>
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
              <Text className="text-typography-600" size="lg">
                {reflection.text}
              </Text>
              <Text className="text-typography-600" size="sm">
                {reflection.location?.placeName || "Unknown Location"}
              </Text>
              <Divider className="my-2" />

              <HStack className="flex-row justify-between items-end">
                <Pressable className="flex-row items-center gap-3" onPress={handleUserProfilePress}>
                  <ProfileAvatar
                    bgColour={reflection.authorProfileColor || "#4ECDC4"}
                    icon={reflection.authorProfileIcon || "ufo-outline"}
                    iconSize={24}
                    size={48}
                  />
                  <VStack className="gap-1">
                    <Text className="text-typography-900" size="md">
                      {reflection.authorUsername || "Someone"}
                    </Text>
                    <Text className="text-typography-600" size="sm">
                      {reflection.createdAt
                        ? dayjs(reflection.createdAt).fromNow()
                        : "Some time ago"}
                    </Text>
                  </VStack>
                </Pressable>

                {!isAuthor ? (
                  <EchoCounter
                    echoCount={echoCount}
                    isLiked={isLiked}
                    onToggleLike={handleToggleEcho}
                    disabled={isEchoing}
                  />
                ) : (
                  <EchoCounter
                    echoCount={echoCount}
                    isLiked={isLiked}
                    onToggleLike={handleToggleEcho}
                    disabled={true}
                  />
                )}
              </HStack>
            </VStack>
          </BlurView>
        </View>
      </GestureDetector>
    </Animated.View>
  );
};

export default ReflectionDetailPanel;
