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
  GeoPoint,
  orderBy,
  limit,
  startAt,
  endAt,
  getDoc,
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Reflection, User } from "@/lib/types";
import { geohashQueryBounds, distanceBetween } from "geofire-common";
import { getUserById } from "./userServices";
import { calculateNewStreak } from "@/utils/streakUtility";

/**
 * Create a new reflection
 * @param reflection - The reflection to create
 * @param userId - The user ID of the reflection's author
 */
export const createReflection = async (reflection: Reflection, userId: string) => {
  try {
    // Get user data to include author information
    const userData = await getUserById(userId);

    // Add author information to the reflection
    const reflectionWithAuthor = {
      ...reflection,
      authorUsername: userData.username,
      authorProfileColor: userData.profileColor,
      authorProfileIcon: userData.profileIcon,
    };

    const reflectionsCollection = collection(db, "reflections");

    await addDoc(reflectionsCollection, reflectionWithAuthor);

    // Update user totals (stats) and streak
    try {
      const userDoc = doc(db, "users", userId);
      const currentDate = new Date().toISOString();

      // Calculate new streak count
      const newStreak = calculateNewStreak(userData.streakCount, userData.lastReflectDate);

      console.log("createReflection: Updating user stats and streak:", {
        userId,
        currentStreak: userData.streakCount,
        lastReflectDate: userData.lastReflectDate,
        newStreak,
        currentDate,
      });

      await updateDoc(userDoc, {
        totalReflections: increment(1),
        lastReflectDate: currentDate,
        streakCount: newStreak,
      });

      console.log("createReflection: Successfully updated user streak to:", newStreak);
    } catch (error) {
      console.error("Error updating user stats and streak:", error);
    }
  } catch (error) {
    throw new Error("Failed to create reflection: " + error);
  }
};

/**
 * Update all reflections by an author when they update their profile
 * @param userId - The user ID whose reflections should be updated
 * @param updates - The profile updates to apply to all reflections
 */
export const updateAllReflectionsByAuthor = async (
  userId: string,
  updates: {
    authorUsername?: string;
    authorProfileColor?: string;
    authorProfileIcon?: string;
  }
) => {
  try {
    const reflectionsCollection = collection(db, "reflections");
    const q = query(reflectionsCollection, where("authorId", "==", userId));
    const querySnapshot = await getDocs(q);

    const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
      const reflectionDoc = doc(db, "reflections", docSnapshot.id);
      await updateDoc(reflectionDoc, updates);
    });

    await Promise.all(updatePromises);
    console.log(`Updated ${querySnapshot.docs.length} reflections for user ${userId}`);
  } catch (error) {
    throw new Error("Failed to update reflections: " + error);
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
 * Get all public reflections created by a user
 * @param userId - The user ID to get reflections for
 */
export const getPublicReflectionsForUser = async (userId: string) => {
  try {
    const reflectionsCollection = collection(db, "reflections");
    const q = query(
      reflectionsCollection,
      where("authorId", "==", userId),
      where("visibility", "==", "public")
    );
    const querySnapshot = await getDocs(q);
    let reflections = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Reflection)
    );

    return reflections;
  } catch (error) {
    throw new Error("Failed to get public reflections for user: " + error);
  }
};

/**
 * Get all public reflections within a radius of a location
 * @param lat - Latitude of the centre point
 * @param long - Longitude of the centre point
 * @param radius - Radius in kilometres to search within
 * @param currentUserId - Optional current user ID to filter out blocked users' reflections
 * @returns Array of reflections within the radius
 */
export const getPublicReflectionsInRadius = async (
  lat: number,
  long: number,
  radius: number,
  currentUserId?: string
) => {
  try {
    const center = [lat, long] as [number, number];
    const radiusInM = radius * 1000;

    const bounds = geohashQueryBounds(center, radiusInM);
    const promises = [];

    for (const b of bounds) {
      const q = query(
        collection(db, "reflections"),
        where("visibility", "==", "public"),
        orderBy("location.geohash"),
        startAt(b[0]),
        endAt(b[1])
      );

      promises.push(getDocs(q));
    }

    // Collect all the query results together into a single list
    const snapshots = await Promise.all(promises);

    const matchingDocs = [];
    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        const data = doc.data();

        // Check if the document has location data
        if (!data.location || !data.location.lat || !data.location.long) {
          continue;
        }

        const lat = data.location.lat;
        const lng = data.location.long;

        // We have to filter out a few false positives due to GeoHash
        // accuracy, but most will match
        const distanceInKm = distanceBetween([lat, lng], center);
        const distanceInM = distanceInKm * 1000;
        if (distanceInM <= radiusInM) {
          matchingDocs.push({ id: doc.id, ...doc.data() } as Reflection);
        }
      }
    }

    // Filter out reflections from blocked users if currentUserId is provided
    if (currentUserId) {
      const { getUserById } = await import("./userServices");
      const currentUser = await getUserById(currentUserId);
      const blockedUserIds = currentUser.blockedUserIds || {};

      const filteredDocs = matchingDocs.filter((reflection) => {
        return !blockedUserIds[reflection.authorId];
      });

      // console.log(`Found ${filteredDocs.length} reflections within ${radius}km of [${lat}, ${long}] (filtered from ${matchingDocs.length} total)`);
      return filteredDocs;
    }

    // console.log(`Found ${matchingDocs.length} reflections within ${radius}km of [${lat}, ${long}]`);
    return matchingDocs;
  } catch (error) {
    console.error("Error fetching reflections in radius:", error);
    return [];
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

/**
 * Get echoed reflections for a user
 * @param userId - The user ID to get echoed reflections for
 * @returns Array of reflections that the user has echoed
 */
export const getEchoedReflectionsForUser = async (userId: string): Promise<Reflection[]> => {
  try {
    // First get the user's echoed reflection IDs
    const userDoc = doc(db, "users", userId);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      return [];
    }

    const userData = userSnapshot.data();
    const echoedReflectionIds = Object.keys(userData.echoedReflections || {}).filter(
      (reflectionId) => userData.echoedReflections[reflectionId] === true
    );

    if (echoedReflectionIds.length === 0) {
      return [];
    }

    // Fetch the actual reflection documents
    const reflections: Reflection[] = [];

    for (const reflectionId of echoedReflectionIds) {
      try {
        const reflectionDoc = doc(db, "reflections", reflectionId);
        const reflectionSnapshot = await getDoc(reflectionDoc);

        if (reflectionSnapshot.exists()) {
          const reflectionData = reflectionSnapshot.data();
          reflections.push({
            id: reflectionSnapshot.id,
            authorId: reflectionData.authorId,
            authorUsername: reflectionData.authorUsername,
            authorProfileColor: reflectionData.authorProfileColor,
            authorProfileIcon: reflectionData.authorProfileIcon,
            text: reflectionData.text,
            visibility: reflectionData.visibility,
            location: reflectionData.location,
            mood: reflectionData.mood,
            createdAt: reflectionData.createdAt,
            echoCount: reflectionData.echoCount,
          });
        }
      } catch (error) {
        console.error(`Error fetching echoed reflection ${reflectionId}:`, error);
      }
    }

    // Sort by creation date (newest first)
    return reflections.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    throw new Error("Error getting echoed reflections: " + error);
  }
};
