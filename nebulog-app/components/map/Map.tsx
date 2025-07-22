import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { VStack } from "@/components/ui/vstack";
import { customMapStyle } from "@/styles/mapStyles";
import ReflectionDetailPanel from "./ReflectionDetailPanel";

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
  }>;
  onMarkerPress?: (marker: any) => void;
  onRegionChange?: (region: Region) => void;
  onReflectionPanelChange?: (isOpen: boolean) => void;
  className?: string;
}

// Fake reflection data near your location
const fakeReflections = [
  {
    id: "1",
    coordinate: {
      latitude: -25.838338242913675 + 0.001, // Slightly north
      longitude: 28.342688891941343 + 0.001, // Slightly east
    },
    title: "Morning Reflection",
    description: "Beautiful sunrise over the city skyline",
    content:
      "Today I witnessed the most amazing sunrise. The way the light hit the buildings created such a peaceful atmosphere. It reminded me to appreciate the simple moments in life.",
    timestamp: "2024-01-15 06:30",
    mood: "Peaceful",
    tags: ["sunrise", "gratitude", "peace"],
  },
  {
    id: "2",
    coordinate: {
      latitude: -25.838338242913675 - 0.002, // Slightly south
      longitude: 28.342688891941343 - 0.001, // Slightly west
    },
    title: "Park Walk",
    description: "Reflecting on nature's beauty",
    content:
      "Walking through the park today, I noticed how the trees sway in the wind. Nature has its own rhythm, and it's so calming to just observe and be present.",
    timestamp: "2024-01-14 15:45",
    mood: "Calm",
    tags: ["nature", "mindfulness", "walking"],
  },
  {
    id: "3",
    coordinate: {
      latitude: -25.838338242913675 + 0.003, // Further north
      longitude: 28.342688891941343 - 0.002, // Further west
    },
    title: "Coffee Shop Thoughts",
    description: "Deep thoughts over a cup of coffee",
    content:
      "Sometimes the best conversations happen in coffee shops. Today I overheard someone talking about their dreams, and it made me think about my own aspirations.",
    timestamp: "2024-01-13 10:20",
    mood: "Inspired",
    tags: ["coffee", "dreams", "inspiration"],
  },
  {
    id: "4",
    coordinate: {
      latitude: -25.838338242913675 - 0.001, // Slightly south
      longitude: 28.342688891941343 + 0.003, // Further east
    },
    title: "Evening Contemplation",
    description: "Night sky reflection",
    content:
      "The stars tonight are incredible. Looking up at the vast universe makes me feel both small and connected to something much larger than myself.",
    timestamp: "2024-01-12 21:15",
    mood: "Contemplative",
    tags: ["stars", "universe", "perspective"],
  },
];

const defaultRegion = {
  latitude: -25.838338242913675,
  longitude: 28.342688891941343,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const MapComponent = forwardRef<any, MapComponentProps>(
  (
    {
      initialRegion = defaultRegion,
      showUserLocation = true,
      markers = [],
      onMarkerPress,
      onRegionChange,
      onReflectionPanelChange,
      className,
    },
    ref
  ) => {
    const mapRef = useRef<MapView>(null);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [selectedReflection, setSelectedReflection] = useState<any>(null);

    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === "granted";
      } catch (err) {
        console.error("Location permission error:", err);
        return false;
      }
    };

    const getCurrentLocation = async () => {
      try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          console.log("Location permission denied");
          return;
        }

        // Use faster location options for better responsiveness
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 1000,
          distanceInterval: 10,
        });

        setUserLocation(location);

        // Animate to user location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (err) {
        console.error("Location error:", err);
      }
    };

    const handleReflectionPress = (reflection: any) => {
      setSelectedReflection(reflection);
      onReflectionPanelChange?.(true);

      // Animate map to center on the reflection
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: reflection.coordinate.latitude,
          longitude: reflection.coordinate.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    };

    const closeReflection = () => {
      setSelectedReflection(null);
      onReflectionPanelChange?.(false);
    };

    useEffect(() => {
      if (showUserLocation) {
        getCurrentLocation();
      }
    }, [showUserLocation]);

    useImperativeHandle(ref, () => ({
      getCurrentLocation,
      userLocation,
    }));

    return (
      <VStack className={className}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          showsUserLocation={showUserLocation}
          showsCompass={true}
          showsScale={true}
          onRegionChangeComplete={onRegionChange}
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

          {/* Custom markers */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              onPress={() => onMarkerPress?.(marker)}
            />
          ))}

          {/* Reflection markers */}
          {fakeReflections.map((reflection) => (
            <Marker
              key={reflection.id}
              coordinate={reflection.coordinate}
              title={reflection.title}
              description={reflection.description}
              onPress={() => handleReflectionPress(reflection)}
              pinColor="purple"
            />
          ))}
        </MapView>

        {/* Reflection Detail Panel */}
        <ReflectionDetailPanel reflection={selectedReflection} onClose={closeReflection} />
      </VStack>
    );
  }
);

export default MapComponent;

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
