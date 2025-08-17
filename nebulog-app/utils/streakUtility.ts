/**
 * Calculate the number of days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between the dates
 */
const getDaysBetween = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.round(diffTime / oneDay);
};

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

  // Reset time to start of day for accurate day calculation
  const lastReflectionStart = new Date(
    lastReflection.getFullYear(),
    lastReflection.getMonth(),
    lastReflection.getDate()
  );
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const daysSinceLastReflection = getDaysBetween(lastReflectionStart, todayStart);

  // Streak is valid if the reflection wasn't more than 1 day ago
  const isValid = daysSinceLastReflection <= 1;

  console.log("validateStreak:", {
    lastReflectDate,
    lastReflectionStart: lastReflectionStart.toISOString(),
    todayStart: todayStart.toISOString(),
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

  const { daysSinceLastReflection } = validateStreak(lastReflectDate);
  console.log("calculateNewStreak: Days since last reflection:", daysSinceLastReflection);

  let newStreak: number;
  if (daysSinceLastReflection === 0) {
    // Same day reflection: keep current streak or set to 1 if it was 0
    newStreak = currentStreak === 0 ? 1 : currentStreak;
    console.log("calculateNewStreak: Same day reflection, setting streak to:", newStreak);
  } else if (daysSinceLastReflection === 1) {
    // Consecutive day, increment streak
    newStreak = currentStreak + 1;
    console.log("calculateNewStreak: Consecutive day, incrementing streak to:", newStreak);
  } else {
    // Gap in streak (more than 1 day), reset to 1
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

  const { daysSinceLastReflection } = validateStreak(lastReflectDate);
  // Only reset if more than 1 day has passed since last reflection
  const shouldReset = daysSinceLastReflection > 1;

  console.log("shouldResetStreak:", {
    lastReflectDate,
    daysSinceLastReflection,
    shouldReset,
  });

  return shouldReset;
};
