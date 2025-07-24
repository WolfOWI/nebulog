import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { router } from "expo-router";
import { SafeAreaView, ScrollView, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import MapComponent from "@/components/map/Map";
import { Location as LocationType } from "@/lib/types";
import AvatarHoldBtn from "@/components/buttons/AvatarHoldBtn";

export default function Home() {
  // Bottom Sheet Ref, Snap Points, and Callbacks
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);
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

  const [location, setLocation] = useState<LocationType | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isReflectionPanelOpen, setIsReflectionPanelOpen] = useState(false);
  const mapRef = useRef<any>(null);

  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if (mapRef.current && mapRef.current.getCurrentLocation) {
        await mapRef.current.getCurrentLocation();
      }
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setIsLoadingLocation(false);
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
        />

        {/* Top overlay */}
        <SafeAreaView>
          <HStack className="absolute top-0 left-0 right-0 z-20 justify-end items-center mb-8 gap-4 px-4">
            <AvatarHoldBtn onHoldComplete={() => router.push("/MyProfile" as any)} />
          </HStack>
        </SafeAreaView>

        {/* Bottom overlay*/}
        <SafeAreaView className="absolute bottom-0 left-0 right-0 ">
          <VStack
            className="items-start pb-8 px-4"
            style={{ opacity: isReflectionPanelOpen ? 0 : 1 }}
          >
            <Button onPress={handleGetLocation} disabled={isLoadingLocation}>
              <ButtonText>{"My Location"}</ButtonText>
            </Button>

            <Button onPress={handlePresentModalPress} className="mt-4">
              <ButtonText>Bottom Sheet</ButtonText>
            </Button>
          </VStack>
        </SafeAreaView>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={1} // Default start at 50%
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          backdropComponent={renderBackdrop}
          backgroundStyle={{
            backgroundColor: "gray",
          }}
          handleIndicatorStyle={{
            backgroundColor: "#d1d5db",
          }}
          style={{ zIndex: 999 }}
        >
          <BottomSheetView className="flex-1 px-6 py-4">
            <VStack className="items-center mb-6">
              <Heading className="text-typography-900 text-2xl font-bold mb-2">
                Bottom Sheet
              </Heading>
              <Text className="text-typography-600 text-center mb-6">
                This is a beautiful bottom sheet that slides up from the bottom of the screen. You
                can drag it up and down, and tap outside to dismiss it.
              </Text>
            </VStack>

            <VStack className="gap-4">
              <Button onPress={handleDismiss} variant="outline">
                <ButtonText>Close Sheet</ButtonText>
              </Button>

              <HStack className="gap-3">
                <Button
                  onPress={() => bottomSheetRef.current?.snapToIndex(0)}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <ButtonText>25%</ButtonText>
                </Button>
                <Button
                  onPress={() => bottomSheetRef.current?.snapToIndex(1)}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <ButtonText>50%</ButtonText>
                </Button>
                <Button
                  onPress={() => bottomSheetRef.current?.snapToIndex(2)}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <ButtonText>90%</ButtonText>
                </Button>
              </HStack>
            </VStack>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
