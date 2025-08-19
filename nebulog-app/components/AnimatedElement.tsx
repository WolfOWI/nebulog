import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Animated } from "react-native";
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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: fadeDuration,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: fadeDuration,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, fadeAnim, fadeDuration]);

  return (
    <Animated.View
      className={`flex-1 justify-center items-center absolute top-0 left-0 right-0 bottom-0 ${className}`}
      style={{
        opacity: fadeAnim,
      }}
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
