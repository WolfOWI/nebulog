import { Place, PlaceDetails } from "@/lib/types";
import { getCurrentLocation } from "./locationServices";

export const searchPlaces = async (query: string): Promise<Place[]> => {
  // Only start searching after 3 characters
  if (query.length < 3) return [];

  const deviceLocation = await getCurrentLocation();

  if (!deviceLocation) {
    console.log("No device location found");
  } else {
    console.log("Device location found");
    console.log(deviceLocation.coords.latitude, deviceLocation.coords.longitude);
  }

  try {
    // Search for both addresses and businesses
    const [addressResults, businessResults] = await Promise.all([
      // Search for addresses/geocodes
      fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${process.env.GOOGLE_PLATFORM_API_KEY}&types=geocode${
          deviceLocation
            ? `&location=${deviceLocation.coords.latitude},${deviceLocation.coords.longitude}&radius=10000`
            : ""
        }`
      ),

      // Search for businesses/establishments
      fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&key=${process.env.GOOGLE_PLATFORM_API_KEY}&types=establishment${
          deviceLocation
            ? `&location=${deviceLocation.coords.latitude},${deviceLocation.coords.longitude}&radius=10000`
            : ""
        }`
      ),
    ]);

    const [addressData, businessData] = await Promise.all([
      addressResults.json(),
      businessResults.json(),
    ]);

    // Combine and deduplicate results
    const allResults: Place[] = [];
    const seenIds = new Set<string>();

    if (addressData.status === "OK" && addressData.predictions) {
      addressData.predictions.slice(0, 5).forEach((place: Place) => {
        if (!seenIds.has(place.place_id)) {
          allResults.push(place);
          seenIds.add(place.place_id);
        }
      });
    }

    if (businessData.status === "OK" && businessData.predictions) {
      businessData.predictions.slice(0, 5).forEach((place: Place) => {
        if (!seenIds.has(place.place_id)) {
          allResults.push(place);
          seenIds.add(place.place_id);
        }
      });
    }

    return allResults;
  } catch (error) {
    console.error("Error searching places:", error);
    return [];
  }
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,geometry&key=${process.env.GOOGLE_PLATFORM_API_KEY}`
    );

    const data = await response.json();
    // console.log("Place details:", data);

    if (data.status === "OK") {
      return data.result;
    } else {
      console.error("Place details API error:", data.error_message);
      return null;
    }
  } catch (error) {
    console.error("Error getting place details:", error);
    return null;
  }
};
