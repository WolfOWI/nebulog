import React from "react";
import { View, ActivityIndicator } from "react-native";
import LottieView from "lottie-react-native";
import { Text } from "@/components/ui/text";

interface AnimatedElementProps {
  animationSource?: any;
  size?: number;
  className?: string;
}

export const AnimatedElement: React.FC<AnimatedElementProps> = ({
  animationSource,
  size = 200,
  className,
}) => {
  const textStyle = {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  };

  return (
    <View
      className={`flex-1 justify-center items-center absolute top-0 left-0 right-0 bottom-0 ${className}`}
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
    </View>
  );
};

export default AnimatedElement;
