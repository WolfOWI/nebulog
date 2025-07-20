import React, { useCallback, useMemo, useRef } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Link } from "expo-router";
import { SafeAreaView, ScrollView, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";

export default function Home() {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-background-0">
        <ScrollView>
          <VStack className="flex-1 px-6">
            {/* Header */}
            <HStack className="justify-end items-center mb-8 gap-4">
              <Link href="/location" asChild>
                <Button variant="outline" size="sm">
                  <ButtonText>📍 Location</ButtonText>
                </Button>
              </Link>
              <Link href="/profile" asChild>
                <Button variant="outline" size="sm">
                  <ButtonText>Profile</ButtonText>
                </Button>
              </Link>
              <Link href="/" asChild>
                <Button variant="outline" size="sm">
                  <ButtonText>Log Out</ButtonText>
                </Button>
              </Link>
            </HStack>

            <VStack className="items-center mb-8">
              <Heading className="text-typography-900 text-3xl font-bold mb-2">Home</Heading>

              {/* Button to open bottom sheet */}
              <Button onPress={handlePresentModalPress} className="mt-4" size="lg">
                <ButtonText>Open Bottom Sheet</ButtonText>
              </Button>
            </VStack>
          </VStack>
        </ScrollView>

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
