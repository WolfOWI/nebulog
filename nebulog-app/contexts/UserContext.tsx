import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/lib/types";
import { onAuthStateChanged } from "@/services/authServices";
import { listenToUserEchoedReflections, listenToUserTotalEchoes } from "@/services/echoService";
import { blockUser, unblockUser, updateUserDetails } from "@/services/userServices";
import { validateStreak, shouldResetStreak } from "@/utils/streakUtility";
import { getUserById } from "@/services/userServices";

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateUserContext: (updates: Partial<User>) => void;
  updateEchoedReflections: (reflectionId: string, isLiked: boolean) => void;
  blockUserById: (userToBlockId: string) => Promise<void>;
  unblockUserById: (userToUnblockId: string) => Promise<void>;
  validateAndUpdateStreak: () => Promise<void>;
  updateStreakOnReflection: (newStreak: number) => void;
  refreshUserData: () => Promise<void>;
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
        console.log("Real-time echoedReflections update received:", echoedReflections);
        setUser((currentUser) => {
          if (currentUser) {
            console.log("Updating user context with echoedReflections, preserving profile data");
            // Only update echoedReflections, preserve all other fields including profile changes
            return {
              ...currentUser,
              echoedReflections,
            };
          }
          return currentUser;
        });
      }
    );

    const unsubscribeTotalEchoes = listenToUserTotalEchoes(user.id, (totalEchoes) => {
      console.log("Real-time totalEchoes update received:", totalEchoes);
      setUser((currentUser) => {
        if (currentUser) {
          console.log("Updating user context with totalEchoes, preserving profile data");
          // Only update totalEchoes, preserve all other fields including profile changes
          return {
            ...currentUser,
            totalEchoes,
          };
        }
        return currentUser;
      });
    });

    return () => {
      unsubscribeEchoedReflections();
      unsubscribeTotalEchoes();
    };
  }, [user?.id]);

  // Validate streak when user data changes (e.g., when app opens)
  useEffect(() => {
    if (user?.id && user.lastReflectDate) {
      validateAndUpdateStreak();
    }
  }, [user?.id, user?.lastReflectDate]);

  const updateUserContext = (updates: Partial<User>) => {
    setUser((currentUser) => {
      if (currentUser) {
        console.log("Updating user context with:", updates);
        console.log("Current user state:", currentUser);
        const updatedUser = { ...currentUser, ...updates };
        console.log("User context updated");
        return updatedUser;
      }
      return currentUser;
    });
    console.log("User will be updated with:", updates);
  };

  const updateEchoedReflections = (reflectionId: string, isLiked: boolean) => {
    console.log("Manual updateEchoedReflections called:", { reflectionId, isLiked });
    setUser((currentUser) => {
      if (currentUser) {
        const echoedReflections = currentUser.echoedReflections || {};
        const updatedEchoedReflections = isLiked
          ? { ...echoedReflections, [reflectionId]: true }
          : { ...echoedReflections };

        if (!isLiked) {
          delete updatedEchoedReflections[reflectionId];
        }

        console.log("Updating echoedReflections manually, preserving profile data");
        return {
          ...currentUser,
          echoedReflections: updatedEchoedReflections,
        };
      }
      return currentUser;
    });
  };

  const blockUserById = async (userToBlockId: string) => {
    if (!user?.id) {
      throw new Error("No logged in user found");
    }

    try {
      await blockUser(user.id, userToBlockId);

      // Update local user state
      setUser((currentUser) => {
        if (currentUser) {
          const blockedUserIds = currentUser.blockedUserIds || {};
          return {
            ...currentUser,
            blockedUserIds: {
              ...blockedUserIds,
              [userToBlockId]: true,
            },
          };
        }
        return currentUser;
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
      setUser((currentUser) => {
        if (currentUser) {
          const blockedUserIds = currentUser.blockedUserIds || {};
          const updatedBlockedUserIds = { ...blockedUserIds };
          delete updatedBlockedUserIds[userToUnblockId];

          return {
            ...currentUser,
            blockedUserIds: updatedBlockedUserIds,
          };
        }
        return currentUser;
      });
    } catch (error) {
      console.error("Error unblocking user:", error);
      throw error;
    }
  };

  const validateAndUpdateStreak = async () => {
    if (!user?.id || !user.lastReflectDate) {
      console.log("validateAndUpdateStreak: No user ID or lastReflectDate");
      return;
    }

    try {
      // console.log("validateAndUpdateStreak: Checking streak for user", user.id);
      // console.log("validateAndUpdateStreak: Current streak count:", user.streakCount);
      // console.log("validateAndUpdateStreak: Last reflect date:", user.lastReflectDate);

      // Check if streak should be reset
      const shouldReset = shouldResetStreak(user.lastReflectDate);
      // console.log("validateAndUpdateStreak: Should reset streak?", shouldReset);

      if (shouldReset) {
        // console.log("validateAndUpdateStreak: Resetting streak to 0");
        // Update database
        await updateUserDetails(user.id, { streakCount: 0 });

        // Update local state
        setUser((currentUser) => {
          if (currentUser) {
            return {
              ...currentUser,
              streakCount: 0,
            };
          }
          return currentUser;
        });

        console.log("Streak reset to 0 due to gap in reflections");
      } else {
        console.log("validateAndUpdateStreak: Streak is valid, no reset needed");
      }
    } catch (error) {
      console.error("Error validating streak:", error);
    }
  };

  const updateStreakOnReflection = (newStreak: number) => {
    // console.log("updateStreakOnReflection: Updating streak to:", newStreak);
    setUser((currentUser) => {
      if (currentUser) {
        return {
          ...currentUser,
          streakCount: newStreak,
        };
      }
      return currentUser;
    });
  };

  const refreshUserData = async () => {
    if (!user?.id) return;

    try {
      // console.log("refreshUserData: Refreshing user data from database");

      const freshUserData = await getUserById(user.id);

      console.log("refreshUserData: Fresh user data:", {
        streakCount: freshUserData.streakCount,
        lastReflectDate: freshUserData.lastReflectDate,
        totalReflections: freshUserData.totalReflections,
      });

      setUser(freshUserData);
    } catch (error) {
      console.error("Error refreshing user data:", error);
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
        validateAndUpdateStreak,
        updateStreakOnReflection,
        refreshUserData,
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
