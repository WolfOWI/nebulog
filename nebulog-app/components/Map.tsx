import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from "expo-location";
import { VStack } from "@/components/ui/vstack";

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
  className?: string;
}

const defaultRegion = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const MapComponent = forwardRef<any, MapComponentProps>(
  (
    {
      initialRegion = defaultRegion,
      showUserLocation = true,
      markers = [],
      onMarkerPress,
      onRegionChange,
      className,
    },
    ref
  ) => {
    const mapRef = useRef<MapView>(null);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

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

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
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

          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              onPress={() => onMarkerPress?.(marker)}
            />
          ))}
        </MapView>
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
