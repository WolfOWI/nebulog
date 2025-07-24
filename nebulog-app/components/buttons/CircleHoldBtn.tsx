import React, { useState, useRef } from "react";
import { View, Pressable, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CircleBtn from "../building-blocks/CircleBtn";
import { CircularProgress } from "react-native-circular-progress";

interface CircleHoldBtnProps {
  onHoldComplete: () => void;
  iconName: keyof typeof MaterialIcons.glyphMap;
  className?: string;
  holdDuration?: number;
}

export default function CircleHoldBtn({
  onHoldComplete,
  iconName,
  className,
  holdDuration = 1000,
}: CircleHoldBtnProps) {
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
    <View className={className}>
      <View style={{ position: "relative" }}>
        {/* Progress circle */}
        {isHolding && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress
              size={136}
              width={16}
              fill={progress}
              tintColor="#6366f1"
              backgroundColor="#374151"
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
