import { db } from "../config/firebaseConfig";
import { ref, push, get } from "firebase/database";

const writeNote = async () => {
  try {
    console.log("Attempting to write to Realtime Database...");

    // First, let's test if we can read from the database
    console.log("Testing read access...");
    const reflectionsRef = ref(db, "reflections");
    const snapshot = await get(reflectionsRef);
    console.log("Read test successful, found", snapshot.size || 0, "documents");

    // Now try to write
    console.log("Testing write access...");
    const newReflectionRef = ref(db, "reflections");
    const docRef = await push(newReflectionRef, {
      content: "My third note!",
      createdAt: new Date().toISOString(),
      testId: Date.now(), // Add unique identifier
    });

    console.log("Document written successfully with key: ", docRef.key);
    return { success: true, id: docRef.key };
  } catch (e) {
    console.error("Firebase error details:", {
      code: e.code,
      message: e.message,
      stack: e.stack,
    });
    return { success: false, error: e };
  }
};

export { writeNote };
