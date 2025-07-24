import React, { useState, useRef } from "react";
import { View, Pressable, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CircleBtn from "../building-blocks/CircleBtn";
import { CircularProgress } from "react-native-circular-progress";
import { useUser } from "@/contexts/UserContext";
import { defaultProfileColour } from "@/constants/Colors";

interface CircleHoldBtnProps {
  onHoldComplete: () => void;
  iconName: keyof typeof MaterialIcons.glyphMap;
  holdDuration?: number;
}

export default function CircleHoldBtn({
  onHoldComplete,
  iconName,
  holdDuration = 1000,
}: CircleHoldBtnProps) {
  const { user } = useUser();
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHold = () => {
    setIsHolding(true);
    setProgress(0);

    const interval = 10;
    const steps = holdDuration / interval;
    let currentStep = 0;

    progressInterval.current = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / steps) * 100;
      setProgress(newProgress);

      if (currentStep >= steps) {
        completeHold();
      }
    }, interval);
  };

  const completeHold = () => {
    setIsHolding(false);
    setProgress(0);

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    // Callback
    onHoldComplete();
  };

  const cancelHold = () => {
    setIsHolding(false);
    setProgress(0);

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  return (
    <View>
      <View className="relative">
        {/* Progress circle */}
        {isHolding && (
          <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center">
            <CircularProgress
              size={104}
              width={16}
              fill={progress}
              tintColor={user?.profileColor || defaultProfileColour}
              backgroundColor="rgba(0, 0, 0, 0.2)"
              rotation={0}
              lineCap="round"
            />
          </View>
        )}

        <Pressable
          onPressIn={startHold}
          onPressOut={cancelHold}
          style={{ minWidth: 48, minHeight: 48 }}
        >
          <CircleBtn iconName={iconName} />
        </Pressable>
      </View>
    </View>
  );
}
