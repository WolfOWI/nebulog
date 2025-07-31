export interface User {
  id?: string;
  username: string;
  email: string;
  bio?: string;
  profileIcon?: string;
  profileColor?: string;
  createdAt: string;
  streakCount: number;
  totalReflections: number;
  totalEchoes: number;
  echoedReflections?: Record<string, boolean>;
  blockedUserIds?: Record<string, boolean>;
  lastReflectDate?: string;
}

export interface Reflection {
  id?: string;
  authorId: string;
  text: string;
  visibility: "public" | "private";
  location?: Location;
  mood?: string;
  createdAt: string;
  echoCount: number;
}

export interface Location {
  // Coordinates
  lat: number;
  long: number;

  // Human-readable address
  placeName?: string;
  formattedAddress?: string;

  // Google Maps ID
  placeId?: string;
}

// (Google Places API)
export interface Place {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  terms: Array<{
    value: string;
    offset: number;
  }>;
}

// (Google Places API)
export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

// Navigation types
export type RootStackParamList = {
  "/": undefined;
  "/signup": undefined;
  "/home": undefined;
  "/myprofile": undefined;
  "/editprofile": undefined;
  "/profileiconselect": undefined;
  "/profilecolourpick": undefined;
  "/locationsearch": undefined;
  "/thoughtlaunch": undefined;
  "/editreflection": undefined;
};
