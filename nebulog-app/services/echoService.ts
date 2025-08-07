// Echo Services

import {
  doc,
  updateDoc,
  increment,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { User } from "@/lib/types";
import { getUserById, updateUserDetails } from "./userServices";

/**
 * Update user's echoed reflections map
 * @param userId - The user ID to update
 * @param reflectionId - The reflection ID to add/remove
 * @param isLiked - Whether to add (true) or remove (false) the reflection
 */
const updateUserEchoedReflections = async (
  userId: string,
  reflectionId: string,
  isLiked: boolean
) => {
  try {
    const user = await getUserById(userId);

    if (!user || !user.id) {
      throw new Error("User not found");
    }

    const echoedReflections = user.echoedReflections || {};
    let updatedEchoedReflections;

    if (isLiked) {
      // Add reflection to echoedReflections
      updatedEchoedReflections = {
        ...echoedReflections,
        [reflectionId]: true,
      };
    } else {
      // Remove reflection from echoedReflections
      updatedEchoedReflections = { ...echoedReflections };
      delete updatedEchoedReflections[reflectionId];
    }

    await updateUserDetails(user.id, {
      echoedReflections: updatedEchoedReflections,
    });
  } catch (error) {
    const action = isLiked ? "liking" : "unliking";
    throw new Error(`Failed to update the ${action} user's echoed reflections: ${error}`);
  }
};

/**
 * Update reflection's echo count
 * @param reflectionId - The reflection ID to update
 * @param isLiked - Whether to increment (true) or decrement (false) the count
 */
const updateReflectionEchoCount = async (reflectionId: string, isLiked: boolean) => {
  try {
    const reflectionDoc = doc(db, "reflections", reflectionId);
    await updateDoc(reflectionDoc, {
      echoCount: increment(isLiked ? 1 : -1),
    });
  } catch (error) {
    const action = isLiked ? "liked" : "unliked";
    throw new Error(`Failed to update the ${action} reflection's echo count: ${error}`);
  }
};

/**
 * Update author's total echoes received
 * @param authorId - The author ID to update
 * @param isLiked - Whether to increment (true) or decrement (false) the count
 */
const updateAuthorTotalEchoes = async (authorId: string, isLiked: boolean) => {
  try {
    const authorDoc = doc(db, "users", authorId);
    await updateDoc(authorDoc, {
      totalEchoes: increment(isLiked ? 1 : -1),
    });
  } catch (error) {
    const action = isLiked ? "liked" : "unliked";
    throw new Error(`Failed to update the ${action} reflection's author's total echoes: ${error}`);
  }
};

/**
 * Like (echo) a reflection
 * @param userId - The user ID who is liking the reflection
 * @param reflectionId - The reflection ID to like
 * @param reflectionAuthorId - The author ID of the reflection
 */
export const likeReflection = async (
  userId: string,
  reflectionId: string,
  reflectionAuthorId: string
) => {
  try {
    // Get current user data to check if already liked
    const user = await getUserById(userId);

    if (!user || !user.id) {
      throw new Error("User not found");
    }

    if (reflectionAuthorId === userId) {
      throw new Error("User cannot like their own reflection!");
    }

    const echoedReflections = user.echoedReflections || {};

    // Check if already liked
    if (echoedReflections[reflectionId]) {
      throw new Error("Reflection already liked");
    }

    // Update LIKING USER
    await updateUserEchoedReflections(userId, reflectionId, true);

    // Update REFLECTION
    await updateReflectionEchoCount(reflectionId, true);

    // Update AUTHOR
    await updateAuthorTotalEchoes(reflectionAuthorId, true);

    console.log(`User ${userId} liked reflection ${reflectionId}`);
  } catch (error) {
    throw new Error("Failed to like reflection: " + error);
  }
};

/**
 * Unlike (un-echo) a reflection
 * @param userId - The user ID who is unliking the reflection
 * @param reflectionId - The reflection ID to unlike
 * @param reflectionAuthorId - The author ID of the reflection
 */
export const unlikeReflection = async (
  userId: string,
  reflectionId: string,
  reflectionAuthorId: string
) => {
  try {
    // Get current user data to check if already liked
    const user = await getUserById(userId);

    if (!user || !user.id) {
      throw new Error("User not found");
    }

    if (reflectionAuthorId === userId) {
      throw new Error("User cannot unlike their own reflection!");
    }

    const echoedReflections = user.echoedReflections || {};

    // Check if not already liked
    if (!echoedReflections[reflectionId]) {
      throw new Error("Reflection not liked");
    }

    // Update UNLIKING USER
    await updateUserEchoedReflections(userId, reflectionId, false);

    // Update REFLECTION
    await updateReflectionEchoCount(reflectionId, false);

    // Update AUTHOR
    await updateAuthorTotalEchoes(reflectionAuthorId, false);

    console.log(`User ${userId} unliked reflection ${reflectionId}`);
  } catch (error) {
    throw new Error("Failed to unlike reflection: " + error);
  }
};

/**
 * Check if a user has liked a specific reflection
 * @param userId - The user ID to check
 * @param reflectionId - The reflection ID to check
 * @returns Boolean indicating if the user has liked the reflection
 */
export const hasUserLikedReflection = async (
  userId: string,
  reflectionId: string
): Promise<boolean> => {
  try {
    const user = await getUserById(userId);

    if (!user) {
      console.error("User not found when checking if they liked a reflection");
      return false;
    }

    // Does the user have reflection in their echoedReflections map?
    if (user.echoedReflections && user.echoedReflections[reflectionId]) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking if user liked reflection:", error);
    return false;
  }
};

/**
 * Get all reflection IDs that a user has liked
 * @param userId - The user ID to get liked reflections for
 * @returns Array of reflection IDs that the user has liked
 */
export const getLikedReflectionIds = async (userId: string): Promise<string[]> => {
  try {
    const user = await getUserById(userId);

    if (!user) {
      console.error("User not found when getting user liked reflection IDs");
      return [];
    }

    return Object.keys(user.echoedReflections || {});
  } catch (error) {
    console.error("Error getting user liked reflection IDs:", error);
    return [];
  }
};

// LISTENERS

/**
 * Listen to changes in a user's echoed reflections
 * @param userId - The user ID to listen to
 * @param callback - Function called when echoedReflections changes
 * @returns Unsubscribe function
 */
export const listenToUserEchoedReflections = (
  userId: string,
  callback: (echoedReflections: Record<string, boolean>) => void
) => {
  const userDoc = doc(db, "users", userId);

  return onSnapshot(userDoc, (doc) => {
    if (doc.exists()) {
      const userData = doc.data() as User;
      const echoedReflections = userData.echoedReflections || {};
      callback(echoedReflections);
    } else {
      callback({});
    }
  });
};

/**
 * Listen to changes in a reflection's echo count
 * @param reflectionId - The reflection ID to listen to
 * @param callback - Function called when echoCount changes
 * @returns Unsubscribe function
 */
export const listenToReflectionEchoCount = (
  reflectionId: string,
  callback: (echoCount: number) => void
) => {
  const reflectionDoc = doc(db, "reflections", reflectionId);

  return onSnapshot(reflectionDoc, (doc) => {
    if (doc.exists()) {
      const reflectionData = doc.data();
      const echoCount = reflectionData.echoCount || 0;
      callback(echoCount);
    } else {
      callback(0);
    }
  });
};

/**
 * Listen to changes in a user's total echoes received
 * @param userId - The user ID to listen to
 * @param callback - Function called when totalEchoes changes
 * @returns Unsubscribe function
 */
export const listenToUserTotalEchoes = (
  userId: string,
  callback: (totalEchoes: number) => void
) => {
  const userDoc = doc(db, "users", userId);

  return onSnapshot(userDoc, (doc) => {
    if (doc.exists()) {
      const userData = doc.data() as User;
      const totalEchoes = userData.totalEchoes || 0;
      callback(totalEchoes);
    } else {
      callback(0);
    }
  });
};

/**
 * Listen to changes for a specific reflection's echo status
 * @param userId - The user ID to check echo status for
 * @param reflectionId - The reflection ID to check
 * @param callback - Function called when echo status changes
 * @returns Unsubscribe function
 */
export const listenToReflectionEchoStatus = (
  userId: string,
  reflectionId: string,
  callback: (isLiked: boolean) => void
) => {
  const userDoc = doc(db, "users", userId);

  return onSnapshot(userDoc, (doc) => {
    if (doc.exists()) {
      const userData = doc.data() as User;
      const echoedReflections = userData.echoedReflections || {};
      const isLiked = Boolean(echoedReflections[reflectionId]);
      callback(isLiked);
    } else {
      callback(false);
    }
  });
};
