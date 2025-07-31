import React, { useEffect } from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useLocation } from "@/contexts/LocationContext";
import { PlaceDetails } from "@/lib/types";

interface LocationPickerProps {
  placeholder?: string;
  className?: string;
  initialLocation?: {
    lat: number;
    long: number;
    placeName?: string;
    formattedAddress?: string;
    placeId?: string;
  } | null;
  isEditing?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  placeholder = "Where are you thinking from?",
  className,
  initialLocation,
  isEditing = false,
}) => {
  const { selectedLocation, setSelectedLocation } = useLocation();

  // Set initial location if passed through
  useEffect(() => {
    if (initialLocation) {
      const placeDetails: PlaceDetails = {
        place_id: initialLocation.placeId || "",
        name: initialLocation.placeName || "Unknown Location",
        formatted_address: initialLocation.formattedAddress || "",
        geometry: {
          location: {
            lat: initialLocation.lat,
            lng: initialLocation.long,
          },
        },
        address_components: [],
      };
      setSelectedLocation(placeDetails);
    }
  }, [initialLocation, isEditing]); // Re-run when editing mode changes

  const handleLocationPress = () => {
    router.push("/(app)/locationsearch" as any);
  };

  if (selectedLocation) {
    return (
      <Pressable
        onPress={handleLocationPress}
        className={`border border-background-100 rounded-2xl p-4 ${className}`}
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
      className={`border border-background-100 rounded-2xl p-6 ${className}`}
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
