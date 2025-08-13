/**
 * Streak Utility Functions
 * Handles streak validation and calculation for habit tracking
 */

/**
 * Check if a user's streak is still valid based on their last reflection date
 * @param lastReflectDate - The date of the last reflection (ISO format)
 * @returns Object with boolean of whether streak is valid and number of days since last reflection
 */
export const validateStreak = (lastReflectDate?: string) => {
  if (!lastReflectDate) {
    console.log("validateStreak: No lastReflectDate provided");
    return { isValid: false, daysSinceLastReflection: Infinity };
  }

  const lastReflection = new Date(lastReflectDate);
  const today = new Date();

  // Reset time to start of day
  const lastReflectionStart = new Date(
    lastReflection.getFullYear(),
    lastReflection.getMonth(),
    lastReflection.getDate()
  );
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const timeDiff = todayStart.getTime() - lastReflectionStart.getTime();
  const daysSinceLastReflection = Math.floor(timeDiff / (1000 * 3600 * 24));

  // Streak is valid if the reflection wasn't more than 1 day ago
  const isValid = daysSinceLastReflection <= 1;

  console.log("validateStreak:", {
    lastReflectDate,
    lastReflectionStart: lastReflectionStart.toISOString(),
    todayStart: todayStart.toISOString(),
    timeDiff,
    daysSinceLastReflection,
    isValid,
  });

  return { isValid, daysSinceLastReflection };
};

/**
 * Calculate the new streak count when a user posts a reflection
 * @param currentStreak - Current streak count
 * @param lastReflectDate - The date of the last reflection (ISO format)
 * @returns New streak count (as a number)
 */
export const calculateNewStreak = (currentStreak: number, lastReflectDate?: string): number => {
  console.log("calculateNewStreak: Input:", { currentStreak, lastReflectDate });

  if (!lastReflectDate) {
    console.log("calculateNewStreak: No lastReflectDate, returning 1 (first reflection)");
    return 1; // First reflection ever
  }

  const { isValid, daysSinceLastReflection } = validateStreak(lastReflectDate);
  console.log("calculateNewStreak: Streak validation:", { isValid, daysSinceLastReflection });

  let newStreak: number;
  if (daysSinceLastReflection === 0) {
    // Same day reflection: if current streak is 0, make it 1; otherwise keep current streak
    newStreak = currentStreak === 0 ? 1 : currentStreak;
    console.log("calculateNewStreak: Same day reflection, setting streak to:", newStreak);
  } else if (daysSinceLastReflection === 1) {
    // Consecutive day, increment streak
    newStreak = currentStreak + 1;
    console.log("calculateNewStreak: Consecutive day, incrementing streak to:", newStreak);
  } else {
    // Gap in streak, reset to 1 (will become active streak)
    newStreak = 1;
    console.log("calculateNewStreak: Gap in streak, resetting to 1");
  }

  console.log("calculateNewStreak: Final result:", newStreak);
  return newStreak;
};

/**
 * Check if a user should reset their streak to 0
 * @param lastReflectDate - The date of the last reflection (ISO format)
 * @returns True if streak should be reset to 0 (boolean)
 */
export const shouldResetStreak = (lastReflectDate?: string): boolean => {
  if (!lastReflectDate) {
    console.log("shouldResetStreak: No lastReflectDate provided, returning false");
    return false; // No previous reflections, don't reset
  }

  const { isValid, daysSinceLastReflection } = validateStreak(lastReflectDate);
  const shouldReset = !isValid && daysSinceLastReflection > 1;

  console.log("shouldResetStreak:", {
    lastReflectDate,
    isValid,
    daysSinceLastReflection,
    shouldReset,
  });

  return shouldReset;
};
