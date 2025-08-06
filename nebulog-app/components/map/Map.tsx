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
    reflection?: Reflection; // Add reflection data to marker
  }>;
  onMarkerPress?: (marker: any) => void;
  onRegionChange?: (region: Region) => void;
  onReflectionPanelChange?: (isOpen: boolean) => void;
  className?: string;
  ref?: React.Ref<any>;
}

const defaultRegion = {
  latitude: -25.838338242913675,
  longitude: 28.342688891941343,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const MapComponent = ({
  initialRegion = defaultRegion,
  showUserLocation = true,
  onMarkerPress,
  onRegionChange,
  onReflectionPanelChange,
  className,
  ref,
}: MapComponentProps) => {
  const { user } = useUser();
  const mapRef = useRef<MapView>(null); // Controls the actual map
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [selectedReflection, setSelectedReflection] = useState<any>(null);
  const [mapReflections, setMapReflections] = useState<Reflection[]>([]);
  const [currentRegion, setCurrentRegion] = useState<Region>(initialRegion);
  const [isFirstTimeLoad, setIsFirstTimeLoad] = useState(true);
  const [forceRender, setForceRender] = useState(0); // Force re-render

  // Get user location on mount
  useEffect(() => {
    console.log("first time load", isFirstTimeLoad);
    handleGetCurrentLocation();
  }, []);

  // Fetch reflections when user location is available
  useEffect(() => {
    if (userLocation && isFirstTimeLoad) {
      console.log("Fetching reflections for user location");
      getReflectionsOfUserLocation();
      setIsFirstTimeLoad(false);
    }
  }, [userLocation, isFirstTimeLoad]);

  // Fetch reflections near the user's location
  const getReflectionsOfUserLocation = async () => {
    try {
      if (!userLocation) {
        console.log("No user location available, skipping this fetch");
        return;
      }

      const reflections = await getPublicReflectionsInRadius(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        5
      );

      setMapReflections(reflections);
      setForceRender((prev) => prev + 1); // Force map re-render

      // Show toast if no reflections found
      if (reflections.length === 0) {
        Toast.show({
          type: "info",
          text1: "No reflections found",
          text2: "Be the first to share a reflection in this area!",
        });
      }
    } catch (error) {
      console.error("Error fetching initial reflections:", error);
    }
  };

  // Fetch reflections near the current region
  const getReflectionsOfCurrentArea = async () => {
    if (!currentRegion) {
      console.log("No current region available to getReflectionsOfCurrentArea");
      return;
    }

    try {
      console.log(
        `Searching for reflections near: ${currentRegion.latitude}, ${currentRegion.longitude}`
      );
      const reflections = await getPublicReflectionsInRadius(
        currentRegion.latitude,
        currentRegion.longitude,
        5
      );
      console.log(`Found ${reflections.length} reflections in current area`);
      setMapReflections(reflections);
      setForceRender((prev) => prev + 1); // Force map re-render

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

  const refreshReflections = async () => {
    await getReflectionsOfCurrentArea();
    setForceRender((prev) => prev + 1); // Force map re-render
  };

  // Handle map region changes
  const handleRegionChange = (region: Region) => {
    setCurrentRegion(region);
    onRegionChange?.(region);
  };

  const handleGetCurrentLocation = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      setUserLocation(loc);

      // Animate to user location
      if (mapRef.current) {
        const newRegion = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        mapRef.current.animateToRegion(newRegion);
        setCurrentRegion(newRegion);
      }
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
        getCurrentLocation: handleGetCurrentLocation,
        userLocation,
        getReflectionsOfCurrentArea,
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
        key={`map-${forceRender}`}
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
              key={`${reflection.id}-${forceRender}`}
              coordinate={{
                latitude: reflection.location.lat,
                longitude: reflection.location.long,
              }}
              title={reflection.location?.placeName || "Reflection"}
              description={reflection.text.substring(0, 50) + "..."}
              onPress={() => handleReflectionPress(reflection)}
              pinColor="purple"
            />
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
