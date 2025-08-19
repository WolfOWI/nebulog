import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { BlurView } from "expo-blur";
import { HStack } from "../ui/hstack";
import { getMoodIcon } from "@/constants/moodIcons";
import { mood } from "@/constants/moods";
import { Reflection } from "@/lib/types";
import { VStack } from "../ui/vstack";
import { Divider } from "../ui/divider";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getIcon } from "@/constants/customIcons";
import { MaterialIcons } from "@expo/vector-icons";
import ProfileAvatar from "../avatars/ProfileAvatar";
import { router } from "expo-router";

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

interface EchoedReflectionCardProps {
  reflection: Reflection;
}

const EchoedReflectionCard: React.FC<EchoedReflectionCardProps> = ({ reflection }) => {
  if (!reflection) return null;

  const reflectionMood = reflection.mood?.toLowerCase() || "unselected";
  const moodData = mood[reflectionMood as keyof typeof mood] || mood.unselected;

  const handleUserProfilePress = () => {
    if (reflection.authorId) {
      try {
        router.push(`/userprofile?userId=${reflection.authorId}` as any);
      } catch (error) {
        console.error("Error navigating to user profile:", error);
      }
    }
  };

  const handleLocationPress = () => {
    if (reflection.location) {
      try {
        router.push({
          pathname: "/(app)/home" as any,
          params: {
            highlightedReflection: JSON.stringify(reflection),
          },
        });
      } catch (error) {
        console.error("Error navigating to home with reflection:", error);
      }
    }
  };

  return (
    <View className="p-6 rounded-3xl overflow-hidden bg-background-100">
      <VStack className="gap-2">
        <HStack className="gap-2 items-center">
          {getMoodIcon(reflectionMood, {
            fill: moodData?.colorHex,
            width: 32,
            height: 32,
          })}
          <Text className={`text-2xl ${moodData?.textColor}`}>
            {moodData?.spaceObject || "Unknown Planet"}
          </Text>
        </HStack>
        <Text className="text-typography-900" size="md">
          {moodData?.subemotions || "Unselected Mood"}
        </Text>
        <Text className="text-typography-600" size="md">
          {reflection.text}
        </Text>
        {reflection.location ? (
          <Pressable onPress={handleLocationPress} className="flex-row items-center gap-1 w-fit">
            <MaterialIcons name="location-on" size={24} color={moodData?.colorHex || "#334155"} />
            <Text className="text-typography-600 text-sm w-fit" size="sm">
              {reflection.location.placeName || "View on map"}
            </Text>
          </Pressable>
        ) : (
          <View className="flex-row items-center gap-1 w-fit">
            <MaterialIcons name="location-off" size={24} color="#64748b" />
            <Text className="text-typography-600" size="sm">
              No location
            </Text>
          </View>
        )}
        <Divider className="my-2" />

        {/* Author Details Section */}
        <HStack className="flex-row justify-between items-end">
          <Pressable className="flex-row items-center gap-3" onPress={handleUserProfilePress}>
            <ProfileAvatar
              bgColour={reflection.authorProfileColor || "#4ECDC4"}
              icon={reflection.authorProfileIcon || "ufo-outline"}
              iconSize={24}
              size={48}
            />
            <VStack className="gap-1">
              <Text className="text-typography-900" size="md">
                {reflection.authorUsername || "Someone"}
              </Text>
              <Text className="text-typography-600" size="sm">
                {reflection.createdAt ? dayjs(reflection.createdAt).fromNow() : "Some time ago"}
              </Text>
            </VStack>
          </Pressable>

          {/* Echo Count and Visibility */}
          <HStack className="flex-row items-center gap-2">
            <Text className="text-typography-900" size="md">
              {reflection.echoCount || "0"}
            </Text>
            {getIcon("echo", { fill: "#F8FAFC", width: 24, height: 24 })}
            {reflection.visibility === "private" && (
              <MaterialIcons name="lock" size={24} color="#F8FAFC" />
            )}
          </HStack>
        </HStack>
      </VStack>
    </View>
  );
};

export default EchoedReflectionCard;
