// User Services
import { db } from "@/config/firebaseConfig";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
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
      profileIcon: "",
      profileColor: "",
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

// Get user by id
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
