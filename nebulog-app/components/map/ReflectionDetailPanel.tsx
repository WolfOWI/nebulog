import React from "react";
import { View, StyleSheet } from "react-native";
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

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

interface ReflectionDetailPanelProps {
  reflection: Reflection | null;
  onClose: () => void;
}

const ReflectionDetailPanel: React.FC<ReflectionDetailPanelProps> = ({ reflection, onClose }) => {
  if (!reflection) return null;

  const reflectionMood = reflection.mood?.toLowerCase() || "unselected";
  const moodData = mood[reflectionMood as keyof typeof mood] || mood.unselected;
  const shadowColor = moodData?.shadowColor || "shadow-slate-200/50";

  return (
    <View className={`shadow-lg ${shadowColor}`}>
      <BlurView
        intensity={20}
        className={`absolute bottom-0 left-0 right-0 p-6 mx-6 mb-8 rounded-3xl overflow-hidden border ${moodData?.borderColor}`}
      >
        <VStack className="gap-2 ">
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
            <Button
              onPress={onClose}
              className="p-2 bg-slate-400 rounded-lg w-8 h-8 justify-center items-center"
            ></Button>
          </HStack>
          <Text className="text-typography-900" size="md">
            {moodData?.subemotions || "Unselected Mood"}
          </Text>
          <Text className="text-typography-700" size="lg">
            {reflection.text}
          </Text>
          <Text className="text-typography-600" size="sm">
            {reflection.location?.placeName || "Unknown Location"}
          </Text>
          <Divider className="my-2" />
          <Text className="text-typography-600" size="sm">
            {reflection.authorId || "Someone"}
            {/* TODO: Add author name */}
          </Text>
          <HStack className="flex-row justify-between items-center">
            <Text className="text-typography-600" size="sm">
              {reflection.createdAt ? dayjs(reflection.createdAt).fromNow() : "Some time ago"}
            </Text>
            <HStack className="flex-row items-center gap-2">
              <Text className="text-typography-900" size="md">
                {reflection.echoCount || "0"}
              </Text>
              {getIcon("echo", { fill: "#F8FAFC", width: 24, height: 24 })}
            </HStack>
          </HStack>
        </VStack>
      </BlurView>
    </View>
  );
};

export default ReflectionDetailPanel;
