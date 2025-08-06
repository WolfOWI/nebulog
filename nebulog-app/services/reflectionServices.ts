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
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Reflection } from "@/lib/types";
import { geohashQueryBounds, distanceBetween } from "geofire-common";

/**
 * Create a new reflection
 * @param reflection - The reflection to create
 * @param userId - The user ID of the reflection's author
 */
export const createReflection = async (reflection: Reflection, userId: string) => {
  try {
    const reflectionsCollection = collection(db, "reflections");

    await addDoc(reflectionsCollection, reflection);

    // Update user totals (stats)
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
 * Get all public reflections within a radius of a location
 * @param lat - Latitude of the centre point
 * @param long - Longitude of the centre point
 * @param radius - Radius in kilometres to search within
 * @returns Array of reflections within the radius
 */
export const getPublicReflectionsInRadius = async (lat: number, long: number, radius: number) => {
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
