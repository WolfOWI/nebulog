// User Services
import { db } from "@/config/firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  where,
  query,
  increment,
} from "firebase/firestore";
import { User } from "@/lib/types";
import { updateAllReflectionsByAuthor } from "./reflectionServices";

/**
 * Create a new user document in the database
 * @param userId - User's Firebase Auth UID
 * @param username - User's username
 * @param email - User's email
 * @returns Nothing
 */
export const createNewUserDoc = async (userId: string, username: string, email: string) => {
  try {
    const userDoc = {
      username: username,
      email: email,
      bio: "",
      profileIcon: "ufo-outline",
      profileColor: "#4ECDC4",
      createdAt: new Date().toISOString(),
      streakCount: 0,
      totalReflections: 0,
      totalEchoes: 0,
      echoedReflections: {},
      blockedUserIds: {},
      lastReflectDate: "",
    };

    await setDoc(doc(db, "users", userId), userDoc); // setDoc (instead of addDoc) for setting user doc ID
    console.log("User document created with ID: ", userId);
  } catch (error) {
    throw new Error("Error creating user document: " + error);
  }
};

/**
 * Get user by id
 * @param id - User's id
 * @returns User object
 */
export const getUserById = async (id: string): Promise<User> => {
  const docRef = doc(db, "users", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const userData = docSnap.data() as User;
    return {
      ...userData,
      id: id,
    };
  } else {
    throw new Error("User not found");
  }
};

/**
 * Block a user
 * @param currentUserId - The ID of the user doing the blocking
 * @param userToBlockId - The ID of the user to block
 * @returns Nothing
 */
export const blockUser = async (currentUserId: string, userToBlockId: string) => {
  try {
    const userDoc = doc(db, "users", currentUserId);
    await updateDoc(userDoc, {
      [`blockedUserIds.${userToBlockId}`]: true,
    });
    console.log(`User ${currentUserId} blocked user ${userToBlockId}`);
  } catch (error) {
    throw new Error("Error blocking user: " + error);
  }
};

/**
 * Unblock a user
 * @param currentUserId - The ID of the user doing the unblocking
 * @param userToUnblockId - The ID of the user to unblock
 * @returns Nothing
 */
export const unblockUser = async (currentUserId: string, userToUnblockId: string) => {
  try {
    const userDoc = doc(db, "users", currentUserId);
    await updateDoc(userDoc, {
      [`blockedUserIds.${userToUnblockId}`]: false,
    });
    console.log(`User ${currentUserId} unblocked user ${userToUnblockId}`);
  } catch (error) {
    throw new Error("Error unblocking user: " + error);
  }
};

/**
 * Check if a user is blocked by another user
 * @param currentUserId - The ID of the user to check
 * @param userToCheckId - The ID of the user to check against
 * @returns Boolean indicating if the user is blocked
 */
export const isUserBlocked = async (
  currentUserId: string,
  userToCheckId: string
): Promise<boolean> => {
  try {
    const userData = await getUserById(currentUserId);
    return userData.blockedUserIds?.[userToCheckId] === true;
  } catch (error) {
    console.error("Error checking if user is blocked:", error);
    return false;
  }
};

/**
 * Update user details
 * @param userId - User's id
 * @param userData - User's data
 * @returns Nothing
 */
export const updateUserDetails = async (userId: string, userData: Partial<User>) => {
  try {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, userData);

    // Update all reflections of this user, if their profile info changes
    const reflectionUpdates: {
      authorUsername?: string;
      authorProfileColor?: string;
      authorProfileIcon?: string;
    } = {};

    if (userData.username) {
      reflectionUpdates.authorUsername = userData.username;
    }
    if (userData.profileColor) {
      reflectionUpdates.authorProfileColor = userData.profileColor;
    }
    if (userData.profileIcon) {
      reflectionUpdates.authorProfileIcon = userData.profileIcon;
    }

    // Only update reflections if there are profile changes
    if (Object.keys(reflectionUpdates).length > 0) {
      await updateAllReflectionsByAuthor(userId, reflectionUpdates);
    }
  } catch (error) {
    throw new Error("Error updating user details: " + error);
  }
};

/**
 * Check if username is already taken
 * @param username - User's username
 * @returns Boolean
 */
export const isUsernameTaken = async (username: string) => {
  const usernameFormatted = username.toLowerCase().trim();

  const userDoc = collection(db, "users");
  const q = query(userDoc, where("username", "==", usernameFormatted));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return false;
  } else {
    return true;
  }
};

/**
 * Get blocked users' details
 * @param currentUserId - The ID of the user whose blocked users to retrieve
 * @returns Array of blocked users with their details
 */
export const getBlockedUsers = async (currentUserId: string): Promise<User[]> => {
  try {
    const currentUser = await getUserById(currentUserId);
    if (!currentUser || !currentUser.blockedUserIds) {
      return [];
    }

    const blockedUserIds = Object.keys(currentUser.blockedUserIds).filter(
      (userId) => currentUser.blockedUserIds![userId] === true
    );

    const blockedUsers: User[] = [];
    for (const userId of blockedUserIds) {
      try {
        const blockedUser = await getUserById(userId);
        if (blockedUser) {
          blockedUsers.push(blockedUser);
        }
      } catch (error) {
        console.error(`Error fetching blocked user ${userId}:`, error);
      }
    }

    return blockedUsers;
  } catch (error) {
    throw new Error("Error getting blocked users: " + error);
  }
};
