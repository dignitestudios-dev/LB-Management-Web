// All the helper functions should must be there.
// The functions that you're using multiple times must be there.
// e.g. formatDateToMMDDYYYY, formatEpochToMMDDYYYY, etc.

export function formatHour(hour) {
  const date = new Date();
  date.setHours(hour, 0, 0); // set hour, minutes, seconds
  return date.toLocaleTimeString([], { hour: "numeric", hour12: true });
}

export function convertToHoursAndMinutes  (totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};
