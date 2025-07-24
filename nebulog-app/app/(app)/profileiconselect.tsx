import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import { router } from "expo-router";
import { SafeAreaView, ScrollView, View, Pressable } from "react-native";
import { getMoodIcon } from "@/constants/moodIcons";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import { useUser } from "@/contexts/UserContext";

const moodOptions = [
  "joy",
  "gratitude",
  "growth",
  "connection",
  "stillness",
  "wonder",
  "anger",
  "turbulence",
  "sadness",
  "grief",
  "lost",
];

export default function ProfileIconSelect() {
  const { user, updateUserContext } = useUser();
  const [selectedIcon, setSelectedIcon] = useState(user?.profileIcon || "default");

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
            {moodOptions.map((mood) => (
              <Pressable
                key={mood}
                onPress={() => setSelectedIcon(mood)}
                className={`w-20 h-20 items-center justify-center rounded-2xl mb-4 ${
                  selectedIcon === mood
                    ? "bg-primary-500 border-2 border-primary-600"
                    : "bg-background-50 border border-border-200"
                }`}
              >
                {getMoodIcon(mood, {
                  width: 40,
                  height: 40,
                  fill: selectedIcon === mood ? "#FFFFFF" : "#6B7280",
                })}
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
