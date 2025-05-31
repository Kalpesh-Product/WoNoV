import { useEffect, useMemo } from "react";
import useAuth from "../hooks/useAuth"; // adjust path if needed

export function useTopDepartment({
  onNotTop,
  additionalTopDepartmentIds = [],
} = {}) {
  const { auth } = useAuth();

  // Base top management ID (always included)
  const baseTopDepartmentId = "67b2cf85b9b6ed5cedeb9a2e";

  // Ensure the baseTopDepartmentId is always included
  const topDepartmentIds = useMemo(() => {
    const allIds = new Set([baseTopDepartmentId, ...additionalTopDepartmentIds]);
    return Array.from(allIds);
  }, [additionalTopDepartmentIds]);

  const currentDepartmentId = auth.user?.departments?.[0]?._id;
  const currentDepartment = auth.user?.departments?.[0]?.name;
  const isTop = topDepartmentIds.includes(currentDepartmentId);

  useEffect(() => {
    if (!isTop && currentDepartmentId && currentDepartment) {
      onNotTop?.(currentDepartmentId, currentDepartment);
    }
  }, [currentDepartmentId, currentDepartment, isTop, onNotTop]);

  return {
    isTop,
    currentDepartmentId,
    currentDepartment,
  };
}
