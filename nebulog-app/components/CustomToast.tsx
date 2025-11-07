import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from "react-native-reanimated";

interface ToastData {
  id: string;
  type: "success" | "error" | "info" | "warning";
  text1: string;
  text2?: string;
  visibilityTime: number;
}

interface CustomToastProps {
  toast: ToastData | null;
  onHide: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({ toast, onHide }) => {
  const translateY = useSharedValue(-200);
  const opacity = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => {
    if (toast) {
      // Slide in and fade in with spring animation for natural feel
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
        mass: 0.8,
      });
      opacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      });

      // Auto hide after visibilityTime
      const timer = setTimeout(() => {
        // Slide out and fade out with smooth easing
        translateY.value = withTiming(-200, {
          duration: 350,
          easing: Easing.in(Easing.cubic),
        });
        opacity.value = withTiming(
          0,
          {
            duration: 350,
            easing: Easing.in(Easing.cubic),
          },
          () => {
            runOnJS(onHide)();
          }
        );
      }, toast.visibilityTime);

      return () => clearTimeout(timer);
    } else {
      // Reset animations when toast is null
      translateY.value = -200;
      opacity.value = 0;
    }
  }, [toast, translateY, opacity, onHide]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Only allow swiping upward (negative translationY)
      if (event.translationY < 0) {
        translateY.value = startY.value + event.translationY;
        // Reduce opacity as user swipes up
        const progress = Math.abs(event.translationY) / 200;
        opacity.value = Math.max(0, 1 - progress);
      }
    })
    .onEnd((event) => {
      // If user swiped up more than 50 pixels, dismiss the toast
      if (event.translationY < -50) {
        translateY.value = withTiming(-200, {
          duration: 350,
          easing: Easing.in(Easing.cubic),
        });
        opacity.value = withTiming(
          0,
          {
            duration: 350,
            easing: Easing.in(Easing.cubic),
          },
          () => {
            runOnJS(onHide)();
          }
        );
      } else {
        // Spring back to original position with smooth spring
        translateY.value = withSpring(0, {
          damping: 18,
          stiffness: 250,
          mass: 0.7,
        });
        opacity.value = withSpring(1, {
          damping: 18,
          stiffness: 250,
          mass: 0.7,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!toast) {
    return null;
  }

  const getBorderColor = () => {
    switch (toast.type) {
      case "success":
        return "#22c55e";
      case "error":
        return "#f87171";
      case "info":
        return "#7dd3fc";
      case "warning":
        return "#f59e0b";
      default:
        return "#22c55e";
    }
  };

  const getText1Color = () => {
    switch (toast.type) {
      case "success":
        return "#22c55e";
      case "error":
        return "#f87171";
      case "info":
        return "#7dd3fc";
      case "warning":
        return "#f59e0b";
      default:
        return "#22c55e";
    }
  };

  const handleDismiss = () => {
    translateY.value = withTiming(-200, {
      duration: 350,
      easing: Easing.in(Easing.cubic),
    });
    opacity.value = withTiming(
      0,
      {
        duration: 350,
        easing: Easing.in(Easing.cubic),
      },
      () => {
        runOnJS(onHide)();
      }
    );
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.gestureContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleDismiss}
            style={[styles.toast, { borderLeftColor: getBorderColor() }]}
          >
            <View style={styles.content}>
              {toast.text1 && (
                <Text style={[styles.text1, { color: getText1Color() }]}>{toast.text1}</Text>
              )}
              {toast.text2 && <Text style={styles.text2}>{toast.text2}</Text>}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 64,
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: "box-none",
  },
  gestureContainer: {
    alignSelf: "stretch",
  },
  toast: {
    alignSelf: "stretch",
    marginHorizontal: 16,
    backgroundColor: "#1e293b",
    borderRadius: 24,
    borderLeftWidth: 5,
    paddingVertical: 24,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    width: "100%",
  },
  text1: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  text2: {
    fontSize: 16,
    color: "#64748b",
    lineHeight: 22,
  },
});

export default CustomToast;
