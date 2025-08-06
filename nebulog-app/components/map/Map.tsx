import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { VStack } from "@/components/ui/vstack";
import { customMapStyle } from "@/styles/mapStyles";
import ReflectionDetailPanel from "./ReflectionDetailPanel";
import { Reflection } from "@/lib/types";
import { getCurrentLocation } from "@/services/locationServices";
import { getPublicReflectionsInRadius } from "@/services/reflectionServices";
import { useUser } from "@/contexts/UserContext";
import Toast from "react-native-toast-message";
import { getMoodIcon, MoodIcons } from "@/constants/moodIcons";
import { mood } from "@/constants/moods";

interface MapComponentProps {
  initialRegion?: Region;
  showUserLocation?: boolean;
  markers?: Array<{
    id: string;
    coordinate: {
      latitude: number;
      longitude: number;
    };
    title?: string;
    description?: string;
    reflection?: Reflection;
  }>;
  onMarkerPress?: (marker: any) => void;
  onRegionChange?: (region: Region) => void;
  onReflectionPanelChange?: (isOpen: boolean) => void;
  className?: string;
  ref?: React.Ref<any>;
}

const MapComponent = ({
  initialRegion,
  showUserLocation = true,
  onMarkerPress,
  onRegionChange,
  onReflectionPanelChange,
  className,
  ref,
}: MapComponentProps) => {
  const { user } = useUser();
  const mapRef = useRef<MapView>(null);
  const currentRegionRef = useRef<Region | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [maySearchForReflections, setMaySearchForReflections] = useState(true);
  const [mayAnimateToUserLocation, setMayAnimateToUserLocation] = useState(true);
  const [selectedReflection, setSelectedReflection] = useState<any>(null);
  const [mapReflections, setMapReflections] = useState<Reflection[]>([]);

  // On mount
  useEffect(() => {
    getSetUserLocation();
  }, []);

  // Get & set location of user
  const getSetUserLocation = async () => {
    console.log("Getting user location");
    const loc = await getCurrentLocation();
    if (loc) {
      setUserLocation(loc);
    }
  };

  // Animate to user location (only on first time load)
  useEffect(() => {
    if (userLocation && mayAnimateToUserLocation) {
      animateToLocation(userLocation);
      setMayAnimateToUserLocation(false);
    }
  }, [userLocation, mayAnimateToUserLocation]);

  // Animate to location
  const animateToLocation = (location: Location.LocationObject) => {
    console.log("Animating to location");
    mapRef.current?.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  // Handle map region changes
  const handleRegionChange = (region: Region) => {
    onRegionChange?.(region);
    currentRegionRef.current = region;
  };

  // On startup, when user location is available, get reflections of user location
  useEffect(() => {
    if (userLocation && maySearchForReflections) {
      console.log("Getting reflections of user location", userLocation);
      getReflectionsByLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setMaySearchForReflections(false);
    }
  }, [userLocation]);

  // Handle get reflections by location (given)
  const getReflectionsByLocation = async (location: Region) => {
    try {
      console.log(`Searching for reflections near: ${location.latitude}, ${location.longitude}`);
      const reflections = await getPublicReflectionsInRadius(
        location.latitude,
        location.longitude,
        5
      );
      console.log(`Found ${reflections.length} reflections.`);
      setMapReflections(reflections);

      // Show toast if no reflections found in search
      if (reflections.length === 0) {
        Toast.show({
          type: "info",
          text1: "No Reflections Nearby",
          text2: "Try moving to a different area or be the first to share!",
        });
      }
    } catch (error) {
      console.error("Error searching reflections in area:", error);
    }
  };

  const handleGoToUserLocation = () => {
    getSetUserLocation();
    setMayAnimateToUserLocation(true);
    setMaySearchForReflections(true);
  };

  // Refresh reflections in current region
  const refreshReflections = async () => {
    if (currentRegionRef.current) {
      await getReflectionsByLocation(currentRegionRef.current);
    }
  };

  const handleReflectionPress = (reflection: any) => {
    setSelectedReflection(reflection);
    onReflectionPanelChange?.(true);

    // Animate map to centre on the reflection
    if (mapRef.current && reflection.location) {
      mapRef.current.animateToRegion({
        latitude: reflection.location.lat,
        longitude: reflection.location.long,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  };

  const closeReflection = () => {
    setSelectedReflection(null);
    onReflectionPanelChange?.(false);
  };

  // Expose methods & data through the ref
  useEffect(() => {
    if (ref && "current" in ref) {
      ref.current = {
        getCurrentLocation: handleGoToUserLocation,
        userLocation,
        getReflectionsByLocation,
        refreshReflections,
      };
    }
  }, [ref, userLocation]);

  return (
    <VStack className={className}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
        onRegionChangeComplete={handleRegionChange}
        customMapStyle={customMapStyle}
      >
        {/* User location marker */}
        {userLocation && showUserLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="Your Location"
            description="You are here"
            pinColor="blue"
          />
        )}

        {/* Reflection markers from Firestore */}
        {mapReflections.map((reflection) => {
          // Only render if reflection has valid location data
          if (!reflection.location || !reflection.location.lat || !reflection.location.long) {
            console.log(`Skipping reflection ${reflection.id} - no valid location`);
            return null;
          }

          return (
            <Marker
              key={`${reflection.id}`}
              coordinate={{
                latitude: reflection.location.lat,
                longitude: reflection.location.long,
              }}
              title={reflection.location?.placeName || "Reflection"}
              onPress={() => handleReflectionPress(reflection)}
            >
              <View className=" rounded-full items-center justify-center">
                {getMoodIcon(reflection.mood || "default", {
                  width: 32,
                  height: 32,
                  fill:
                    mood[reflection.mood?.toLowerCase() as keyof typeof mood]?.colorHex ||
                    mood.unselected.colorHex,
                })}
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Reflection Detail Panel */}
      <ReflectionDetailPanel reflection={selectedReflection} onClose={closeReflection} />
    </VStack>
  );
};

export default MapComponent;

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
