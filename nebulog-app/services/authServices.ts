// Authentication Services
import { auth } from "@/config/firebaseConfig";
import { LoginCredentials, SignupCredentials, User, AuthResult, LogoutResult } from "@/lib/types";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { createNewUserDoc, getUserById } from "./userServices";

/**
 * Check if user is logged in
 * @returns Boolean - True if user is logged in, false otherwise
 */
export const isUserLoggedIn = async (): Promise<boolean> => {
  return auth.currentUser !== null;
};

/**
 * Log in user with email and password
 * @param credentials - Login credentials (email, password)
 * @returns Result object with success status and user data or error message
 */
export const logInUser = async (credentials: LoginCredentials): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    const user = userCredential.user;
    if (user) {
      const userDoc = await getUserById(user.uid);
      return { success: true, user: userDoc };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error: any) {
    // Handle Firebase authentication errors gracefully
    console.log(error.code);
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
      return { success: false, error: "Invalid email or password" };
    } else if (error.code === "auth/invalid-email") {
      return { success: false, error: "Invalid email format" };
    } else if (error.code === "auth/too-many-requests") {
      return { success: false, error: "Too many failed attempts. Please try again later" };
    } else if (error.code === "auth/network-request-failed") {
      return { success: false, error: "Network error. Please check your connection" };
    } else {
      // Generic message
      return { success: false, error: "Login failed. Please try again" };
    }
  }
};

/**
 * Sign up new user with email and password
 * @param credentials - Signup credentials (username, email, password)
 * @returns Result object with success status and user data or error message
 */
export const signUpUser = async (credentials: SignupCredentials): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    const user = userCredential.user;

    await createNewUserDoc(user.uid, credentials.username, credentials.email);
    const userDoc = await getUserById(user.uid);
    return { success: true, user: userDoc };
  } catch (error: any) {
    // Handle Firebase authentication errors gracefully
    if (error.code === "auth/email-already-in-use") {
      return { success: false, error: "Email already in use. Please use a different email" };
    } else if (error.code === "auth/invalid-email") {
      return { success: false, error: "Invalid email format" };
    } else if (error.code === "auth/weak-password") {
      return { success: false, error: "Password is too weak. Please choose a stronger password" };
    } else if (error.code === "auth/network-request-failed") {
      return { success: false, error: "Network error. Please check your connection" };
    } else {
      // For any other Firebase errors, return a generic user-friendly message
      return { success: false, error: "Signup failed. Please try again" };
    }
  }
};

/**
 * Log out current user
 * @returns Nothing
 */
export const logOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error("Error signing out: " + error);
  }
};

/**
 * Get current authenticated user
 * @returns Current user object or null if not authenticated
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      return await getUserById(currentUser.uid);
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Listen to authentication state changes
 * @param callback - Callback function
 * @returns Unsubscribe function
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDoc = await getUserById(firebaseUser.uid);
        callback(userDoc);
      } catch (error) {
        console.error("Error fetching user data:", error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};
