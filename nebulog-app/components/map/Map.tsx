import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { VStack } from "@/components/ui/vstack";
import { customMapStyle } from "@/styles/mapStyles";
import ReflectionDetailPanel from "./ReflectionDetailPanel";
import { Reflection } from "@/lib/types";
import { getCurrentLocation } from "@/services/locationServices";

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
  ref?: React.Ref<any>;
}

// Fake reflection data near your location - one for each mood
const fakeReflections: (Reflection & { coordinate: { latitude: number; longitude: number } })[] = [
  {
    id: "1",
    authorId: "user1",
    text: "Today I witnessed the most amazing sunrise. The way the light hit the buildings created such a peaceful atmosphere. It reminded me to appreciate the simple moments in life.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 + 0.001,
      long: 28.342688891941343 + 0.001,
    },
    locationLabel: "City Skyline",
    mood: "Joy",
    createdAt: new Date(1705296600 * 1000).toISOString(), // 2024-01-15 06:30
    echoCount: 5,
    coordinate: {
      latitude: -25.838338242913675 + 0.001,
      longitude: 28.342688891941343 + 0.001,
    },
  },
  {
    id: "2",
    authorId: "user2",
    text: "Walking through the park today, I noticed how the trees sway in the wind. Nature has its own rhythm, and it's so calming to just observe and be present.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 - 0.002,
      long: 28.342688891941343 - 0.001,
    },
    locationLabel: "Central Park",
    mood: "Gratitude",
    createdAt: new Date(1705232700 * 1000).toISOString(), // 2024-01-14 15:45
    echoCount: 3,
    coordinate: {
      latitude: -25.838338242913675 - 0.002,
      longitude: 28.342688891941343 - 0.001,
    },
  },
  {
    id: "3",
    authorId: "user3",
    text: "Sometimes the best conversations happen in coffee shops. Today I overheard someone talking about their dreams, and it made me think about my own aspirations.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 + 0.003,
      long: 28.342688891941343 - 0.002,
    },
    locationLabel: "Downtown Coffee Shop",
    mood: "Growth",
    createdAt: new Date(1705134000 * 1000).toISOString(), // 2024-01-13 10:20
    echoCount: 7,
    coordinate: {
      latitude: -25.838338242913675 + 0.003,
      longitude: 28.342688891941343 - 0.002,
    },
  },
  {
    id: "4",
    authorId: "user4",
    text: "The stars tonight are incredible. Looking up at the vast universe makes me feel both small and connected to something much larger than myself.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 - 0.001,
      long: 28.342688891941343 + 0.003,
    },
    locationLabel: "Observatory Hill",
    mood: "Connection",
    createdAt: new Date(1705086900 * 1000).toISOString(), // 2024-01-12 21:15
    echoCount: 4,
    coordinate: {
      latitude: -25.838338242913675 - 0.001,
      longitude: 28.342688891941343 + 0.003,
    },
  },
  {
    id: "5",
    authorId: "user5",
    text: "Sitting by the lake, watching the water ripple. There's something so peaceful about being still and just observing the world around me.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 + 0.002,
      long: 28.342688891941343 + 0.002,
    },
    locationLabel: "Lakeside Bench",
    mood: "Stillness",
    createdAt: new Date(1705003200 * 1000).toISOString(), // 2024-01-11 18:00
    echoCount: 6,
    coordinate: {
      latitude: -25.838338242913675 + 0.002,
      longitude: 28.342688891941343 + 0.002,
    },
  },
  {
    id: "6",
    authorId: "user6",
    text: "The museum exhibit on space exploration left me in complete awe. The scale of our universe is mind-boggling and beautiful.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 - 0.003,
      long: 28.342688891941343 + 0.001,
    },
    locationLabel: "Science Museum",
    mood: "Wonder",
    createdAt: new Date(1704919500 * 1000).toISOString(), // 2024-01-10 14:45
    echoCount: 8,
    coordinate: {
      latitude: -25.838338242913675 - 0.003,
      longitude: 28.342688891941343 + 0.001,
    },
  },
  {
    id: "7",
    authorId: "user7",
    text: "Traffic was unbearable today. I can't believe how inconsiderate some drivers can be. This city needs better infrastructure.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 + 0.001,
      long: 28.342688891941343 - 0.003,
    },
    locationLabel: "Main Street",
    mood: "Anger",
    createdAt: new Date(1704835800 * 1000).toISOString(), // 2024-01-09 11:30
    echoCount: 2,
    coordinate: {
      latitude: -25.838338242913675 + 0.001,
      longitude: 28.342688891941343 - 0.003,
    },
  },
  {
    id: "8",
    authorId: "user8",
    text: "I feel so overwhelmed with everything happening. Work, personal life, everything feels like it's spinning out of control.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 - 0.002,
      long: 28.342688891941343 + 0.002,
    },
    locationLabel: "Office Building",
    mood: "Turbulence",
    createdAt: new Date(1704752100 * 1000).toISOString(), // 2024-01-08 16:15
    echoCount: 1,
    coordinate: {
      latitude: -25.838338242913675 - 0.002,
      longitude: 28.342688891941343 + 0.002,
    },
  },
  {
    id: "9",
    authorId: "user9",
    text: "The rain today matches my mood perfectly. Sometimes it's okay to feel sad and let the weather reflect what's inside.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 + 0.003,
      long: 28.342688891941343 + 0.001,
    },
    locationLabel: "Rainy Street Corner",
    mood: "Sadness",
    createdAt: new Date(1704668400 * 1000).toISOString(), // 2024-01-07 13:00
    echoCount: 3,
    coordinate: {
      latitude: -25.838338242913675 + 0.003,
      longitude: 28.342688891941343 + 0.001,
    },
  },
  {
    id: "10",
    authorId: "user10",
    text: "It's been a year since we lost her. The emptiness never really goes away, but I'm learning to carry it with me.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 - 0.001,
      long: 28.342688891941343 - 0.002,
    },
    locationLabel: "Memorial Garden",
    mood: "Grief",
    createdAt: new Date(1704584700 * 1000).toISOString(), // 2024-01-06 09:45
    echoCount: 0,
    coordinate: {
      latitude: -25.838338242913675 - 0.001,
      longitude: 28.342688891941343 - 0.002,
    },
  },
  {
    id: "11",
    authorId: "user11",
    text: "I don't know where I'm going or what I'm doing. Everything feels directionless and I'm not sure how to find my way.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 + 0.002,
      long: 28.342688891941343 - 0.001,
    },
    locationLabel: "Unknown Path",
    mood: "Lost",
    createdAt: new Date(1704501000 * 1000).toISOString(), // 2024-01-05 20:30
    echoCount: 1,
    coordinate: {
      latitude: -25.838338242913675 + 0.002,
      longitude: 28.342688891941343 - 0.001,
    },
  },
  {
    id: "12",
    authorId: "user12",
    text: "Sometimes I just need to pause and reflect without any specific emotion. Just being present in this moment.",
    visibility: "public",
    location: {
      lat: -25.838338242913675 - 0.003,
      long: 28.342688891941343 - 0.003,
    },
    locationLabel: "Quiet Corner",
    mood: "Unselected",
    createdAt: new Date(1704417300 * 1000).toISOString(), // 2024-01-04 17:15
    echoCount: 2,
    coordinate: {
      latitude: -25.838338242913675 - 0.003,
      longitude: 28.342688891941343 - 0.003,
    },
  },
];

const defaultRegion = {
  latitude: -25.838338242913675,
  longitude: 28.342688891941343,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const MapComponent = ({
  initialRegion = defaultRegion,
  showUserLocation = true,
  markers = [],
  onMarkerPress,
  onRegionChange,
  onReflectionPanelChange,
  className,
  ref,
}: MapComponentProps) => {
  const mapRef = useRef<MapView>(null); // Controls the actual map
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [selectedReflection, setSelectedReflection] = useState<any>(null);

  const handleGetCurrentLocation = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      setUserLocation(loc);

      // Animate to user location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
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
      handleGetCurrentLocation();
    }
  }, [showUserLocation]);

  // Expose methods & data through the ref
  useEffect(() => {
    if (ref && "current" in ref) {
      ref.current = {
        getCurrentLocation: handleGetCurrentLocation,
        userLocation,
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
        showsCompass={false}
        showsScale={false}
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
            title={reflection.locationLabel || "Reflection"}
            description={reflection.text.substring(0, 50) + "..."}
            onPress={() => handleReflectionPress(reflection)}
            pinColor="purple"
          />
        ))}
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
