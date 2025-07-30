// Reflection Services

import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Reflection } from "@/lib/types";
import { plusOneReflectionCount } from "./userServices";

// Create a new reflection
export const createReflection = async (reflection: Reflection, userId: string) => {
  try {
    const reflectionsCollection = collection(db, "reflections");
    await addDoc(reflectionsCollection, reflection);

    try {
      await plusOneReflectionCount(userId);
    } catch (error) {
      console.error("Error incrementing reflection count:", error);
    }
  } catch (error) {
    throw new Error("Failed to create reflection: " + error);
  }
};
