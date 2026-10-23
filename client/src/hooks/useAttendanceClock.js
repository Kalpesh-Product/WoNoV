import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import useAxiosPrivate from "./useAxiosPrivate";
import { getAttendanceClockState } from "../utils/attendanceClockState";

const useAttendanceClock = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  const query = useQuery({
    queryKey: ["attendance-clock", auth?.user?._id],
    enabled: Boolean(auth?.user?._id && auth?.user?.empId),
    queryFn: async () => {
      const response = await axios.get(
        `/api/attendance/get-attendance/${auth.user.empId}`,
        { params: { latest: "true" } },
      );
      return response.data?.[0] || null;
    },
    refetchInterval: 60000,
  });
  return { ...query, clockState: getAttendanceClockState(query.data, now) };
};

export default useAttendanceClock;
