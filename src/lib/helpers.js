// All the helper functions should must be there.
// The functions that you're using multiple times must be there.
// e.g. formatDateToMMDDYYYY, formatEpochToMMDDYYYY, etc.

export function formatHour(hour) {
  const date = new Date();
  date.setHours(hour, 0, 0); // set hour, minutes, seconds
  return date.toLocaleTimeString([], { hour: "numeric", hour12: true });
}
