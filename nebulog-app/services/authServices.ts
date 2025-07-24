// Authentication Services
import { auth } from "@/config/firebaseConfig";
import { LoginCredentials, SignupCredentials, User } from "@/lib/types";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { createNewUserDoc, getUserById } from "./userServices";

/**
 * Check if user is logged in
 * @returns Boolean - True if user is logged in, false otherwise
 */
export const isUserLoggedIn = async (): Promise<boolean> => {
  // TODO: Implement authentication status check
  return false;
};

/**
 * Log in user with email and password
 * @param credentials - Login credentials (email, password)
 * @returns User object on successful login
 */
export const logInUser = async (credentials: LoginCredentials): Promise<User> => {
  // TODO: Implement Firebase log in
  throw new Error("Not implemented");
};

/**
 * Sign up new user with email and password
 * @param credentials - Signup credentials (username, email, password)
 * @returns User object on successful signup
 */
export const signUpUser = async (credentials: SignupCredentials): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    const user = userCredential.user;

    await createNewUserDoc(user.uid, credentials.username, credentials.email);
    const userDoc = await getUserById(user.uid);
    return userDoc;
  } catch (error) {
    throw new Error("Error signing up user: " + error);
  }
};

/**
 * Log out current user
 * @returns Nothing
 */
export const logOutUser = async (): Promise<void> => {
  // TODO: Implement Firebase sign out
  throw new Error("Not implemented");
};

/**
 * Get current authenticated user
 * @returns Current user object or null if not authenticated
 */
export const getCurrentUser = async (): Promise<User | null> => {
  // TODO: Implement get current user
  return null;
};

/**
 * Update user profile information
 * @param userData - User data to update
 * @returns Updated user object
 */
export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  // TODO: Implement user profile update
  throw new Error("Not implemented");
};

/**
 * Listen to authentication state changes
 * @param callback - Callback function
 * @returns Unsubscribe function
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  // TODO: Implement auth state listener
  return () => {
    // Return unsubscribe function
  };
};
