import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/types";
import { onAuthStateChanged } from "@/services/authServices";

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateUserContext: (updates: Partial<User>) => void;
}

// Create context for user state
const UserContext = createContext<UserContextType | null>(null);

// Provider component to wrap app
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Update user state when auth state changes
  useEffect(() => {
    const userStateListener = onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => userStateListener();
  }, []);

  const updateUserContext = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
    console.log("User context updated:", user);
  };

  return (
    <UserContext.Provider value={{ user, loading, updateUserContext }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access user state
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
