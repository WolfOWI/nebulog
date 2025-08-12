import React from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Pressable, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { User } from "@/lib/types";
import ProfileAvatar from "@/components/avatars/ProfileAvatar";
import { defaultProfileColour } from "@/constants/Colors";

interface BlockedUserCardProps {
  blockedUser: User;
  onUnblock: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

export default function BlockedUserCard({
  blockedUser,
  onUnblock,
  onViewProfile,
}: BlockedUserCardProps) {
  const handleUnblock = () => {
    if (blockedUser.id) {
      onUnblock(blockedUser.id);
    }
  };

  const handleViewProfile = () => {
    if (blockedUser.id) {
      onViewProfile(blockedUser.id);
    }
  };

  return (
    <View className="bg-background-100 rounded-2xl p-4 border border-border-200">
      <HStack className="items-center justify-between">
        <Pressable className="items-center flex-1 gap-3" onPress={handleViewProfile}>
          <HStack className="items-center flex-1 gap-3">
            <ProfileAvatar
              bgColour={blockedUser.profileColor || defaultProfileColour}
              icon={blockedUser.profileIcon || "ufo-outline"}
              size={48}
              iconSize={24}
            />
            <VStack className="flex-1">
              <Text className="text-typography-900 font-semibold" size="lg">
                {blockedUser.username}
              </Text>
              {blockedUser.bio && (
                <Text className="text-typography-600" size="sm" numberOfLines={2}>
                  {blockedUser.bio}
                </Text>
              )}
            </VStack>
          </HStack>
        </Pressable>

        <VStack className="gap-2">
          <Button
            size="sm"
            variant="outline"
            onPress={handleUnblock}
            className="min-w-[80px] border-error-500"
          >
            <ButtonText size="sm" className="text-error-500">
              Unblock
            </ButtonText>
          </Button>
        </VStack>
      </HStack>
    </View>
  );
}
