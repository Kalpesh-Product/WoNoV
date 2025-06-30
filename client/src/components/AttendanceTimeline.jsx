import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { computeOffset, getElapsedSecondsWithOffset } from "../utils/time";
import humanTime from "../utils/humanTime";
import { BsCup, BsCupHot } from "react-icons/bs";
import { IoEnterOutline } from "react-icons/io5";

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
  const hasClockedIn = auth?.user?.clockInDetails?.hasClockedIn;
  const empID = auth?.user?.empId;

  // Boot with server timestamps
  useEffect(() => {
    const clockIn = auth?.user?.clockInDetails?.clockInTime;
    const serverNow = auth?.user?.time;

    if (auth?.user?.clockInDetails?.hasClockedIn && clockIn && serverNow) {
      setStartTime(clockIn);
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
                endBreak: brk.endBreak ? humanTime(brk.endBreak) : "0h:0m:0s",
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

  return (
    <div className="flex flex-col gap-4 p-4 h-80 ">
      <div className="flex justify-center ">
        <div className="col-span-2 flex flex-col gap-3 text-sm text-gray-700 overflow-scroll h-80 overflow-x-hidden w-full px-36">
          <div className="flex flex-col justify-between">
            <div className="flex gap-2 items-center justify-between">
              <div className="pb-1 flex gap-2 items-center">
                <IoEnterOutline />
                <span className="text-muted">Clock-in Time: &nbsp;</span>
              </div>
              <span className="font-medium">
                {todayAttendance?.inTime ? todayAttendance.inTime : "0h:0m:0s"}
              </span>
            </div>

            <div className="w-[1px] h-4 bg-borderGray ml-1"></div>
          </div>
          {todayAttendance?.breaks &&
            todayAttendance?.breaks.length > 0 &&
            todayAttendance?.breaks.map((brk, index) => (
              <div key={index} className="flex flex-col gap-1 items-start">
                <div className="flex justify-between w-full">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex gap-2 items-center">
                      <div className="pb-1">
                        <BsCupHot />
                      </div>
                      <span className="text-muted">Break Start: &nbsp;</span>
                    </div>
                  </div>
                  <span className="font-medium">{brk.startBreak}</span>
                </div>
                <div className="w-[1px] h-4 bg-borderGray ml-1"></div>
                <div className="flex justify-between w-full">
                  <div className="flex gap-2 items-center">
                    <div className="pb-0">
                      <BsCup />
                    </div>
                    <span className="text-muted">Break End: &nbsp;</span>
                  </div>
                  <span className="font-medium">{brk.endBreak}</span>
                </div>
                <div className="w-[1px] h-4 bg-borderGray ml-1"></div>
              </div>
            ))}

          {/* --START-- */}

          {/* --END-- */}
          <div className="flex justify-between">
            <span className="text-muted">Clock-out Time: &nbsp;</span>
            <span className="font-medium">
              {todayAttendance?.outTime ? todayAttendance.outTime : "0h:0m:0s"}
            </span>
          </div>
          <div className="flex justify-between h-4"></div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTimeline;
