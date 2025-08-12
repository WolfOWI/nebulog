import { View, ScrollView, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import React, { useEffect, useState } from "react";
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
import CircularSwitchBtn from "@/components/buttons/CircularSwitchBtn";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { mood } from "@/constants/moods";
import { getMoodIcon } from "@/constants/moodIcons";
import LocationPicker from "@/components/LocationPicker";
import { useLocation } from "@/contexts/LocationContext";
import { updateReflection, deleteReflection } from "@/services/reflectionServices";
import { useUser } from "@/contexts/UserContext";
import { Reflection } from "@/lib/types";
import { geohashForLocation } from "geofire-common";

const EditReflection = () => {
  const { user } = useUser();
  const { selectedLocation } = useLocation();
  const params = useLocalSearchParams();

  // Get reflection data from params
  const reflectionData = params.reflection
    ? (JSON.parse(params.reflection as string) as Reflection)
    : null;

  const [selectedMood, setSelectedMood] = useState<string>(reflectionData?.mood || "unselected");
  const [comment, setComment] = useState(reflectionData?.text || "");
  const [isPublic, setIsPublic] = useState(reflectionData?.visibility === "public");
  const [isLocationOn, setIsLocationOn] = useState(!!reflectionData?.location);
  const [originalLocation, setOriginalLocation] = useState(reflectionData?.location || null);
  const { setSelectedLocation } = useLocation();

  // If location is off, set public to off
  useEffect(() => {
    if (!isLocationOn && isPublic) {
      setIsPublic(false);
    }
  }, [isLocationOn]);

  // Location must be on for public reflections
  useEffect(() => {
    if (!isLocationOn && isPublic) {
      setIsLocationOn(true);
    }
  }, [isPublic]);

  // Clear location context when leaving the page
  useEffect(() => {
    return () => {
      // Clear location when component unmounts
      setSelectedLocation(null);
    };
  }, [setSelectedLocation]);

  const handleUpdate = async () => {
    if (!user?.id || !reflectionData?.id) {
      throw new Error("User ID or reflection ID not found");
    }

    if (!selectedLocation && isLocationOn) {
      throw new Error("No location selected");
    }

    const updates = {
      text: comment,
      visibility: (isPublic ? "public" : "private") as "public" | "private",
      ...(isLocationOn &&
        selectedLocation && {
          location: {
            lat: selectedLocation.geometry.location.lat,
            long: selectedLocation.geometry.location.lng,
            placeName: selectedLocation.name,
            formattedAddress: selectedLocation.formatted_address,
            placeId: selectedLocation.place_id,
            geohash: geohashForLocation([
              selectedLocation.geometry.location.lat,
              selectedLocation.geometry.location.lng,
            ]),
          },
        }),
      ...(isLocationOn &&
        !selectedLocation &&
        reflectionData.location && {
          location: {
            ...reflectionData.location,
            geohash:
              reflectionData.location.geohash ||
              geohashForLocation([reflectionData.location.lat, reflectionData.location.long]),
          },
        }),
      mood: selectedMood,
    };

    console.log("Reflection updates:", updates);

    try {
      await updateReflection(reflectionData.id, updates);
      router.push("/(app)/myprofile" as any);

      // TODO: Add toast notification for success
    } catch (error) {
      console.error("Error updating reflection:", error);
      // TODO: Add toast notification for error
    }
  };

  const selectedMoodData = selectedMood ? mood[selectedMood as keyof typeof mood] : null;

  if (!reflectionData) {
    return (
      <SafeAreaView className="flex-1 bg-background-0">
        <View className="flex-1 items-center justify-center">
          <Text className="text-typography-600">Reflection not found</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              Edit Reflection
            </Heading>
          </VStack>

          {/* Mood Selector */}
          <VStack className="gap-3">
            <Select selectedValue={selectedMood} onValueChange={setSelectedMood}>
              <SelectTrigger className="p-4 h-fit">
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
            <Textarea className="h-[200px]">
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

          {isLocationOn ? (
            <LocationPicker initialLocation={originalLocation} isEditing={true} />
          ) : (
            <View className="h-16 items-center justify-center">
              <Text className="text-typography-500">No Location</Text>
            </View>
          )}

          {/* Circular Switch Buttons */}
          <HStack className="justify-center gap-6">
            <CircularSwitchBtn
              isOn={isPublic}
              onToggle={setIsPublic}
              onText="Public"
              offText="Private"
              size={104}
            />
            <CircularSwitchBtn
              isOn={isLocationOn}
              onToggle={setIsLocationOn}
              onText="Location"
              offText="Hidden"
              size={104}
            />
          </HStack>

          <View className="h-16" />
        </VStack>
      </ScrollView>

      {/* Action Buttons */}
      <View className="m-4">
        {/* Update Button */}
        <LaunchButton
          iconName="radar"
          onLaunch={handleUpdate}
          label="Transmit Changes"
          holdDuration={2000}
          size={88}
          fillColor="#3730a3"
        />
      </View>
    </SafeAreaView>
  );
};

export default EditReflection;
