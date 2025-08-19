// Utility functions for date operations

// Get if a date is within the last 20 seconds (suitable for checking if a reflection was created in the last 10 seconds)
export const isWithinLast20Seconds = (date: Date | string) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();

  if (diff < 20000) {
    return true;
  } else {
    return false;
  }
};
