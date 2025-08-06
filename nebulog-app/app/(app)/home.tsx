import React, { useCallback, useRef, useState, useEffect } from "react";
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

  // Get Location of User
  const handleGetLocation = async () => {
    try {
      if (mapRef.current.getCurrentLocation) {
        await mapRef.current.getCurrentLocation();
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  // Refresh map
  const handleRefreshMap = async () => {
    try {
      if (mapRef.current.refreshReflections) {
        await mapRef.current.refreshReflections();
        Toast.show({
          type: "success",
          text1: "Map Refreshed",
          text2: "Reflections updated successfully",
        });
      }
    } catch (error) {
      console.error("Error refreshing map:", error);
      Toast.show({
        type: "error",
        text1: "Map Refresh Failed",
        text2: "Please try again",
      });
    }
  };

  // Handle Reflection Panel Change (close bottom sheet if open)
  const handleReflectionPanelChange = (isOpen: boolean) => {
    setIsReflectionPanelOpen(isOpen);
    if (isOpen) {
      bottomSheetRef.current?.close();
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-background-0 relative h-full w-full">
        <MapComponent
          ref={mapRef}
          showUserLocation={true}
          className="absolute inset-0 z-0"
          onReflectionPanelChange={handleReflectionPanelChange}
        />

        {/* Top Screen overlay */}
        <HStack
          className="absolute top-0 left-0 right-0 z-20 justify-between items-center px-4"
          style={{ paddingTop: insets.top }}
        >
          {/* Refresh button */}
          <CircleHoldBtn
            onHoldComplete={handleRefreshMap}
            holdDuration={300}
            iconName="refresh"
            size="medium"
          />

          {/* Location and Profile buttons */}
          <HStack className="gap-4 items-center">
            <CircleHoldBtn
              onHoldComplete={handleGetLocation}
              holdDuration={300}
              iconName="location-pin"
              size="large"
            />

            <AvatarHoldBtn onHoldComplete={() => router.push("/myprofile" as any)} />
          </HStack>
        </HStack>

        {/* Bottom Screen overlay*/}
        <HStack
          className="absolute bottom-0 left-0 right-0 items-end px-4 gap-8 justify-end"
          style={{
            paddingBottom: insets.bottom,
            opacity: isReflectionPanelOpen ? 0 : 1,
          }}
        >
          {/* TODO: Add a switch to toggle between my reflections and all reflections */}
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
