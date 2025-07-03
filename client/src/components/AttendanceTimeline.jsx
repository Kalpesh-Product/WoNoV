import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { computeOffset, getElapsedSecondsWithOffset } from "../utils/time";
import humanTime from "../utils/humanTime";
import { BsCup, BsCupHot } from "react-icons/bs";
import { IoEnterOutline, IoExitOutline } from "react-icons/io5";
import { useSelector } from "react-redux";

const AttendanceTimeline = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();

  const [startTime, setStartTime] = useState(null);
  const [takeBreak, setTakeBreak] = useState(null);
  const [breaks, setBreaks] = useState([]);
  const [stopBreak, setStopBreak] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isBooting, setIsBooting] = useState(true);
  const timerRef = useRef(null);
   const {
    clockInTime,
    clockOutTime,
    breakTimings,
    workHours,
    breakHours,
    hasClockedIn,
  } = useSelector((state) => {
    return state.user;
  });
  const empID = auth?.user?.empId;
    const [clockedInStatus, setClockedInStatus] = useState(hasClockedIn);

  // Boot with server timestamps
  useEffect(() => {
    const clockIn = auth?.user?.clockInDetails?.clockInTime;
    const serverNow = auth?.user?.time;
       const hasClockedIn = auth?.user?.clockInDetails?.hasClockedIn;

    if (auth?.user?.clockInDetails?.hasClockedIn && clockIn && serverNow) {
      setStartTime(clockIn);
      setClockedInStatus(hasClockedIn)
      const calculatedOffset = computeOffset(serverNow);
      setOffset(calculatedOffset);
      setElapsedTime(getElapsedSecondsWithOffset(clockIn, calculatedOffset));
    }

    setIsBooting(false);
  }, [auth]);

  // Timer ticking using offset
  useEffect(() => {
    if (startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(getElapsedSecondsWithOffset(startTime, offset));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [startTime, offset]);

  const {
    data: todayAttendance,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user-attendance"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/attendance/get-attendance/${auth?.user?.empId}`
      );
      const allData = response.data;
      const today = new Date();

      const data = allData.find((entry) => {
        if (!entry.inTime) return false;
        const entryDate = new Date(entry.inTime);
        return (
          entryDate.getDate() === today.getDate() &&
          entryDate.getMonth() === today.getMonth() &&
          entryDate.getFullYear() === today.getFullYear()
        );
      });

      if (!data) return null;

      return {
        inTime: data.inTime ? humanTime(data.inTime) : null,
        outTime: data.outTime ? humanTime(data.outTime) : "0h:0m:0s",
        breaks: Array.isArray(data.breaks)
          ? data.breaks
              .filter((brk) => brk.startBreak)
              .map((brk) => ({
                startBreak: humanTime(brk.startBreak),
                endBreak: brk.endBreak ? humanTime(brk.endBreak) : null,
              }))
          : [],
      };
    },
  });

  if (isBooting) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-content text-gray-600">
          Loading attendance...
        </span>
      </div>
    );
  }

  
if (!todayAttendance) {
  return (
    <div className="flex justify-center items-center h-80">
      <span className="text-content text-gray-600">No Timeline</span>
    </div>
  );
}

return (
  <div className="flex flex-col gap-4 px-2 h-80">
    <div className="flex justify-center">
      <div className="flex flex-col gap-0 text-sm text-gray-700 overflow-y-scroll h-80 w-full px-4">

        {/* Clock-in */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2 items-center">
              <IoEnterOutline />
              <span className="text-muted">Clock-in Time</span>
            </div>
            <span className="font-medium">
              {todayAttendance?.inTime || "0h:0m:0s"}
            </span>
          </div>
        </div>

        {/* Breaks */}
        {todayAttendance?.breaks?.map((brk, index) => (
          <div key={index} className="flex flex-col gap-1 items-start motion-preset-slide-up-sm">
            <div className="w-[1px] h-4 bg-borderGray ml-1" />

            <div className="flex justify-between items-center w-full">
              <div className="flex gap-2 items-center">
                <BsCupHot />
                <span className="text-muted">Break Start</span>
              </div>
              <span className="font-medium">{brk.startBreak}</span>
            </div>

            {brk.endBreak && (
              <>
                <div className="w-[1px] h-4 bg-borderGray ml-1" />
                <div className="flex justify-between items-center w-full motion-preset-slide-up-sm">
                  <div className="flex gap-2 items-center">
                    <BsCup />
                    <span className="text-muted">Break End</span>
                  </div>
                  <span className="font-medium">{brk.endBreak}</span>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Clock-out */}
        {todayAttendance?.outTime &&
          todayAttendance.outTime !== "0h:0m:0s" && (
            <div className="flex flex-col gap-1 items-start">
              <div className="w-[1px] h-4 bg-borderGray ml-1" />
              <div className="flex justify-between items-center w-full">
                <div className="flex gap-2 items-center">
                  <IoEnterOutline className="rotate-180" />
                  <span className="text-muted">Clock-out Time</span>
                </div>
                <span className="font-medium">
                  {todayAttendance.outTime}
                </span>
              </div>
            </div>
          )}
      </div>
    </div>
  </div>
);

};

export default AttendanceTimeline;
