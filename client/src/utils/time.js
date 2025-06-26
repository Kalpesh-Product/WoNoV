export const computeOffset = (serverTime) => {
  return new Date(serverTime).getTime() - Date.now();
};

export const getElapsedSecondsWithOffset = (startTime, offset) => {
  const now = Date.now() + offset;
  const diff = now - new Date(startTime).getTime();
  return Math.max(Math.floor(diff / 1000), 0); // ensure it's not negative
};

