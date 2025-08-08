import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/types";
import { onAuthStateChanged } from "@/services/authServices";
import { listenToUserEchoedReflections, listenToUserTotalEchoes } from "@/services/echoService";
import { blockUser, unblockUser } from "@/services/userServices";

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateUserContext: (updates: Partial<User>) => void;
  updateEchoedReflections: (reflectionId: string, isLiked: boolean) => void;
  blockUserById: (userToBlockId: string) => Promise<void>;
  unblockUserById: (userToUnblockId: string) => Promise<void>;
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

  // Listen to real-time changes in user's echoedReflections and totalEchoes
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribeEchoedReflections = listenToUserEchoedReflections(
      user.id,
      (echoedReflections) => {
        if (user) {
          setUser({
            ...user,
            echoedReflections,
          });
        }
      }
    );

    const unsubscribeTotalEchoes = listenToUserTotalEchoes(user.id, (totalEchoes) => {
      if (user) {
        setUser({
          ...user,
          totalEchoes,
        });
      }
    });

    return () => {
      unsubscribeEchoedReflections();
      unsubscribeTotalEchoes();
    };
  }, [user?.id]);

  const updateUserContext = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
    console.log("User will be updated with:", updates);
  };

  const updateEchoedReflections = (reflectionId: string, isLiked: boolean) => {
    if (user) {
      const echoedReflections = user.echoedReflections || {};
      const updatedEchoedReflections = isLiked
        ? { ...echoedReflections, [reflectionId]: true }
        : { ...echoedReflections };

      if (!isLiked) {
        delete updatedEchoedReflections[reflectionId];
      }

      setUser({
        ...user,
        echoedReflections: updatedEchoedReflections,
      });
    }
  };

  const blockUserById = async (userToBlockId: string) => {
    if (!user?.id) {
      throw new Error("No logged in user found");
    }

    try {
      await blockUser(user.id, userToBlockId);

      // Update local user state
      const blockedUserIds = user.blockedUserIds || {};
      setUser({
        ...user,
        blockedUserIds: {
          ...blockedUserIds,
          [userToBlockId]: true,
        },
      });
    } catch (error) {
      console.error("Error blocking user:", error);
      throw error;
    }
  };

  const unblockUserById = async (userToUnblockId: string) => {
    if (!user?.id) {
      throw new Error("No logged in user found");
    }

    try {
      await unblockUser(user.id, userToUnblockId);

      // Update local user state
      const blockedUserIds = user.blockedUserIds || {};
      const updatedBlockedUserIds = { ...blockedUserIds };
      delete updatedBlockedUserIds[userToUnblockId];

      setUser({
        ...user,
        blockedUserIds: updatedBlockedUserIds,
      });
    } catch (error) {
      console.error("Error unblocking user:", error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        updateUserContext,
        updateEchoedReflections,
        blockUserById,
        unblockUserById,
      }}
    >
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
