// Reflection Services

import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Reflection } from "@/lib/types";

// Create a new reflection
export const createReflection = async (reflection: Reflection) => {
  try {
    const reflectionsCollection = collection(db, "reflections");
    await addDoc(reflectionsCollection, reflection);
  } catch (error) {
    throw new Error("Failed to create reflection: " + error);
  }
};
