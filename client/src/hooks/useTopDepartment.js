import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth"; // adjust path if needed

export function useTopDepartment({
  onNotTop,
  topDepartmentId = "67b2cf85b9b6ed5cedeb9a2e",
} = {}) {
  const { auth } = useAuth();

  const currentDepartmentId = auth.user?.departments?.[0]?._id;
  const currentDepartment = auth.user?.departments?.[0]?.name;
  const isTop = currentDepartmentId === topDepartmentId;

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
