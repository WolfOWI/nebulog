import React, { useState } from "react";
import { View, Pressable, Modal, FlatList } from "react-native";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { mood } from "@/constants/moods";
import { getMoodIcon } from "@/constants/moodIcons";
import { MaterialIcons } from "@expo/vector-icons";

interface MoodSelectorProps {
  selectedMood: string;
  onMoodChange: (mood: string) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedMoodData =
    selectedMood && selectedMood !== "unselected" ? mood[selectedMood as keyof typeof mood] : null;

  const moodEntries = Object.entries(mood).filter(([key]) => key !== "unselected");

  const handleSelectMood = (moodKey: string) => {
    onMoodChange(moodKey);
    setIsModalVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setIsModalVisible(true)}
        className="p-4 rounded-lg border border-typography-200 bg-background-0"
      >
        <HStack className="items-center gap-3">
          {selectedMoodData ? (
            <>
              {getMoodIcon(selectedMood, {
                fill: selectedMoodData.colorHex,
                width: 48,
                height: 48,
              })}
              <VStack className="flex-1">
                <Text className={`font-medium ${selectedMoodData.textColor}`} size="lg">
                  {selectedMoodData.spaceObject}
                </Text>
                <Text className="text-typography-600" size="sm">
                  {selectedMoodData.subemotions}
                </Text>
              </VStack>
            </>
          ) : (
            <>
              {getMoodIcon("unselected", {
                fill: "#6A7282",
                width: 48,
                height: 48,
              })}
              <VStack className="flex-1">
                <Text className="text-typography-400" size="lg">
                  Select your mood
                </Text>
                <Text className="text-typography-500" size="sm">
                  Choose how you're feeling
                </Text>
              </VStack>
            </>
          )}
          <MaterialIcons name="arrow-drop-down" size={24} color="#6B7280" />
        </HStack>
      </Pressable>

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
            className="bg-background-0 rounded-t-3xl max-h-[80%]"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="pt-4 pb-2">
              <View className="w-12 h-1 bg-typography-300 rounded-full self-center mb-4" />
              <Text className="text-typography-900 text-xl font-bold text-center mb-4">
                Select Your Mood
              </Text>
            </View>

            <FlatList
              data={moodEntries}
              keyExtractor={([key]) => key}
              renderItem={({ item: [key, moodData] }) => (
                <Pressable
                  onPress={() => handleSelectMood(key)}
                  className="px-6 py-4 border-b border-typography-100 active:bg-typography-50"
                >
                  <HStack className="items-center gap-4">
                    {getMoodIcon(key, {
                      fill: moodData.colorHex,
                      width: 40,
                      height: 40,
                    })}
                    <VStack className="flex-1">
                      <Text className={`font-medium ${moodData.textColor}`} size="md">
                        {moodData.spaceObject}
                      </Text>
                      <Text className="text-typography-600" size="sm">
                        {moodData.subemotions}
                      </Text>
                    </VStack>
                    {selectedMood === key && (
                      <MaterialIcons name="check" size={24} color={moodData.colorHex} />
                    )}
                  </HStack>
                </Pressable>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default MoodSelector;
