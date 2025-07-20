import React, { useState } from "react";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Link } from "expo-router";
import { SafeAreaView, ScrollView, Alert } from "react-native";
import * as Location from "expo-location";

interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  floor: number | null;
  isFromMockProvider: boolean;
}

export default function LocationPage() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        Alert.alert(
          "Permission Denied",
          "Location permission is required to get your GPS coordinates.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    } catch (err) {
      setError("Failed to request location permission");
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
      });

      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy || 0,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
        floor: (location.coords as any).floor || null,
        isFromMockProvider: (location.coords as any).isFromMockProvider || false,
      });
    } catch (err) {
      setError("Failed to get location");
      console.error("Location error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatLocation = (location: LocationData) => {
    const date = new Date(location.timestamp);
    return {
      coordinates: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
      altitude: location.altitude ? `${location.altitude.toFixed(1)}m` : "Not available",
      accuracy: `${location.accuracy.toFixed(1)}m`,
      altitudeAccuracy: location.altitudeAccuracy
        ? `${location.altitudeAccuracy.toFixed(1)}m`
        : "Not available",
      heading: location.heading ? `${location.heading.toFixed(1)}°` : "Not available",
      speed: location.speed ? `${(location.speed * 3.6).toFixed(1)} km/h` : "Not available",
      time: date.toLocaleTimeString(),
      floor: location.floor ? `${location.floor}` : "Not available",
      isMock: location.isFromMockProvider ? "Yes" : "No",
    };
  };

  const getHeadingDirection = (heading: number | null) => {
    if (heading === null) return "Not available";
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ScrollView>
        <VStack className="flex-1 px-6">
          {/* Header */}
          <HStack className="justify-between items-center mb-8">
            <Link href="/home" asChild>
              <Button variant="outline" size="sm">
                <ButtonText>← Back</ButtonText>
              </Button>
            </Link>
            <Link href="/profile" asChild>
              <Button variant="outline" size="sm">
                <ButtonText>Profile</ButtonText>
              </Button>
            </Link>
          </HStack>

          <VStack className="items-center mb-8">
            <Heading className="text-typography-900 text-3xl font-bold mb-2">
              📍 GPS Location
            </Heading>
            <Text className="text-typography-600 text-center">
              Get detailed location information from your device
            </Text>
          </VStack>

          {/* GPS Location Section */}
          <VStack className="rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
            <Heading className="text-typography-900 text-xl font-semibold mb-4">
              📍 GPS Location Data
            </Heading>

            <Button onPress={getCurrentLocation} disabled={loading} className="mb-4">
              <ButtonText>{loading ? "Getting Location..." : "Get Current Location"}</ButtonText>
            </Button>

            {error && <Text className="text-red-500 mb-4 text-center">{error}</Text>}

            {location && (
              <VStack className="space-y-3">
                <HStack className="justify-between items-center">
                  <Text className="text-typography-700 font-medium">Coordinates:</Text>
                  <Text className="text-typography-900 font-mono text-sm">
                    {formatLocation(location).coordinates}
                  </Text>
                </HStack>

                <HStack className="justify-between items-center">
                  <Text className="text-typography-700 font-medium">Altitude:</Text>
                  <Text className="text-typography-900">{formatLocation(location).altitude}</Text>
                </HStack>

                <HStack className="justify-between items-center">
                  <Text className="text-typography-700 font-medium">Accuracy:</Text>
                  <Text className="text-typography-900">{formatLocation(location).accuracy}</Text>
                </HStack>

                <HStack className="justify-between items-center">
                  <Text className="text-typography-700 font-medium">Altitude Accuracy:</Text>
                  <Text className="text-typography-900">
                    {formatLocation(location).altitudeAccuracy}
                  </Text>
                </HStack>

                <HStack className="justify-between items-center">
                  <Text className="text-typography-700 font-medium">Heading:</Text>
                  <Text className="text-typography-900">
                    {formatLocation(location).heading} ({getHeadingDirection(location.heading)})
                  </Text>
                </HStack>

                <HStack className="justify-between items-center">
                  <Text className="text-typography-700 font-medium">Speed:</Text>
                  <Text className="text-typography-900">{formatLocation(location).speed}</Text>
                </HStack>

                <HStack className="justify-between items-center">
                  <Text className="text-typography-700 font-medium">Floor:</Text>
                  <Text className="text-typography-900">{formatLocation(location).floor}</Text>
                </HStack>

                <HStack className="justify-between items-center">
                  <Text className="text-typography-700 font-medium">Mock Provider:</Text>
                  <Text className="text-typography-900">{formatLocation(location).isMock}</Text>
                </HStack>

                <HStack className="justify-between items-center">
                  <Text className="text-typography-700 font-medium">Time:</Text>
                  <Text className="text-typography-900">{formatLocation(location).time}</Text>
                </HStack>
              </VStack>
            )}
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
