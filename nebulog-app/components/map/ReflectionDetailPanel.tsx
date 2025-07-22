import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { BlurView } from "expo-blur";
import { HStack } from "../ui/hstack";
import { getMoodIcon } from "@/constants/moodIcons";
import { mood } from "@/constants/moods";

interface Reflection {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  mood: string;
  tags: string[];
}

interface ReflectionDetailPanelProps {
  reflection: Reflection | null;
  onClose: () => void;
}

const ReflectionDetailPanel: React.FC<ReflectionDetailPanelProps> = ({ reflection, onClose }) => {
  if (!reflection) return null;

  return (
    <BlurView
      intensity={20}
      className="absolute bottom-0 left-0 right-0 p-6 mx-6 mb-8 rounded-3xl overflow-hidden border border-pink-500"
    >
      <View className="flex-row justify-between items-center mb-4">
        <HStack className="gap-2">
          {getMoodIcon(reflection.mood)({})}
          <Text className="text-2xl font-bold">{reflection.title}</Text>
        </HStack>
        <Button
          onPress={onClose}
          className="p-2 bg-slate-400 rounded-lg w-8 h-8 justify-center items-center"
        >
          <Text>✕</Text>
        </Button>
      </View>
      <Text className="text-sm text-slate-400">{reflection.timestamp}</Text>
      <Text className="text-sm text-slate-400">Mood: {reflection.mood}</Text>
      {mood[reflection.mood as keyof typeof mood] && (
        <Text className="text-sm text-slate-400">
          Subemotions: {mood[reflection.mood as keyof typeof mood].subemotions}
        </Text>
      )}
      <Text className="text-base">{reflection.content}</Text>
      <View className="flex-row flex-wrap gap-2">
        {reflection.tags.map((tag: string, index: number) => (
          <View key={index} className="bg-gray-100 rounded-lg px-2 py-1">
            <Text className="text-sm text-slate-400">#{tag}</Text>
          </View>
        ))}
      </View>
    </BlurView>
  );
};

export default ReflectionDetailPanel;
