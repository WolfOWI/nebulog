import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useLocation } from "@/contexts/LocationContext";

interface LocationPickerProps {
  placeholder?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  placeholder = "Where are you thinking from?",
}) => {
  const { selectedLocation } = useLocation();

  const handleLocationPress = () => {
    router.push("/(app)/LocationSearch" as any);
  };

  if (selectedLocation) {
    return (
      <Pressable
        onPress={handleLocationPress}
        className="border border-border-200 rounded-lg p-4 bg-background-50 active:bg-background-100"
      >
        <HStack className="items-center gap-3">
          <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center">
            <MaterialIcons name="location-on" size={20} color="#6366f1" />
          </View>
          <VStack className="flex-1">
            <Text className="text-typography-900 font-medium" size="md">
              {selectedLocation.name}
            </Text>
            <Text className="text-typography-600" size="sm">
              {selectedLocation.formatted_address}
            </Text>
          </VStack>
          <MaterialIcons name="edit" size={20} color="#6B7280" />
        </HStack>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handleLocationPress}
      className="border-2 border-dashed border-border-300 rounded-lg p-6 bg-background-50 active:bg-background-100"
    >
      <VStack className="items-center gap-3">
        <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center">
          <MaterialIcons name="add-location" size={24} color="#6B7280" />
        </View>
        <VStack className="items-center">
          <Text className="text-typography-700 font-medium" size="md">
            Add Location
          </Text>
          <Text className="text-typography-500 text-center" size="sm">
            {placeholder}
          </Text>
        </VStack>
      </VStack>
    </Pressable>
  );
};

export default LocationPicker;
