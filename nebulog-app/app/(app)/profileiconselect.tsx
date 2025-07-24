import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { router } from "expo-router";
import { SafeAreaView, ScrollView, View, Pressable } from "react-native";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import { useUser } from "@/contexts/UserContext";
import { ProfileIcon } from "@/components/building-blocks/ProfileIcon";
import { profileIconNames } from "@/constants/ProfileIconOptions";

export default function ProfileIconSelect() {
  const { user, updateUserContext } = useUser();
  const [selectedIcon, setSelectedIcon] = useState(user?.profileIcon || "ufo-outline");

  const handleClose = () => {
    router.back();
  };

  const handleSave = () => {
    updateUserContext({ profileIcon: selectedIcon });
    router.back();
  };

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

      <ScrollView className="flex-1 px-6">
        <VStack className="flex-1">
          {/* Title */}
          <VStack className="items-center mb-8">
            <Heading className="text-typography-900 text-2xl font-bold mb-2">
              Choose Profile Icon
            </Heading>
            <Text className="text-typography-600 text-center">
              Select an icon that represents you
            </Text>
          </VStack>

          {/* Icon Grid */}
          <View className="flex-row flex-wrap justify-between mb-8">
            {profileIconNames.map((icon) => (
              <Pressable
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                className={`w-20 h-20 items-center justify-center rounded-2xl ${
                  selectedIcon === icon
                    ? "bg-primary-500 border-2 border-primary-600"
                    : "bg-background-50 border border-border-200"
                }`}
              >
                <ProfileIcon
                  name={icon}
                  size={40}
                  color={selectedIcon === icon ? "#374151" : "#6B7280"}
                />
              </Pressable>
            ))}
          </View>

          {/* Save Button */}
          <Button onPress={handleSave} className="mb-6">
            <ButtonText>Save Icon</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
