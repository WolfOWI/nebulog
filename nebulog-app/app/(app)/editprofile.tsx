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
import Toast from "react-native-toast-message";

export default function EditProfile() {
  const { user, updateUserContext } = useUser();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profileIcon, setProfileIcon] = useState("ufo-outline");
  const [profileColor, setProfileColor] = useState("#4ECDC4");
  const [showErrorTooltip, setShowErrorTooltip] = useState(true); // Temporary for styling

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setProfileIcon(user.profileIcon || "ufo-outline");
      setProfileColor(user.profileColor || "#3992ba");
      setBio(user.bio || "");
    }
  }, [user]);

  const handleClose = () => {
    router.back();
  };

  const handleSave = async () => {
    if (user?.id) {
      // Check if username is already taken (and not the same as the current username)
      const isTaken = await isUsernameTaken(username);
      if (isTaken && username !== user.username) {
        Toast.show({
          type: "error",
          text1: `"${username}" is already taken`,
          text2: `Please choose a different username.`,
          position: "top",
          visibilityTime: 4000,
          autoHide: true,
          topOffset: 50,
        });
        return;
      }

      // If username or bio is changed, update the profile
      if (username !== user.username || bio !== user.bio) {
        try {
          updateUserDetails(user.id, { username, bio }); // Update Firestore DB
          updateUserContext({ username: username, bio: bio }); // Update Global Context

          // Show success toast
          Toast.show({
            type: "success",
            text1: "Profile Updated",
            text2: `Your profile has been updated successfully.`,
            position: "top",
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 50,
          });

          router.back();
        } catch (error) {
          // Show error toast
          Toast.show({
            type: "error",
            text1: "Update Failed",
            text2: "There was an error updating your profile. Please try again.",
            position: "top",
            visibilityTime: 4000,
            autoHide: true,
            topOffset: 50,
          });
        }
      } else {
        // If nothing is changed, just go back
        router.back();
      }
    } else {
      // Show error toast for missing user ID
      Toast.show({
        type: "error",
        text1: "User Not Found",
        text2: "Unable to update profile. Please try logging in again.",
        position: "top",
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
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

          {/* Bio Input */}
          <VStack className="mb-6">
            <Text className="text-typography-700 text-sm font-medium mb-2">Bio</Text>
            <Input className="border border-border-200 rounded-lg">
              <InputField value={bio} onChangeText={setBio} placeholder="Enter your bio" />
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
                  style={{ backgroundColor: "#1e293b" }}
                >
                  <ProfileIcon name={profileIcon} size={24} color="#FFFFFF" />
                </View>
                <Text className="text-typography-900">
                  {profileIcon.charAt(0).toUpperCase() + profileIcon.replace("-", " ").slice(1)}
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
