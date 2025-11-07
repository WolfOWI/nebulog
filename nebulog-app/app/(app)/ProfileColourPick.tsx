import React, { useState, useEffect } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, ScrollView } from "react-native";
import ColorPicker from "react-native-wheel-color-picker";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getIconColourFromBgColour } from "@/utils/colourUtility";
import ProfileAvatar from "@/components/avatars/ProfileAvatar";
import { updateUserDetails } from "@/services/userServices";
import { useToast } from "@/contexts/ToastContext";
import { GetColorName } from "hex-color-to-color-name";
import LaunchButton from "@/components/buttons/LaunchButton";

export default function ProfileColourPick() {
  const { user, updateUserContext } = useUser();
  const { showToast } = useToast();
  const [selectedColor, setSelectedColor] = useState(user?.profileColor || "#4ECDC4");

  // Update local state when user context changes
  useEffect(() => {
    if (user?.profileColor) {
      setSelectedColor(user.profileColor);
    }
  }, [user?.profileColor]);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isColorChanging, setIsColorChanging] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handleSave = async () => {
    if (user?.id) {
      try {
        console.log("Updating profile colour:", { userId: user.id, newColour: selectedColor });
        // Update both the backend and user context
        await updateUserDetails(user.id, { profileColor: selectedColor });
        console.log("Backend updated successfully, updating user context");
        updateUserContext({ profileColor: selectedColor });

        showToast({
          type: "success",
          text1: "Profile Colour Updated",
          text2: `Your profile colour has been set to ${GetColorName(selectedColor)}.`,
          visibilityTime: 3000,
        });

        router.back();
      } catch (error) {
        showToast({
          type: "error",
          text1: "Update Failed",
          text2: "There was an error updating your profile colour. Please try again.",
          visibilityTime: 4000,
        });
      }
    } else {
      showToast({
        type: "error",
        text1: "Update Failed",
        text2: "There was an error updating your profile colour. Please try again.",
        visibilityTime: 4000,
      });
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (!isColorChanging) {
      setIsColorChanging(true);
      setScrollEnabled(false);
    }
  };

  const handleColorChangeComplete = () => {
    setIsColorChanging(false);
    setScrollEnabled(true);
  };

  // Reset scroll when color changing stops
  useEffect(() => {
    if (isColorChanging) {
      const timer = setTimeout(() => {
        setIsColorChanging(false);
        setScrollEnabled(true);
      }, 500); // Wait 500ms after last color change

      return () => clearTimeout(timer);
    }
  }, [selectedColor, isColorChanging]);

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      {/* Header */}
      <View className="m-4">
        <LeftwardSwipeBtn
          onSwipeComplete={handleClose}
          iconName="close"
          touchMessage="Swipe to Close"
        />
      </View>

      <ScrollView
        className="flex-1 px-6"
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Title */}
        <VStack className="items-center mb-4">
          <Heading className="text-typography-900 text-2xl font-bold mb-2">Choose Colour</Heading>
          <Text className="text-typography-600 text-center" size="xl">
            {GetColorName(selectedColor)}
          </Text>
        </VStack>

        {/* Current Avatar Preview */}
        <View className="items-center">
          <ProfileAvatar bgColour={selectedColor} icon={user?.profileIcon || "ufo-outline"} />
        </View>

        {/* Color Picker Component */}
        <View className="flex-1 min-h-[400px] mb-8">
          <ColorPicker
            color={selectedColor}
            onColorChange={handleColorChange}
            thumbSize={48}
            sliderSize={48}
            noSnap={true}
            swatches={false}
          />
        </View>
      </ScrollView>
      <View className="m-4">
        <LaunchButton
          iconName="check"
          onLaunch={handleSave}
          label="Hold to Save"
          holdDuration={500}
          size={88}
          fillColor={selectedColor}
        />
      </View>
    </SafeAreaView>
  );
}
