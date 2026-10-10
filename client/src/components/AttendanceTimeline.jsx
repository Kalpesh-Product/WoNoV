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
import { MdAccessTime, MdOutlinePendingActions } from "react-icons/md";

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
    <div className="flex min-h-[365px] flex-col items-center justify-center px-6 text-center">
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[#f1f6ff]">
        <MdOutlinePendingActions
          size={72}
          className="text-[#b8d1fb]"
          aria-hidden="true"
        />
        <span className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#8eb7f8] text-white shadow-md">
          <MdAccessTime size={27} aria-hidden="true" />
        </span>
      </div>
      <h3 className="mt-5 text-lg font-pbold text-[#1E3D73]">No activity yet</h3>
      <p className="mt-1 text-sm font-pregular text-[#1E3D73]">
        Your attendance activity will appear here.
      </p>
    </div>
  );
}

return (
  <div className="min-h-[365px] px-5 py-5">
    <div className="mx-auto flex max-h-[340px] w-full flex-col overflow-y-auto pr-1 text-sm text-[#1E3D73]">

        {/* Clock-in */}
        <div className="relative flex items-center justify-between gap-4 pb-5">
          <span className="absolute left-5 top-10 h-[calc(100%-28px)] w-px bg-[#dce5f1]" />
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5f8ef] text-[#07965f]">
              <IoEnterOutline size={20} />
            </span>
            <div>
              <div className="font-pmedium text-[#1E3D73]">Clock-in Time</div>
              <div className="mt-0.5 text-xs text-[#1E3D73]">Workday started</div>
            </div>
          </div>
          <span className="font-pbold text-[#1E3D73]">
            {todayAttendance?.inTime || "--"}
          </span>
        </div>

        {/* Breaks */}
        {todayAttendance?.breaks?.map((brk, index) => (
          <div key={index} className="motion-preset-slide-up-sm">
            <div className="relative flex items-center justify-between gap-4 pb-5">
              <span className="absolute left-5 top-10 h-[calc(100%-28px)] w-px bg-[#dce5f1]" />
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff8e1] text-[#a66b00]">
                  <BsCupHot size={18} />
                </span>
                <div>
                  <div className="font-pmedium text-[#1E3D73]">Break Start</div>
                  <div className="mt-0.5 text-xs text-[#1E3D73]">Break activated</div>
                </div>
              </div>
              <span className="font-pbold text-[#1E3D73]">{brk.startBreak}</span>
            </div>

            {brk.endBreak && (
              <div className="relative flex items-center justify-between gap-4 pb-5 motion-preset-slide-up-sm">
                <span className="absolute left-5 top-10 h-[calc(100%-28px)] w-px bg-[#dce5f1]" />
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff8e1] text-[#a66b00]">
                    <BsCup size={18} />
                  </span>
                  <div>
                    <div className="font-pmedium text-[#1E3D73]">Break End</div>
                    <div className="mt-0.5 text-xs text-[#1E3D73]">Work resumed</div>
                  </div>
                </div>
                <span className="font-pbold text-[#1E3D73]">{brk.endBreak}</span>
              </div>
            )}
          </div>
        ))}

        {/* Clock-out */}
        {todayAttendance?.outTime &&
          todayAttendance.outTime !== "0h:0m:0s" && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0f0] text-[#ff0000b3]">
                  <IoExitOutline size={20} />
                </span>
                <div>
                  <div className="font-pmedium text-[#1E3D73]">Clock-out Time</div>
                  <div className="mt-0.5 text-xs text-[#1E3D73]">Workday completed</div>
                </div>
              </div>
              <span className="font-pbold text-[#1E3D73]">
                {todayAttendance.outTime}
              </span>
            </div>
          )}
    </div>
  </div>
);

};

export default AttendanceTimeline;
