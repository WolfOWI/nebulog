// Reflection Services

import { collection, addDoc, increment, doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Reflection } from "@/lib/types";

// Create a new reflection
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
