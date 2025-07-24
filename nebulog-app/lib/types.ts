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
  locationLabel?: string;
  mood?: string;
  createdAt: string;
  echoCount: number;
}

export interface Location {
  lat: number;
  long: number;
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
  "/myProfile": undefined;
  "/editProfile": undefined;
};
