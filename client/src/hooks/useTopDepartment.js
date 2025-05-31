import { useEffect, useMemo } from "react";
import useAuth from "../hooks/useAuth"; // adjust path if needed

export function useTopDepartment({
  onNotTop,
  additionalTopUserIds = [],
} = {}) {
  const { auth } = useAuth();

  // Base top-level user ID (always included)
  const baseTopUserId = "67b83885daad0f7bab2f184f";

  // Combine base ID and additional ones
  const topUserIds = useMemo(() => {
    const allIds = new Set([baseTopUserId, ...additionalTopUserIds]);
    return Array.from(allIds);
  }, [additionalTopUserIds]);

  const currentUserId = auth.user?._id;
  const currentUserName = `${auth.user?.firstName || ""} ${auth.user?.lastName || ""}`.trim();
  const isTop = topUserIds.includes(currentUserId);

  useEffect(() => {
    if (!isTop && currentUserId && currentUserName) {
      onNotTop?.(currentUserId, currentUserName);
    }
  }, [currentUserId, currentUserName, isTop, onNotTop]);

  return {
    isTop,
    currentUserId,
    currentUserName,
  };
}
