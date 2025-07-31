// Reflection Services

import {
  collection,
  addDoc,
  increment,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Reflection } from "@/lib/types";

/**
 * Create a new reflection
 * @param reflection - The reflection to create
 * @param userId - The user ID of the reflection's author
 */
export const createReflection = async (reflection: Reflection, userId: string) => {
  try {
    const reflectionsCollection = collection(db, "reflections");
    await addDoc(reflectionsCollection, reflection);

    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, {
        totalReflections: increment(1),
        lastReflectDate: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error incrementing reflection count:", error);
    }
  } catch (error) {
    throw new Error("Failed to create reflection: " + error);
  }
};

/**
 * Get all reflections created by a user
 * @param userId - The user ID to get reflections for
 */
export const getReflectionsForUser = async (userId: string) => {
  try {
    const reflectionsCollection = collection(db, "reflections");
    const q = query(reflectionsCollection, where("authorId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Reflection));
  } catch (error) {
    throw new Error("Failed to get reflections for user: " + error);
  }
};

/**
 * Update an existing reflection
 * @param reflectionId - The ID of the reflection to update
 * @param updates - The updates to apply to the reflection
 */
export const updateReflection = async (reflectionId: string, updates: Partial<Reflection>) => {
  try {
    const reflectionDoc = doc(db, "reflections", reflectionId);
    await updateDoc(reflectionDoc, updates);
  } catch (error) {
    throw new Error("Failed to update reflection: " + error);
  }
};

/**
 * Delete a reflection
 * @param reflectionId - The ID of the reflection to delete
 */
export const deleteReflection = async (reflectionId: string, userId: string) => {
  try {
    const reflectionDoc = doc(db, "reflections", reflectionId);
    await deleteDoc(reflectionDoc);

    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, {
        totalReflections: increment(-1),
      });
    } catch (error) {
      console.error("Error decreasing reflection count:", error);
    }
  } catch (error) {
    throw new Error("Failed to delete reflection: " + error);
  }
};
