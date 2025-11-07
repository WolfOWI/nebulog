import React, { useState, useEffect } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Pressable } from "react-native";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import { useUser } from "@/contexts/UserContext";
import { ProfileIcon } from "@/components/building-blocks/ProfileIcon";
import { profileIconNames } from "@/constants/ProfileIconOptions";
import { updateUserDetails } from "@/services/userServices";
import { useToast } from "@/contexts/ToastContext";
import LaunchButton from "@/components/buttons/LaunchButton";

export default function ProfileIconSelect() {
  const { user, updateUserContext } = useUser();
  const { showToast } = useToast();
  const [selectedIcon, setSelectedIcon] = useState(user?.profileIcon || "ufo-outline");

  // Update local state when user context changes
  useEffect(() => {
    if (user?.profileIcon) {
      setSelectedIcon(user.profileIcon);
    }
  }, [user?.profileIcon]);

  const handleClose = () => {
    router.back();
  };

  const handleSave = async () => {
    if (user?.id) {
      try {
        console.log("Updating profile icon:", { userId: user.id, newIcon: selectedIcon });
        // Update both the backend and user context
        await updateUserDetails(user.id, { profileIcon: selectedIcon });
        console.log("Backend updated successfully, updating user context");
        updateUserContext({ profileIcon: selectedIcon });

        showToast({
          type: "success",
          text1: "Profile Icon Updated",
          text2: `Your profile icon has been changed to the ${selectedIcon.replace(
            "-",
            " "
          )} icon.`,
          visibilityTime: 3000,
        });

        router.back();
      } catch (error) {
        showToast({
          type: "error",
          text1: "Update Failed",
          text2: "There was an error updating your profile icon. Please try again.",
          visibilityTime: 4000,
        });
      }
    } else {
      showToast({
        type: "error",
        text1: "Update Failed",
        text2: "There was an error updating your profile icon. Please try again.",
        visibilityTime: 4000,
      });
    }
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
        </VStack>
      </ScrollView>
      <View className="m-4">
        <LaunchButton
          iconName="check"
          onLaunch={handleSave}
          label="Hold to Save"
          holdDuration={500}
          size={88}
          fillColor={user?.profileColor}
        />
      </View>
    </SafeAreaView>
  );
}
