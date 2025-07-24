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
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import { logOutUser } from "@/services/authServices";
import { useUser } from "@/contexts/UserContext";
import RightwardSwipeBtn from "@/components/buttons/RightwardSwipeBtn";

export default function Profile() {
  const { user } = useUser();

  const handleClose = () => {
    router.back();
  };

  const handleLogout = async () => {
    await logOutUser();
    router.replace("/(auth)/login");
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ScrollView>
        <VStack className="flex-1 px-6">
          {/* Header */}
          <LeftwardSwipeBtn
            onSwipeComplete={handleClose}
            iconName="close"
            touchMessage="Swipe to Close"
          />
          <RightwardSwipeBtn
            onSwipeComplete={handleClose}
            iconName="edit"
            touchMessage="Swipe to Edit"
          />

          {/* Profile Header */}
          <VStack className="items-center mb-8">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage
                source={{
                  uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                }}
              />
            </Avatar>
            <Heading className="text-typography-900 text-2xl font-bold mb-2">
              {user.username}
            </Heading>
            {user.bio && <Text className="text-typography-600 text-center">{user.bio}</Text>}
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
