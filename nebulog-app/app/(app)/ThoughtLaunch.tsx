import { View, Text, ScrollView, Pressable } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
} from "@/components/ui/select";
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import CircleHoldBtn from "@/components/buttons/CircleHoldBtn";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";
import LaunchButton from "@/components/buttons/LaunchButton";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { mood } from "@/constants/moods";
import { getMoodIcon } from "@/constants/moodIcons";
import LocationPicker from "@/components/LocationPicker";
import { useLocation } from "@/contexts/LocationContext";

const ThoughtLaunch = () => {
  const [selectedMood, setSelectedMood] = useState<string>("unselected");
  const [comment, setComment] = useState("");
  const { selectedLocation } = useLocation();

  const handleLaunch = () => {
    // TODO: Implement launch logic
    console.log("Launching thought:", { selectedMood, comment, location: selectedLocation });
    router.push("/(app)/Home" as any);
  };

  const selectedMoodData = selectedMood ? mood[selectedMood as keyof typeof mood] : null;

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <View className="m-4">
        <LeftwardSwipeBtn
          onSwipeComplete={() => router.back()}
          iconName="close"
          touchMessage="Swipe to Cancel"
        />
      </View>

      <ScrollView className="flex-1 px-6">
        <VStack className="flex-1 gap-6">
          {/* Title */}
          <VStack className="items-center">
            <Heading className="text-typography-900 text-2xl font-bold mb-2">
              Launch A Thought
            </Heading>
            <Text className="text-typography-600 text-center">
              Share your reflection with the universe.
            </Text>
          </VStack>

          {/* Mood Selector */}
          <VStack className="gap-3">
            <Text className="text-typography-700 font-medium">How are you feeling?</Text>

            <Select selectedValue={selectedMood} onValueChange={setSelectedMood}>
              <SelectTrigger className="border border-border-200 rounded-lg p-4 bg-background-50 h-fit">
                <HStack className="items-center gap-3">
                  {selectedMoodData ? (
                    <>
                      {getMoodIcon(selectedMood, {
                        fill: selectedMoodData.colorHex,
                        width: 48,
                        height: 48,
                      })}
                      <VStack className="flex-1">
                        <Text className={`text-lg font-medium ${selectedMoodData.textColor}`}>
                          {selectedMoodData.spaceObject}
                        </Text>
                        <Text className="text-typography-600 text-sm">
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
                        <Text className="text-typography-400 text-lg">Select your mood</Text>
                        <Text className="text-typography-500 text-sm">
                          Choose how you're feeling
                        </Text>
                      </VStack>
                    </>
                  )}
                  <MaterialIcons name="arrow-drop-down" size={24} color="#6B7280" />
                </HStack>
              </SelectTrigger>

              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>

                  {Object.entries(mood).map(([key, moodData]) => (
                    <SelectItem key={key} label={moodData.spaceObject} value={key}>
                      <Text className={`font-medium ${moodData.textColor}`}>
                        {moodData.spaceObject}
                      </Text>
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </VStack>

          {/* Comment Text Field */}
          <VStack className="gap-3">
            <Textarea className="border border-border-200 rounded-lg h-[200px]">
              <TextareaInput
                placeholder="What is on your mind?"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={10}
                className="text-typography-900"
                textAlignVertical="top"
              />
            </Textarea>
          </VStack>

          {/* Location Selector */}
          <VStack className="gap-3">
            <Text className="text-typography-700 font-medium">Location</Text>
            <LocationPicker />
          </VStack>

          {/* Launch Button */}
          <VStack className="mt-8 mb-8">
            <LaunchButton
              iconName="rocket-launch"
              onLaunch={handleLaunch}
              label="Hold to Launch Thought"
              holdDuration={2000}
              size={88}
              fillColor="#3730a3"
            />
          </VStack>
        </VStack>
        <VStack className="h-64" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ThoughtLaunch;
