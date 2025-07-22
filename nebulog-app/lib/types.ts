import { Timestamp } from "react-native-reanimated/lib/typescript/commonTypes";

export interface User {
  id?: string;
  username: string;
  email: string;
  bio?: string;
  createdAt: Timestamp;
  streakCount: number;
  totalReflections: number;
  totalEchoes: number;
  echoedReflections?: Record<string, boolean>;
  blockedUserIds?: Record<string, boolean>;
  lastReflectDate?: Timestamp;
}

export interface Reflection {
  id?: string;
  authorId: string;
  text: string;
  visibility: "public" | "private";
  location?: {
    lat: number;
    long: number;
  };
  locationLabel?: string;
  moodTag?: string;
  createdAt: Timestamp;
  echoCount: number;
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
  confirmPassword: string;
}

// Navigation types
export type RootStackParamList = {
  "/": undefined;
  "/signup": undefined;
  "/home": undefined;
  "/profile": undefined;
};
