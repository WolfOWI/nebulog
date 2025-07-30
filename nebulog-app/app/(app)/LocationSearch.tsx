import React, { useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { searchPlaces, getPlaceDetails } from "@/services/placesServices";
import { Place } from "@/lib/types";
import { useLocation } from "@/contexts/LocationContext";
import LeftwardSwipeBtn from "@/components/buttons/LeftwardSwipeBtn";

const LocationSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { setSelectedLocation } = useLocation();

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) return;

    setIsSearching(true);
    const results = await searchPlaces(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleLocationSelect = async (place: Place) => {
    const details = await getPlaceDetails(place.place_id);
    if (details) {
      // Set the selected location in context
      setSelectedLocation(details);
      // Navigate back to ThoughtLaunch
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <View className="m-4">
        <LeftwardSwipeBtn
          onSwipeComplete={() => router.back()}
          iconName="close"
          touchMessage="Swipe to Cancel"
        />
      </View>

      <VStack className="flex-1 px-6 gap-6">
        {/* Header */}
        <VStack className="items-center">
          <Heading className="text-typography-900 text-2xl font-bold mb-2">Set Location</Heading>
          <Text className="text-typography-600 text-center">
            Find a place or address for your thought.
          </Text>
        </VStack>

        {/* Search Input */}
        <VStack className="gap-3">
          <HStack className="gap-3">
            <Input className="flex-1 border border-border-200 rounded-lg p-4 bg-background-50 h-fit">
              <InputField
                placeholder="Search for a location..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="text-typography-900"
                onSubmitEditing={handleSearch}
              />
            </Input>
            <Pressable
              onPress={handleSearch}
              disabled={isSearching || searchQuery.trim().length < 3}
              className={`px-4 py-4 rounded-lg ${
                isSearching || searchQuery.trim().length < 3 ? "bg-gray-300" : "bg-indigo-600"
              }`}
            >
              <MaterialIcons
                name="search"
                size={24}
                color={isSearching || searchQuery.trim().length < 3 ? "#9CA3AF" : "#FFFFFF"}
              />
            </Pressable>
          </HStack>
        </VStack>

        {/* Results */}
        {isSearching && (
          <VStack className="items-center py-8">
            <Text className="text-typography-600">Searching...</Text>
          </VStack>
        )}

        {!isSearching && searchResults.length > 0 && (
          <VStack className="flex-1">
            <Text className="text-typography-700 font-medium mb-3">
              {searchResults.length} results found
            </Text>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleLocationSelect(item)}
                  className="p-4 border border-border-200 rounded-lg mb-3 active:bg-background-50"
                >
                  <VStack className="gap-1">
                    <Text className="text-typography-900 font-medium">
                      {item.structured_formatting.main_text}
                    </Text>
                    <Text className="text-typography-600 text-sm">
                      {item.structured_formatting.secondary_text}
                    </Text>
                  </VStack>
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
            />
          </VStack>
        )}

        {!isSearching && searchQuery.trim().length >= 3 && searchResults.length === 0 && (
          <VStack className="items-center py-8">
            <Text className="text-typography-600">No locations found</Text>
            <Text className="text-typography-500 text-sm text-center mt-2">
              Try a different search term or check your spelling
            </Text>
          </VStack>
        )}
      </VStack>
    </SafeAreaView>
  );
};

export default LocationSearch;
