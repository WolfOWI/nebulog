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
import Toast from "react-native-toast-message";

export default function ProfileColourPick() {
  const { user, updateUserContext } = useUser();
  const [selectedColor, setSelectedColor] = useState(user?.profileColor || "#4ECDC4");
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isColorChanging, setIsColorChanging] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handleSave = () => {
    if (user?.id) {
      updateUserDetails(user.id, { profileColor: selectedColor }); // Update Firestore DB
      updateUserContext({ profileColor: selectedColor }); // Update Context

      Toast.show({
        type: "success",
        text1: "Profile Colour Updated",
        text2: "Your profile colour has been saved successfully.",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });

      router.back();
    } else {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "There was an error updating your profile colour. Please try again.",
        position: "top",
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
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
          <Text className="text-typography-600 text-center">Select a colour for your profile</Text>
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

        {/* Save Button */}
        <Button onPress={handleSave} className="mb-6">
          <ButtonText>Save Colour</ButtonText>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
