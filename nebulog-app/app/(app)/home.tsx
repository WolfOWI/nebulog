import React, { useCallback, useRef, useState, useEffect } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View, Pressable, Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import MapComponent from "@/components/map/Map";
import { Location as LocationType, PlaceDetails } from "@/lib/types";
import AvatarHoldBtn from "@/components/buttons/AvatarHoldBtn";
import Toast from "react-native-toast-message";
import LaunchThoughtSwipeBtn from "@/components/buttons/LaunchThoughtSwipeBtn";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "@/contexts/UserContext";
import CircleHoldBtn from "@/components/buttons/CircleHoldBtn";
import CircularSwitchBtn from "@/components/buttons/CircularSwitchBtn";
import CircleHoldTextBtn from "@/components/buttons/CircleHoldTextBtn";
import { validateStreak } from "@/utils/streakUtility";
import { useLocation } from "@/contexts/LocationContext";
import { reverseGeocode } from "@/services/placesServices";

export default function Home() {
  const { user, validateAndUpdateStreak, refreshUserData } = useUser();
  const { setSelectedLocation } = useLocation();
  const insets = useSafeAreaInsets();

  // State for selected map location
  const [selectedMapLocation, setSelectedMapLocation] = useState<PlaceDetails | null>(null);

  // On mount, validate streak (only once)
  useEffect(() => {
    if (user?.id) {
      console.log("Home: User data on mount:", {
        id: user.id,
        streakCount: user.streakCount,
        lastReflectDate: user.lastReflectDate,
        totalReflections: user.totalReflections,
      });
      validateAndUpdateStreak();
    }
  }, [user?.id]);

  // Show streak status when returning to home screen
  useEffect(() => {
    if (user?.id && user?.lastReflectDate) {
      const { isValid, daysSinceLastReflection } = validateStreak(user.lastReflectDate);

      if (!isValid && daysSinceLastReflection > 1) {
        // Show warning if streak is broken
        setTimeout(() => {
          Toast.show({
            type: "warning",
            text1: "Streak Broken",
            text2: `It's been ${daysSinceLastReflection} days since your last reflection. Start a new streak today!`,
            position: "top",
            visibilityTime: 5000,
            autoHide: true,
            topOffset: 50,
          });
        }, 1000); // Delay a bit to avoid showing immediately
      }
    }
  }, [user?.id, user?.lastReflectDate]);

  // Show celebration when returning from reflection creation
  useEffect(() => {
    if (user?.streakCount && user?.streakCount > 1) {
      // Check if this is a recent streak increase
      const lastReflection = new Date(user.lastReflectDate || "");
      const now = new Date();
      const timeDiff = now.getTime() - lastReflection.getTime();

      // If the reflection was created in the last 5 minutes, show celebration
      if (timeDiff < 5 * 60 * 1000) {
        showStreakCelebration(user.streakCount);
      }
    }
  }, [user?.streakCount, user?.lastReflectDate]);

  // Bottom Sheet Ref, Snap Points, and Callbacks
  const bottomSheetRef = useRef<BottomSheet>(null);
  const handleSheetChanges = useCallback(
    (index: number) => {
      // console.log("handleSheetChanges", index);

      // Clear selected location when bottom sheet is closed (index = -1)
      if (index === -1 && selectedMapLocation) {
        setSelectedMapLocation(null);
      }
    },
    [selectedMapLocation]
  );
  const handlePresentModalPress = useCallback(() => {
    // Clear any selected location when opening the bottom sheet
    if (selectedMapLocation) {
      setSelectedMapLocation(null);
    }

    bottomSheetRef.current?.expand();
  }, [selectedMapLocation]);
  const handleDismiss = useCallback(() => {
    // Clear any selected location when dismissing the bottom sheet
    if (selectedMapLocation) {
      setSelectedMapLocation(null);
    }

    bottomSheetRef.current?.close();
  }, [selectedMapLocation]);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={1} appearsOnIndex={2} />,
    []
  );

  // Map Ref
  const mapRef = useRef<any>(null);

  // Reflection Panel State
  const [isReflectionPanelOpen, setIsReflectionPanelOpen] = useState(false);
  const [isRefreshingStreak, setIsRefreshingStreak] = useState(false);
  const [isLocationPanelOpen, setIsLocationPanelOpen] = useState(false);
  // Get Location of User
  const handleGetLocation = async () => {
    try {
      // Clear any selected location when user chooses to go to their current location
      if (selectedMapLocation) {
        setSelectedMapLocation(null);
      }

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
      // Clear any selected location when refreshing the map
      if (selectedMapLocation) {
        setSelectedMapLocation(null);
      }

      if (mapRef.current.refreshReflections) {
        await mapRef.current.refreshReflections();
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

  // Refresh streak data
  const handleRefreshStreak = async () => {
    try {
      setIsRefreshingStreak(true);
      console.log("Home: Refreshing streak, current user data:", {
        streakCount: user?.streakCount,
        lastReflectDate: user?.lastReflectDate,
        totalReflections: user?.totalReflections,
      });

      // First refresh user data from database
      await refreshUserData();

      // Then validate and update streak
      await validateAndUpdateStreak();

      // Show updated streak status
      if (user?.lastReflectDate) {
        const { isValid, daysSinceLastReflection } = validateStreak(user.lastReflectDate);
        console.log("Home: After refresh, streak validation:", {
          isValid,
          daysSinceLastReflection,
          currentStreakCount: user.streakCount,
        });

        if (isValid) {
          Toast.show({
            type: "success",
            text1: `${user.streakCount} Day Streak Active!`,
            text2: "Your streak is still going strong!",
            position: "top",
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 50,
          });
        } else {
          Toast.show({
            type: "warning",
            text1: "Streak Status Updated",
            text2: `It's been ${daysSinceLastReflection} days since your last reflection`,
            position: "top",
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 50,
          });
        }
      } else {
        Toast.show({
          type: "info",
          text1: "No Streak Yet",
          text2: "Post your first reflection to start building a streak!",
          position: "top",
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 50,
        });
      }
    } catch (error) {
      console.error("Error refreshing streak:", error);
      Toast.show({
        type: "error",
        text1: "Streak Update Failed",
        text2: "Please try again",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    } finally {
      setIsRefreshingStreak(false);
    }
  };

  // Show streak celebration message
  const showStreakCelebration = (newStreak: number) => {
    if (newStreak > 1) {
      Toast.show({
        type: "success",
        text1: `🔥 ${newStreak} Day Streak!`,
        text2: "Amazing! You're building a great habit!",
        position: "top",
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
    }
  };

  // Show current streak status
  const showStreakStatus = () => {
    if (!user?.lastReflectDate) {
      Toast.show({
        type: "info",
        text1: "No Streak Yet",
        text2: "Post your first reflection to start building a streak!",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
      return;
    }

    const { isValid, daysSinceLastReflection } = validateStreak(user.lastReflectDate);

    if (isValid) {
      const lastReflection = new Date(user.lastReflectDate);
      const today = new Date();
      const isToday = lastReflection.toDateString() === today.toDateString();

      Toast.show({
        type: "success",
        text1: `${user.streakCount} Day Streak Active!`,
        text2: isToday ? "You've already reflected today!" : "Keep the streak going!",
        position: "top",
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
    } else {
      Toast.show({
        type: "warning",
        text1: "Streak Broken",
        text2: `It's been ${daysSinceLastReflection} days since your last reflection. Start a new streak today!`,
        position: "top",
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 50,
      });
    }
  };

  // Handle Reflection Panel Change (close bottom sheet if open)
  const handleReflectionPanelChange = (isOpen: boolean) => {
    setIsReflectionPanelOpen(isOpen);
    if (isOpen) {
      // Clear any selected location when opening a reflection panel
      if (selectedMapLocation) {
        setSelectedMapLocation(null);
      }

      bottomSheetRef.current?.close();
    }
  };

  // Handle Location Panel Change (close bottom sheet if open)
  const handleLocationPanelChange = (isOpen: boolean) => {
    setIsLocationPanelOpen(isOpen);
    if (isOpen) {
      bottomSheetRef.current?.close();
    }

    // Clear selected location when location panel is closed
    if (!isOpen && selectedMapLocation) {
      setSelectedMapLocation(null);
    }
  };

  // Handle map tap to select location (only called for taps on empty map areas)
  const handleMapTap = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      const placeDetails = await reverseGeocode(latitude, longitude);

      if (placeDetails) {
        setSelectedMapLocation(placeDetails);

        // Center the map on the selected location
        if (mapRef.current && mapRef.current.centerMap) {
          mapRef.current.centerMap(latitude, longitude);
        }

        Toast.show({
          type: "info",
          text1: "Location Selected",
          text2: placeDetails.formatted_address || "Swipe to reflect here",
          position: "top",
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 50,
        });
      }
    } catch (error) {
      console.error("Error getting place details:", error);

      Toast.show({
        type: "error",
        text1: "Error Selecting Location.",
        text2: "Could not determine location details.",
        position: "top",
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 50,
      });
    }
  };

  // Clear selected location
  const clearSelectedLocation = () => {
    setSelectedMapLocation(null);
  };

  // Handle creating thought at selected location
  const handleCreateThoughtAtLocation = () => {
    if (!selectedMapLocation) return;

    // Set the selected location in context
    setSelectedLocation(selectedMapLocation);

    // Clear the selected map location
    setSelectedMapLocation(null);

    // Navigate to thought launch
    router.push("/thoughtlaunch" as any);
  };

  // useEffect(() => {
  //   console.log("selectedMapLocation", selectedMapLocation);
  // }, [selectedMapLocation]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-background-0 relative h-full w-full">
        <MapComponent
          ref={mapRef}
          className="absolute inset-0 z-0"
          onReflectionPanelChange={handleReflectionPanelChange}
          onMapTap={handleMapTap}
          onClearSelectedLocation={clearSelectedLocation}
          onCreateThought={handleCreateThoughtAtLocation}
          selectedLocation={selectedMapLocation}
          onLocationPanelChange={handleLocationPanelChange}
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
            iconName="radar"
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

            <AvatarHoldBtn
              onHoldComplete={() => {
                // Clear any selected location when navigating to profile
                if (selectedMapLocation) {
                  setSelectedMapLocation(null);
                }
                router.push("/myprofile" as any);
              }}
            />
          </HStack>
        </HStack>

        {/* Bottom Screen overlay*/}
        <HStack
          className="absolute bottom-0 left-0 right-0 items-end px-4 gap-8 justify-end"
          style={{
            paddingBottom: insets.bottom,
            opacity: isReflectionPanelOpen || isLocationPanelOpen ? 0 : 1,
          }}
        >
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
                onSwipeComplete={() => {
                  // Clear any selected location when launching thought from bottom sheet
                  if (selectedMapLocation) {
                    setSelectedMapLocation(null);
                  }
                  router.push("/thoughtlaunch" as any);
                }}
                iconName="rocket-launch"
                displayMessage="What's on your mind?"
              />
              <HStack className="w-full gap-2">
                <HStack className="flex-1 gap-2 items-center w-1/2 overflow-hidden">
                  <Pressable
                    onPress={handleRefreshStreak}
                    onLongPress={showStreakStatus}
                    disabled={isRefreshingStreak}
                  >
                    <View
                      className={`w-10 h-10 rounded-full flex justify-center items-center ${
                        isRefreshingStreak
                          ? "bg-slate-400"
                          : user?.lastReflectDate && validateStreak(user.lastReflectDate).isValid
                          ? "bg-green-500"
                          : "bg-slate-500"
                      }`}
                    >
                      {isRefreshingStreak ? (
                        <MaterialIcons name="refresh" size={24} color="#f8fafc" />
                      ) : (
                        <MaterialIcons name="sunny" size={24} color="#f8fafc" />
                      )}
                    </View>
                  </Pressable>
                  <VStack className="flex-1">
                    <Text
                      className="text-typography-900"
                      size="md"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {user?.streakCount || 0} day
                      {(user?.streakCount || 0) == 1 ? "" : "s"}
                    </Text>
                    {/* If user has reflected today, show "You've already reflected today!" */}
                    {user?.lastReflectDate && validateStreak(user.lastReflectDate).isValid && (
                      <Text
                        className="text-typography-600"
                        size="xs"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        You've reflected today!
                      </Text>
                    )}
                  </VStack>
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
