export const computeOffset = (serverTime) => {
  return new Date(serverTime).getTime() - Date.now();
};

export const getElapsedSecondsWithOffset = (startTime, offset) => {
  const now = Date.now() + offset;
  return Math.floor((now - new Date(startTime).getTime()) / 1000);
};
