import React, { useEffect, useState } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { router } from "expo-router";
import { SafeAreaView, View, ScrollView } from "react-native";
import ColorPicker from "react-native-wheel-color-picker";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import { useUser } from "@/contexts/UserContext";
import { getMoodIcon } from "@/constants/moodIcons";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getIconColourFromBgColour } from "@/utils/colourUtility";
import ProfileAvatar from "@/components/avatars/ProfileAvatar";

export default function ProfileColourPick() {
  const { user, updateUserContext } = useUser();
  const [selectedColor, setSelectedColor] = useState(user?.profileColor || "#4ECDC4");
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isColorChanging, setIsColorChanging] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handleSave = () => {
    updateUserContext({ profileColor: selectedColor });
    router.back();
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
          <ProfileAvatar bgColour={selectedColor} icon={user?.profileIcon || "default"} />
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
