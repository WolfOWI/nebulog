import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { router } from "expo-router";
import { SafeAreaView, ScrollView, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { logOutUser } from "@/services/authServices";
import { useUser } from "@/contexts/UserContext";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import CircleHoldBtn from "@/components/buttons/CircleHoldBtn";
import ProfileAvatar from "@/components/avatars/ProfileAvatar";
import { defaultProfileColour } from "@/constants/Colors";

export default function MyProfile() {
  const { user } = useUser();

  const handleClose = () => {
    router.back();
  };

  const handleEdit = () => {
    try {
      router.push("/EditProfile" as any);
    } catch (error) {
      console.error("Error in handleEdit:", error);
    }
  };

  const handleLogout = async () => {
    await logOutUser();
    router.replace("/(auth)/Login" as any);
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <View className="m-4">
        <LeftwardSwipeBtn
          onSwipeComplete={handleClose}
          iconName="close"
          touchMessage="Swipe to Close"
        />
      </View>

      <ScrollView>
        <VStack className="flex-1 px-6">
          {/* Profile Header */}
          <VStack className="items-center mb-8">
            <ProfileAvatar bgColour={user.profileColor} icon={user.profileIcon || "ufo-outline"} />
            <HStack className="items-center mt-3 mb-2 gap-3">
              <View className="w-12 h-12" />
              <Heading className="text-typography-900 text-2xl font-bold">{user.username}</Heading>
              <CircleHoldBtn holdDuration={500} onHoldComplete={handleEdit} iconName="edit" />
            </HStack>
            {user.bio && <Text className="text-typography-600 text-center mb-4">{user.bio}</Text>}
            <HStack className="justify-between items-center w-full mt-4 px-4">
              <VStack className="items-center w-1/3">
                <Text className="text-slate-50 text-center text-2xl ">{user.streakCount}</Text>
                <Text className="text-slate-400 text-center">day streak</Text>
              </VStack>
              <VStack className="items-center w-1/3">
                <Text className="text-slate-50 text-center text-2xl ">{user.totalReflections}</Text>
                <Text className="text-slate-400 text-center">reflections</Text>
              </VStack>
              <VStack className="items-center w-1/3">
                <Text className="text-slate-50 text-center text-2xl ">{user.totalEchoes}</Text>
                <Text className="text-slate-400 text-center">echoes</Text>
              </VStack>
            </HStack>
          </VStack>

          {/* Logout Button */}
          <Button onPress={handleLogout} variant="outline" className="mt-4">
            <ButtonText>Log Out</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
