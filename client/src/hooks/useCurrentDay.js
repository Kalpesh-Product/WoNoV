import { useEffect, useState } from "react";
import dayjs from "dayjs";

const getStartOfDay = () => dayjs().startOf("day");

export default function useCurrentDay() {
  const [today, setToday] = useState(getStartOfDay);

  useEffect(() => {
    const now = dayjs();
    const nextMidnight = now.add(1, "day").startOf("day");
    const timeoutMs = Math.max(nextMidnight.diff(now), 1000);

    const timer = setTimeout(() => {
      setToday(getStartOfDay());
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [today]);

  return today;
}
