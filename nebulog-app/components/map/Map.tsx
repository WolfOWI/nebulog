import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { VStack } from "@/components/ui/vstack";
import { customMapStyle } from "@/styles/mapStyles";
import ReflectionDetailPanel from "./ReflectionDetailPanel";
import { PlaceDetails, Reflection } from "@/lib/types";
import { getCurrentLocation } from "@/services/locationServices";
import { getPublicReflectionsInRadius } from "@/services/reflectionServices";
import { useUser } from "@/contexts/UserContext";
import Toast from "react-native-toast-message";
import { getMoodIcon, MoodIcons } from "@/constants/moodIcons";
import { mood } from "@/constants/moods";
import { ProfileIcon } from "../building-blocks/ProfileIcon";
import { MaterialIcons } from "@expo/vector-icons";
import LocSelectCreateBox from "./LocSelectCreateBox";
import AnimatedElement from "../AnimatedElement";
import LoadingScreen from "../LoadingScreen";
import { isWithinLast20Seconds } from "@/utils/dateUtility";

interface MapComponentProps {
  initialRegion?: Region;
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
  onMapTap?: (event: any) => void;
  onClearSelectedLocation?: () => void;
  onCreateThought?: () => void;
  selectedLocation?: PlaceDetails | null;
  className?: string;
  ref?: React.Ref<any>;
  onLocationPanelChange?: (isOpen: boolean) => void;
  highlightedReflection?: Reflection | null;
  onHighlightedReflectionProcessed?: () => void;
}

const MapComponent = ({
  initialRegion,
  onMarkerPress,
  onRegionChange,
  onReflectionPanelChange,
  onMapTap,
  onClearSelectedLocation,
  onCreateThought,
  selectedLocation,
  className,
  ref,
  onLocationPanelChange,
  highlightedReflection,
  onHighlightedReflectionProcessed,
}: MapComponentProps) => {
  const { user } = useUser();
  const mapRef = useRef<MapView>(null);
  const currentRegionRef = useRef<Region | null>(null);

  // Location state
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [maySearchForReflections, setMaySearchForReflections] = useState(true);
  const [mayAnimateToUserLocation, setMayAnimateToUserLocation] = useState(true);

  // Reflection state
  const [selectedReflection, setSelectedReflection] = useState<any>(null);
  const [mapReflections, setMapReflections] = useState<Reflection[]>([]);
  const [isSearchingForReflections, setIsSearchingForReflections] = useState(false);
  const [isProcessingHighlightedReflection, setIsProcessingHighlightedReflection] = useState(false);
  const [showRippleAnimation, setShowRippleAnimation] = useState(false);
  const [showCreationAnimation, setShowCreationAnimation] = useState(false);

  // Location finding state
  const [isFindingUserLocation, setIsFindingUserLocation] = useState(false);

  // On mount
  useEffect(() => {
    getSetUserLocation();
  }, []);

  // Get & set location of user
  const getSetUserLocation = async () => {
    try {
      setIsFindingUserLocation(true);
      console.log("Getting user location");

      const loc = await getCurrentLocation();
      if (loc) {
        setUserLocation(loc);
      }
    } catch (error) {
      console.error("Error getting user location", error);
    } finally {
      setTimeout(() => {
        setIsFindingUserLocation(false);
      }, 500);
    }
  };

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

  // Animate to user location (only on first time load)
  useEffect(() => {
    if (userLocation && mayAnimateToUserLocation && !isProcessingHighlightedReflection) {
      animateToLocation(userLocation);
      setMayAnimateToUserLocation(false);
    }
  }, [userLocation, mayAnimateToUserLocation, isProcessingHighlightedReflection]);

  // On startup, when user location is available, get reflections of user location
  useEffect(() => {
    if (userLocation && maySearchForReflections) {
      // console.log("Getting reflections of user location", userLocation);
      getReflectionsByLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setMaySearchForReflections(false);
    }
  }, [userLocation]);

  // Handle highlighted reflection when received
  useEffect(() => {
    if (highlightedReflection) {
      try {
        setIsProcessingHighlightedReflection(true);

        // Only process reflections with location data
        if (highlightedReflection.location) {
          // Only show the glow animation for newly created reflections
          if (highlightedReflection.isNewlyCreated) {
            setShowCreationAnimation(true);
          } else {
            setShowRippleAnimation(true);
          }

          setMayAnimateToUserLocation(false);

          // Animate to the new reflection location
          if (mapRef.current && highlightedReflection.location) {
            mapRef.current.animateToRegion({
              latitude: highlightedReflection.location.lat,
              longitude: highlightedReflection.location.long,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            });
          }

          // Show the reflection panel
          setSelectedReflection(highlightedReflection);
          setTimeout(() => {
            onReflectionPanelChange?.(true);
          }, 500);

          // Clear processing flag after showing the panel
          setIsProcessingHighlightedReflection(false);

          // Hide the animation after a delay
          setTimeout(() => {
            console.log("Hiding reflection created animation");
            setShowCreationAnimation(false);
            setShowRippleAnimation(false);
          }, 2000);

          setTimeout(() => {
            if (currentRegionRef.current) {
              getReflectionsByLocation(currentRegionRef.current);
            }
          }, 1000);
        }

        onHighlightedReflectionProcessed?.();
      } catch (error) {
        console.error("Error processing highlighted reflection:", error);
        // Clear processing flag on error
        setIsProcessingHighlightedReflection(false);
        // Still notify parent even if there was an error
        onHighlightedReflectionProcessed?.();
      }
    }
  }, [highlightedReflection]);

  // Handle get reflections by location (given)
  const getReflectionsByLocation = async (location: Region) => {
    try {
      setIsSearchingForReflections(true);
      console.log(`Searching for reflections near: ${location.latitude}, ${location.longitude}`);
      const reflections = await getPublicReflectionsInRadius(
        location.latitude,
        location.longitude,
        5,
        user?.id // Pass current user ID to filter out blocked users' reflections
      );
      console.log(`Found ${reflections.length} reflections.`);
      setMapReflections(reflections);

      // Only show "no reflections found" message if this is the initial search
      // and we don't have any reflections yet (to avoid overshadowing success messages)
      if (reflections.length === 0 && mapReflections.length === 0) {
        Toast.show({
          type: "info",
          text1: "No Reflections Nearby",
          text2: "Try moving to a different area or be the first to share!",
        });
      }
    } catch (error) {
      console.error("Error searching reflections in area:", error);
    } finally {
      setTimeout(() => {
        setIsSearchingForReflections(false);
      }, 1500); // Show atleast for 1.5s
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
      // Only refresh if we're not currently processing a highlighted reflection
      if (!isProcessingHighlightedReflection) {
        await getReflectionsByLocation(currentRegionRef.current);
      }
      // Close the reflection panel & location panel
      closeReflection();
      closeSelectCreateBox();

      // Animate map to centre on the reflection
      if (mapRef.current && currentRegionRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentRegionRef.current.latitude,
          longitude: currentRegionRef.current.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });
      }
    }
  };

  const handleReflectionPress = (reflection: any) => {
    setSelectedReflection(reflection);
    onReflectionPanelChange?.(true);

    // Clear any selected location when opening a reflection
    if (selectedLocation && onClearSelectedLocation) {
      onClearSelectedLocation();
    }

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
    onReflectionPanelChange?.(false);
    setTimeout(() => {
      setSelectedReflection(null);
    }, 300);
  };

  const closeSelectCreateBox = () => {
    // Close the location panel
    onLocationPanelChange?.(false);

    // Clear the selected location to remove the marker and reset state
    if (onClearSelectedLocation) {
      onClearSelectedLocation();
    }
  };

  const handleMapTap = (event: any) => {
    // Don't handle map taps when reflection is open
    if (selectedReflection) {
      return;
    }

    const tapCoordinate = event.nativeEvent.coordinate;

    // Check if the tap is on (or very close to) an existing reflection marker
    const isNearReflection = mapReflections.some((reflection) => {
      if (!reflection.location) return false;

      const distance = Math.sqrt(
        Math.pow(tapCoordinate.latitude - reflection.location.lat, 2) +
          Math.pow(tapCoordinate.longitude - reflection.location.long, 2)
      );

      return distance < 0.0001;
    });

    // If tap is not near a reflection marker, handle as location selection
    if (!isNearReflection && onMapTap) {
      onMapTap(event);
      onLocationPanelChange?.(true);
    }
  };

  // Expose methods & data through the ref
  useEffect(() => {
    if (ref && "current" in ref) {
      ref.current = {
        getCurrentLocation: handleGoToUserLocation,
        userLocation,
        getReflectionsByLocation,
        refreshReflections,
        centerMap: (latitude: number, longitude: number) => {
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            });
          }
        },
      };
    }
  }, [ref, userLocation]);

  return (
    <VStack className={className}>
      {!showCreationAnimation && !showRippleAnimation && (
        <>
          {/* Finding user location animation */}
          <AnimatedElement
            animationSource={require("@/assets/animations/getting-location-animation.json")}
            size={400}
            className="z-50 mb-8"
            isVisible={isFindingUserLocation}
          />
          {/* Scanning animation */}
          <AnimatedElement
            animationSource={require("@/assets/animations/scan-animation.json")}
            size={500}
            className="z-40 mb-8"
            isVisible={isSearchingForReflections}
          />
        </>
      )}
      {!showRippleAnimation && (
        // Reflection created animation (show a created reflection from thought launch)
        <AnimatedElement
          animationSource={require("@/assets/animations/blurry-glow-animation.json")}
          size={600}
          className="z-30 mb-8"
          isVisible={showCreationAnimation}
        />
      )}
      {!showCreationAnimation && (
        // Highlighted reflection animation (show a reflection from a card tap)
        <AnimatedElement
          animationSource={require("@/assets/animations/ripple-animation.json")}
          size={300}
          className="z-30 mb-2"
          isVisible={showRippleAnimation}
        />
      )}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={false} // Showing user location with own customing marker
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
        onRegionChangeComplete={handleRegionChange}
        onPress={handleMapTap}
        customMapStyle={customMapStyle}
        scrollEnabled={!selectedReflection && !selectedLocation} // Prevent map from scrolling when reflection or location is open (android fix)
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="Your Location"
            description="You are here"
          >
            <View className="rounded-full items-center justify-center bg-slate-500/20 p-2">
              <ProfileIcon name={user?.profileIcon || "default"} size={32} color="white" />
            </View>
          </Marker>
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
              onPress={() => handleReflectionPress(reflection)}
            >
              {getMoodIcon(reflection.mood || "default", {
                width: 32,
                height: 32,
                fill:
                  mood[reflection.mood?.toLowerCase() as keyof typeof mood]?.colorHex ||
                  mood.unselected.colorHex,
              })}
            </Marker>
          );
        })}

        {/* Selected location marker */}
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.geometry.location.lat,
              longitude: selectedLocation.geometry.location.lng,
            }}
            title={selectedLocation.name || "Selected Location"}
            description="Tap here to create a thought"
            onPress={() => {
              // Center the map on the selected location when marker is tapped
              if (mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: selectedLocation.geometry.location.lat,
                  longitude: selectedLocation.geometry.location.lng,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                });
              }
            }}
          >
            <View className="w-12 h-12 rounded-full items-center justify-center">
              <MaterialIcons name="my-location" size={32} color="white" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Reflection Detail Panel */}
      <ReflectionDetailPanel
        reflection={selectedReflection}
        onClose={closeReflection}
        style={{ zIndex: 999 }}
      />

      {/* LocSelectCreateBox */}
      {selectedLocation && (
        <LocSelectCreateBox
          selectedLocation={selectedLocation}
          onClose={closeSelectCreateBox}
          onCreateThought={onCreateThought || (() => {})}
          style={{ zIndex: 999 }}
        />
      )}
    </VStack>
  );
};

export default MapComponent;

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    zIndex: 1,
  },
});
