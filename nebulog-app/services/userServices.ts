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
 * Update user details
 * @param userId - User's id
 * @param userData - User's data
 * @returns Nothing
 */
export const updateUserDetails = async (userId: string, userData: Partial<User>) => {
  try {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, userData);
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
  const userDoc = collection(db, "users");
  const q = query(userDoc, where("username", "==", username));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return false;
  } else {
    return true;
  }
};

/**
 * Plus 1 to user's reflection count
 * @param userId - User's id
 * @returns Nothing
 */
export const plusOneReflectionCount = async (userId: string) => {
  const userDoc = doc(db, "users", userId);
  await updateDoc(userDoc, { totalReflections: increment(1) });
};

/**
 * Minus 1 from user's reflection count
 * @param userId - User's id
 * @returns Nothing
 */
export const minusOneReflectionCount = async (userId: string) => {
  const userDoc = doc(db, "users", userId);
  await updateDoc(userDoc, { totalReflections: increment(-1) });
};
