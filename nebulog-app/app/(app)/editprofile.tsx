import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
import { Input, InputField } from "@/components/ui/input";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@/contexts/UserContext";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import ProfileAvatar from "@/components/avatars/ProfileAvatar";
import { ProfileIcon } from "@/components/building-blocks/ProfileIcon";
import { isUsernameTaken, updateUserDetails } from "@/services/userServices";
import Toast from "react-native-toast-message";
import LaunchButton from "@/components/buttons/LaunchButton";
import { logOutUser } from "@/services/authServices";
import { GetColorName } from "hex-color-to-color-name";
import { Textarea, TextareaInput } from "@/components/ui/textarea";

export default function EditProfile() {
  const { user, loading, updateUserContext } = useUser();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profileIcon, setProfileIcon] = useState("ufo-outline");
  const [profileColor, setProfileColor] = useState("#4ECDC4");

  const maxBioCharacters = 100;
  const isApproachingBioLimit =
    bio.length >= maxBioCharacters * 0.8 && bio.length !== maxBioCharacters; // 80% of the max characters (excluding max)
  const maxBioCharactersReached = bio.length === maxBioCharacters;

  // Load user data when component mounts and when user context changes
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setProfileIcon(user.profileIcon || "ufo-outline");
      setProfileColor(user.profileColor || "#3992ba");
      setBio(user.bio || "");
    }
  }, [user]);

  // Refresh local state when screen comes into focus (e.g., returning from icon/colour selection)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        setUsername(user.username || "");
        setProfileIcon(user.profileIcon || "ufo-outline");
        setProfileColor(user.profileColor || "#3992ba");
        setBio(user.bio || "");
      }
    }, [user])
  );

  const handleSave = async () => {
    // Check if username is at least 3 characters long
    if (username.length < 3) {
      Toast.show({
        type: "error",
        text1: "Invalid Username",
        text2: "Your username must be at least 3 characters long",
        position: "top",
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

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

      // Check if any profile data has changed
      const hasChanges =
        username !== user.username ||
        bio !== user.bio ||
        profileIcon !== user.profileIcon ||
        profileColor !== user.profileColor;

      if (hasChanges) {
        try {
          // Prepare update data
          const updateData: Partial<typeof user> = {};
          if (username !== user.username) updateData.username = username;
          if (bio !== user.bio) updateData.bio = bio;
          if (profileIcon !== user.profileIcon) updateData.profileIcon = profileIcon;
          if (profileColor !== user.profileColor) updateData.profileColor = profileColor;

          // Update Firestore DB
          await updateUserDetails(user.id, updateData);

          // Update Global Context
          updateUserContext(updateData);

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
    router.push("/(app)/profileiconselect" as any);
  };

  const handleColorSelect = () => {
    router.push("/(app)/profilecolourpick" as any);
  };

  // At every bio input change, limit the text to the max characters
  const handleBioChange = (text: string) => {
    setBio(text.slice(0, maxBioCharacters));
  };

  const handleLogout = async () => {
    await logOutUser();
    setTimeout(() => {
      router.replace("/(auth)/login" as any);
    }, 100);
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background-0">
        <View className="flex-1 justify-center items-center">
          <Text className="text-typography-600">Redirecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        {/* Header */}
        <View className="m-4">
          <LeftwardSwipeBtn
            onSwipeComplete={handleSave}
            iconName="check"
            touchMessage="Swipe to Save"
          />
        </View>

        <ScrollView className="flex-1 px-6">
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
            <Input>
              <InputField
                value={username.toLowerCase().trim()}
                onChangeText={(text) => setUsername(text.toLowerCase().trim())}
                placeholder="Enter a username"
                inputMode="text"
                maxLength={20}
                autoCapitalize="none"
              />
            </Input>
          </VStack>

          {/* Bio Input */}
          <VStack className="mb-6">
            <Text className="text-typography-700 text-sm font-medium mb-2">Bio</Text>
            <Textarea className="h-[112px]">
              <TextareaInput
                placeholder="Enter your bio"
                value={bio}
                onChangeText={handleBioChange}
                inputMode="text"
                maxLength={maxBioCharacters}
                className="text-typography-900"
                textAlignVertical="top"
                multiline
                numberOfLines={5}
              />
            </Textarea>

            {/* Character Counter */}
            <HStack className="justify-end mt-2">
              <Text
                className={`text-typography-500 ${isApproachingBioLimit && "text-warning-500"} ${
                  maxBioCharactersReached && "text-error-500"
                }`}
                size="sm"
              >
                {bio.length}/{maxBioCharacters}
              </Text>
            </HStack>
          </VStack>

          {/* Profile Icon Selection */}
          <Pressable onPress={handleIconSelect} className="mb-6">
            <Text className="text-typography-700 text-sm font-medium mb-2">Profile Icon</Text>
            <View className="flex-row items-center justify-between p-4 border border-background-100 rounded-2xl">
              <HStack className="items-center">
                <View
                  className="w-10 h-10 rounded-full mr-3 items-center justify-center"
                  style={{ backgroundColor: "#1e293b" }}
                >
                  <ProfileIcon name={profileIcon} size={24} color="#FFFFFF" />
                </View>
                <Text className="text-typography-900" size="xl">
                  {profileIcon.charAt(0).toUpperCase() + profileIcon.replace("-", " ").slice(1)}
                </Text>
              </HStack>
              <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
            </View>
          </Pressable>

          {/* Profile Color Selection */}
          <Pressable onPress={handleColorSelect} className="mb-8">
            <Text className="text-typography-700 text-sm font-medium mb-2">Profile Colour</Text>
            <View className="flex-row items-center justify-between p-4 border border-background-100 rounded-2xl">
              <HStack className="items-center">
                <View
                  className="w-10 h-10 rounded-full mr-3 border-2 border-border-200"
                  style={{ backgroundColor: profileColor }}
                />
                <Text className="text-typography-900" size="xl">
                  {GetColorName(profileColor)}
                </Text>
              </HStack>
              <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      <View className="m-4">
        <LaunchButton
          iconName="logout"
          onLaunch={handleLogout}
          label="Hold to Log Out"
          holdDuration={2000}
          size={88}
          fillColor="#991b1b"
        />
      </View>
    </SafeAreaView>
  );
}
