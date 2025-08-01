import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import MapComponent from "@/components/map/Map";
import { Location as LocationType } from "@/lib/types";
import AvatarHoldBtn from "@/components/buttons/AvatarHoldBtn";
import Toast from "react-native-toast-message";
import LaunchThoughtSwipeBtn from "@/components/buttons/LaunchThoughtSwipeBtn";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "@/contexts/UserContext";
import CircleHoldBtn from "@/components/buttons/CircleHoldBtn";
import CircularSwitchBtn from "@/components/buttons/CircularSwitchBtn";
import { getReflectionsForUser } from "@/services/reflectionServices";
import { Reflection } from "@/lib/types";

const tempFakeReflectionData: Reflection[] = [
  {
    id: "1",
    authorId: "user1",
    text: "Today I witnessed the most amazing sunrise. The way the light hit the buildings created such a peaceful atmosphere. It reminded me to appreciate the simple moments in life.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 + 0.001,
      long: 28.342688891941343 + 0.001,
      placeName: "City Skyline",
    },
    mood: "Joy",
    createdAt: new Date(1705296600 * 1000).toISOString(), // 2024-01-15 06:30
    echoCount: 5,
  },
  {
    id: "2",
    authorId: "user2",
    text: "Walking through the park today, I noticed how the trees sway in the wind. Nature has its own rhythm, and it's so calming to just observe and be present.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 - 0.002,
      long: 28.342688891941343 - 0.001,
      placeName: "Central Park",
    },
    mood: "Gratitude",
    createdAt: new Date(1705232700 * 1000).toISOString(), // 2024-01-14 15:45
    echoCount: 3,
  },
  {
    id: "3",
    authorId: "user3",
    text: "Sometimes the best conversations happen in coffee shops. Today I overheard someone talking about their dreams, and it made me think about my own aspirations.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 + 0.003,
      long: 28.342688891941343 - 0.002,
      placeName: "Downtown Coffee Shop",
    },
    mood: "Growth",
    createdAt: new Date(1705134000 * 1000).toISOString(), // 2024-01-13 10:20
    echoCount: 7,
  },
  {
    id: "4",
    authorId: "user4",
    text: "The stars tonight are incredible. Looking up at the vast universe makes me feel both small and connected to something much larger than myself.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 - 0.001,
      long: 28.342688891941343 + 0.003,
      placeName: "Observatory Hill",
    },
    mood: "Connection",
    createdAt: new Date(1705086900 * 1000).toISOString(), // 2024-01-12 21:15
    echoCount: 4,
  },
  {
    id: "5",
    authorId: "user5",
    text: "Sitting by the lake, watching the water ripple. There's something so peaceful about being still and just observing the world around me.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 + 0.002,
      long: 28.342688891941343 + 0.002,
      placeName: "Lakeside Bench",
    },
    mood: "Stillness",
    createdAt: new Date(1705003200 * 1000).toISOString(), // 2024-01-11 18:00
    echoCount: 6,
  },
  {
    id: "6",
    authorId: "user6",
    text: "The museum exhibit on space exploration left me in complete awe. The scale of our universe is mind-boggling and beautiful.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 - 0.003,
      long: 28.342688891941343 + 0.001,
      placeName: "Science Museum",
    },
    mood: "Wonder",
    createdAt: new Date(1704919500 * 1000).toISOString(), // 2024-01-10 14:45
    echoCount: 8,
  },
  {
    id: "7",
    authorId: "user7",
    text: "Traffic was unbearable today. I can't believe how inconsiderate some drivers can be. This city needs better infrastructure.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 + 0.001,
      long: 28.342688891941343 - 0.003,
      placeName: "Main Street",
    },
    mood: "Anger",
    createdAt: new Date(1704835800 * 1000).toISOString(), // 2024-01-09 11:30
    echoCount: 2,
  },
  {
    id: "8",
    authorId: "user8",
    text: "I feel so overwhelmed with everything happening. Work, personal life, everything feels like it's spinning out of control.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 - 0.002,
      long: 28.342688891941343 + 0.002,
      placeName: "Office Building",
    },
    mood: "Turbulence",
    createdAt: new Date(1704752100 * 1000).toISOString(), // 2024-01-08 16:15
    echoCount: 1,
  },
  {
    id: "9",
    authorId: "user9",
    text: "The rain today matches my mood perfectly. Sometimes it's okay to feel sad and let the weather reflect what's inside.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 + 0.003,
      long: 28.342688891941343 + 0.001,
      placeName: "Rainy Street Corner",
    },
    mood: "Sadness",
    createdAt: new Date(1704668400 * 1000).toISOString(), // 2024-01-07 13:00
    echoCount: 3,
  },
  {
    id: "10",
    authorId: "user10",
    text: "It's been a year since we lost her. The emptiness never really goes away, but I'm learning to carry it with me.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 - 0.001,
      long: 28.342688891941343 - 0.002,
      placeName: "Memorial Garden",
    },
    mood: "Grief",
    createdAt: new Date(1704584700 * 1000).toISOString(), // 2024-01-06 09:45
    echoCount: 0,
  },
  {
    id: "11",
    authorId: "user11",
    text: "I don't know where I'm going or what I'm doing. Everything feels directionless and I'm not sure how to find my way.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 + 0.002,
      long: 28.342688891941343 - 0.001,
      placeName: "Unknown Path",
    },
    mood: "Lost",
    createdAt: new Date(1704501000 * 1000).toISOString(), // 2024-01-05 20:30
    echoCount: 1,
  },
  {
    id: "12",
    authorId: "user12",
    text: "Sometimes I just need to pause and reflect without any specific emotion. Just being present in this moment.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 - 0.003,
      long: 28.342688891941343 - 0.003,
      placeName: "Quiet Corner",
    },
    mood: "Unselected",
    createdAt: new Date(1704417300 * 1000).toISOString(), // 2024-01-04 17:15
    echoCount: 2,
  },
];

export default function Home() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  // Bottom Sheet Ref, Snap Points, and Callbacks
  const bottomSheetRef = useRef<BottomSheet>(null);
  const handleSheetChanges = useCallback((index: number) => {
    // console.log("handleSheetChanges", index);
  }, []);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);
  const handleDismiss = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={1} appearsOnIndex={2} />,
    []
  );

  // Map Ref
  const mapRef = useRef<any>(null);

  // Reflection Panel State
  const [isReflectionPanelOpen, setIsReflectionPanelOpen] = useState(false);

  // Get Location
  const handleGetLocation = async () => {
    try {
      if (mapRef.current.getCurrentLocation) {
        await mapRef.current.getCurrentLocation();
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-background-0 relative h-full w-full">
        <MapComponent
          ref={mapRef}
          showUserLocation={true}
          className="absolute inset-0 z-0"
          onReflectionPanelChange={setIsReflectionPanelOpen}
          markers={tempFakeReflectionData
            .filter((reflection) => reflection.id && reflection.location)
            .map((reflection) => ({
              id: reflection.id!,
              coordinate: {
                latitude: reflection.location!.lat,
                longitude: reflection.location!.long,
              },
              reflection: reflection,
            }))}
        />

        {/* Top Screen overlay */}
        <HStack
          className="absolute top-0 left-0 right-0 z-20 justify-end items-center gap-4 px-4"
          style={{ paddingTop: insets.top }}
        >
          <CircleHoldBtn
            onHoldComplete={handleGetLocation}
            holdDuration={300}
            iconName="location-pin"
            size="large"
          />

          <AvatarHoldBtn onHoldComplete={() => router.push("/myprofile" as any)} />
        </HStack>

        {/* Bottom Screen overlay*/}
        <HStack
          className="absolute bottom-0 left-0 right-0 items-end px-4 gap-8 justify-end"
          style={{
            paddingBottom: insets.bottom,
            opacity: isReflectionPanelOpen ? 0 : 1,
          }}
        >
          <CircularSwitchBtn
            onToggle={() => {
              console.log("pressed");
            }}
            onText="Me"
            offText="All"
            size={56}
          />
          <CircleHoldBtn
            onHoldComplete={handlePresentModalPress}
            holdDuration={300}
            iconName="arrow-upward"
            size="large"
          />
        </HStack>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          backdropComponent={renderBackdrop}
          backgroundStyle={{
            backgroundColor: "#1e293b",
          }}
          handleIndicatorStyle={{
            backgroundColor: "#475569",
          }}
          style={{ zIndex: 999 }}
        >
          <BottomSheetView className="flex-1 px-6 pt-4 pb-8">
            <VStack className="items-center mb-6 gap-6">
              <LaunchThoughtSwipeBtn
                onSwipeComplete={() => router.push("/thoughtlaunch" as any)}
                iconName="rocket-launch"
                displayMessage="What's on your mind?"
              />
              <HStack className="w-full gap-2">
                <HStack className="flex-1 gap-2 items-center w-1/2 overflow-hidden">
                  <View className="bg-slate-500 w-10 h-10 rounded-full flex justify-center items-center">
                    <MaterialIcons name="sunny" size={24} color="#f8fafc" />
                  </View>
                  <Text
                    className="text-typography-900"
                    size="md"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {user?.streakCount} days
                  </Text>
                </HStack>
                <HStack className="flex-1 gap-2 items-center w-1/2 overflow-hidden">
                  <View className="bg-slate-500 w-10 h-10 rounded-full flex justify-center items-center">
                    <MaterialCommunityIcons name="thought-bubble" size={24} color="#f8fafc" />
                  </View>
                  <Text
                    className="text-typography-900"
                    size="md"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {user?.totalReflections} thoughts
                  </Text>
                </HStack>
              </HStack>
            </VStack>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
