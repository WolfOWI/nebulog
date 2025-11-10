import React, { useState } from "react";
import { View, Pressable, Modal, Alert } from "react-native";
import { Text } from "@/components/ui/text";
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
import { router } from "expo-router";

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

interface MyReflectionCardProps {
  reflection: Reflection;
  onDelete: (reflectionId: string) => void;
}

const MyReflectionCard: React.FC<MyReflectionCardProps> = ({ reflection, onDelete }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  if (!reflection) return null;

  const reflectionMood = reflection.mood?.toLowerCase() || "unselected";
  const moodData = mood[reflectionMood as keyof typeof mood] || mood.unselected;

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Reflection",
      "Are you sure you want to delete this reflection? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(reflection.id || "");
            setIsModalVisible(false);
          },
        },
      ]
    );
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
        <HStack className="flex-row justify-between items-center">
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
          <Pressable onPress={() => setIsModalVisible(true)}>
            <MaterialIcons name="more-vert" size={24} color="#F8FAFC" />
          </Pressable>
        </HStack>
        <Text className="text-typography-900" size="md">
          {moodData?.subemotions || "Unselected Mood"}
        </Text>
        <Text className="text-typography-600 " size="md">
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
        <HStack className="flex-row justify-between items-center">
          <Text className="text-typography-600" size="sm">
            {reflection.createdAt ? dayjs(reflection.createdAt).fromNow() : "Some time ago"}
          </Text>
          {reflection.visibility === "public" ? (
            <HStack className="flex-row items-center gap-2">
              <Text className="text-typography-900" size="md">
                {reflection.echoCount || "0"}
              </Text>
              {getIcon("echo", { fill: "#F8FAFC", width: 24, height: 24 })}
            </HStack>
          ) : (
            <MaterialIcons name="lock" size={24} color="#F8FAFC" />
          )}
        </HStack>
      </VStack>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setIsModalVisible(false)}
        >
          <Pressable
            className="bg-background-100 rounded-t-3xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="pt-4 pb-2">
              <View className="w-12 h-1 bg-typography-300 rounded-full self-center mb-4" />
            </View>

            <VStack className="pb-6">
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: "/(app)/editreflection",
                    params: { reflection: JSON.stringify(reflection) },
                  } as any);
                  setIsModalVisible(false);
                }}
                className="px-6 py-4 active:bg-typography-50"
              >
                <HStack className="items-center gap-4">
                  <MaterialIcons name="edit" size={24} color="#F8FAFC" />
                  <Text className="text-typography-900" size="lg">
                    Edit
                  </Text>
                </HStack>
              </Pressable>

              <Pressable onPress={handleDeletePress} className="px-6 py-4 active:bg-typography-50">
                <HStack className="items-center gap-4">
                  <MaterialIcons name="delete" size={24} color="#EF4444" />
                  <Text className="text-red-500" size="lg">
                    Delete
                  </Text>
                </HStack>
              </Pressable>
            </VStack>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default MyReflectionCard;
