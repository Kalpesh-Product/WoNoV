// utils/time.js
export function getElapsedSeconds(clockInTime, currentTime) {
  try {
    const start = new Date(clockInTime).getTime();
    const now = new Date(currentTime).getTime();
    if (isNaN(start) || isNaN(now)) return 0;
    return Math.floor((now - start) / 1000);
  } catch (e) {
    return 0;
  }
}
