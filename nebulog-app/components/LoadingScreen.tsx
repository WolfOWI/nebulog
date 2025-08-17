import React from "react";
import { View, ActivityIndicator } from "react-native";
import LottieView from "lottie-react-native";
import { Text } from "@/components/ui/text";

interface LoadingScreenProps {
  animationSource?: any;
  loadingText?: string;
  showText?: boolean;
  size?: number;
  fullScreen?: boolean;
  showBackground?: boolean;
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  animationSource,
  loadingText = "Loading...",
  showText = true,
  size = 200,
  showBackground = true,
  className,
}) => {
  return (
    <View
      className={`flex-1 justify-center items-center absolute top-0 left-0 right-0 bottom-0 ${className} ${
        showBackground ? "bg-background-0" : "bg-transparent"
      }`}
    >
      {animationSource ? (
        <LottieView
          source={animationSource}
          autoPlay={true}
          loop={true}
          style={{
            width: size,
            height: size,
          }}
        />
      ) : (
        <ActivityIndicator
          size="large"
          color="#22d3ee"
          style={{
            width: size,
            height: size,
          }}
        />
      )}

      {showText && (
        <Text className="text-typography-600 mx-8 text-center mt-8" size="2xl">
          {loadingText}
        </Text>
      )}
    </View>
  );
};

export default LoadingScreen;
