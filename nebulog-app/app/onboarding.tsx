import React, { useState, useRef } from "react";
import { View, Dimensions, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import LaunchButton from "@/components/buttons/LaunchButton";
import nebulogText from "@/assets/images/nebulog-text-logo-white.png";
import { Image } from "react-native";
import LaunchThoughtSwipeBtn from "@/components/buttons/LaunchThoughtSwipeBtn";
import CircleHoldBtn from "@/components/buttons/CircleHoldBtn";
import CircleHoldTextBtn from "@/components/buttons/CircleHoldTextBtn";
import onboarding1 from "@/assets/images/onboarding/onboard-01.png";
import onboarding2 from "@/assets/images/onboarding/onboard-02.png";
import onboarding3 from "@/assets/images/onboarding/onboard-03.png";

const { width: screenWidth } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    title: "Launch Your Thoughts",
    description: "Transmit your thoughts and feelings into a digital cosmos of reflections.",
    image: onboarding1,
  },
  {
    id: 2,
    title: "Connect Through Location",
    description: "Share and discover thoughts from others around you through an interactive map.",
    image: onboarding2,
  },
  {
    id: 3,
    title: "Customise & Build A Habit",
    description:
      "Create your unique profile, and get into the habit of self-reflection with day streaks.",
    image: onboarding3,
  },
];

export default function Onboarding() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleLogin = () => {
    router.push("/(auth)/login" as any);
  };

  const handleSignup = () => {
    router.push("/(auth)/signup" as any);
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    setActiveIndex(index);
  };

  const renderCarouselItem = (item: (typeof onboardingData)[0]) => {
    return (
      <View
        key={item.id}
        style={{ width: screenWidth }}
        className="flex-1 justify-center items-center px-8"
      >
        <View className="w-80 h-80 rounded-3xl mb-6 justify-center items-center">
          <Image source={item.image} className="w-full h-full object-cover" />
        </View>
        <VStack className="items-center gap-2">
          <Text className="text-typography-900 text-2xl font-bold text-center">{item.title}</Text>
          <Text className="text-typography-500 text-center px-4">{item.description}</Text>
        </VStack>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <VStack className="flex-1">
        {/* Logo */}
        <View className="items-center pt-8">
          <Image source={nebulogText} className="w-[150px] h-6 object-cover" />
        </View>

        {/* Carousel */}
        <View className="flex-1 justify-center">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            className="flex-1"
          >
            {onboardingData.map(renderCarouselItem)}
          </ScrollView>
        </View>

        {/* Pagination Dots */}
        <HStack className="justify-center gap-3 mb-16">
          {onboardingData.map((_, index: number) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                index === activeIndex ? "bg-slate-200 w-10" : "bg-slate-700 w-4"
              }`}
            />
          ))}
        </HStack>
        <HStack className="w-full justify-center gap-8 mb-8">
          <CircleHoldTextBtn
            onHoldComplete={handleLogin}
            text="Log In"
            holdDuration={300}
            size={104}
            className="border border-slate-800 bg-slate-800"
          />
          <CircleHoldTextBtn
            onHoldComplete={handleSignup}
            text="Join Us"
            holdDuration={300}
            size={104}
            className="border border-slate-800"
          />
        </HStack>
      </VStack>
    </SafeAreaView>
  );
}
