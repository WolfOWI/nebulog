import React, { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import LottieView from "lottie-react-native";

interface AnimatedElementProps {
  animationSource?: any;
  size?: number;
  className?: string;
  isVisible?: boolean;
  fadeDuration?: number;
}

export const AnimatedElement: React.FC<AnimatedElementProps> = ({
  animationSource,
  size = 200,
  className,
  isVisible = true,
  fadeDuration = 300,
}) => {
  const opacity = useSharedValue(isVisible ? 1 : 0);

  useEffect(() => {
    if (isVisible) {
      // Fade in
      opacity.value = withTiming(1, { duration: fadeDuration });
    } else {
      // Fade out
      opacity.value = withTiming(0, { duration: fadeDuration });
    }
  }, [isVisible, fadeDuration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      className={`flex-1 justify-center items-center absolute top-0 left-0 right-0 bottom-0 ${className} pointer-events-none`}
      style={animatedStyle}
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
    </Animated.View>
  );
};

export default AnimatedElement;
