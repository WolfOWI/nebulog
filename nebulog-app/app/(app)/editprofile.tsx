import React, { useState, useEffect } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { router } from "expo-router";
import { SafeAreaView, ScrollView, View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@/contexts/UserContext";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import ProfileAvatar from "@/components/avatars/ProfileAvatar";
import { ProfileIcon } from "@/components/building-blocks/ProfileIcon";
import { isUsernameTaken, updateUserDetails } from "@/services/userServices";

export default function EditProfile() {
  const { user, updateUserContext } = useUser();
  const [username, setUsername] = useState("");
  const [profileIcon, setProfileIcon] = useState("ufo-outline");
  const [profileColor, setProfileColor] = useState("#4ECDC4");

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setProfileIcon(user.profileIcon || "ufo-outline");
      setProfileColor(user.profileColor || "#3992ba");
    }
  }, [user]);

  const handleClose = () => {
    router.back();
  };

  const handleSave = async () => {
    if (user?.id) {
      // Check if username is already taken
      const isTaken = await isUsernameTaken(username);
      if (isTaken) {
        console.error("Username already taken");
        return;
      }

      try {
        updateUserDetails(user.id, { username }); // Update Firestore DB
        updateUserContext({ username: username }); // Update Global Context
        router.back();
      } catch (error) {
        console.error("Error updating user username: ", error);
      }
    } else {
      console.error("User ID not found, cannot update user details");
    }
  };

  const handleIconSelect = () => {
    router.push("/(app)/ProfileIconSelect" as any);
  };

  const handleColorSelect = () => {
    router.push("/ProfileColourPick" as any);
  };

  if (!user) return null;

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
            <Heading className="text-typography-900 text-2xl font-bold mb-2">Edit Profile</Heading>
            <Text className="text-typography-600 text-center">Update your profile information</Text>
          </VStack>

          {/* Profile Avatar Preview */}
          <VStack className="items-center mb-8">
            <ProfileAvatar bgColour={profileColor} icon={profileIcon} />
          </VStack>

          {/* Username Input */}
          <VStack className="mb-6">
            <Text className="text-typography-700 text-sm font-medium mb-2">Username</Text>
            <Input className="border border-border-200 rounded-lg">
              <InputField
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                className="text-typography-900"
              />
            </Input>
          </VStack>

          {/* Profile Icon Selection */}
          <VStack className="mb-6">
            <Text className="text-typography-700 text-sm font-medium mb-2">Profile Icon</Text>
            <Pressable
              onPress={handleIconSelect}
              className="flex-row items-center justify-between p-4 border border-border-200 rounded-lg bg-background-50"
            >
              <HStack className="items-center">
                <View
                  className="w-10 h-10 rounded-full mr-3 items-center justify-center"
                  style={{ backgroundColor: profileColor }}
                >
                  <ProfileIcon name={profileIcon} size={24} color="#FFFFFF" />
                </View>
                <Text className="text-typography-900">
                  {profileIcon.charAt(0).toUpperCase() + profileIcon.slice(1)}
                </Text>
              </HStack>
              <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
            </Pressable>
          </VStack>

          {/* Profile Color Selection */}
          <VStack className="mb-8">
            <Text className="text-typography-700 text-sm font-medium mb-2">Profile Color</Text>
            <Pressable
              onPress={handleColorSelect}
              className="flex-row items-center justify-between p-4 border border-border-200 rounded-lg bg-background-50"
            >
              <HStack className="items-center">
                <View
                  className="w-10 h-10 rounded-full mr-3 border-2 border-border-200"
                  style={{ backgroundColor: profileColor }}
                />
                <Text className="text-typography-900">{profileColor}</Text>
              </HStack>
              <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
            </Pressable>
          </VStack>

          {/* Save Button */}
          <Button onPress={handleSave} className="mb-6">
            <ButtonText>Save Changes</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
