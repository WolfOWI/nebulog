// User related types
export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
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
