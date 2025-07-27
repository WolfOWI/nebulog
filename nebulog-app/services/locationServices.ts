import * as Location from "expo-location";

/**
 * Request location permission from the user
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  } catch (err) {
    console.error("Location permission error:", err);
    return false;
  }
};

/**
 * Get the current user location
 * @returns Promise<Location.LocationObject | null> - location object or null if failed
 */
export const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log("Location permission denied");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 1000,
      distanceInterval: 10,
    });

    return location;
  } catch (err) {
    console.error("Location error:", err);
    return null;
  }
};
