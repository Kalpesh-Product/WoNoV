import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { computeOffset, getElapsedSecondsWithOffset } from "../utils/time";

const ClockInOutAttendance = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();

  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isBooting, setIsBooting] = useState(true);
  const timerRef = useRef(null);

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

  const { mutate: clockIn, isPending: isClockingIn } = useMutation({
    mutationFn: async (inTime) => {
      const res = await axios.post("/api/attendance/clock-in", {
        inTime,
        entryType: "web",
      });
      return { data: res.data, inTime }; // Return both server response and time
    },
    onSuccess: ({ data, inTime }) => {
      toast.success("Clocked in successfully!");
      setStartTime(inTime);
      setOffset(0); // start fresh
      setElapsedTime(getElapsedSecondsWithOffset(inTime, 0));
    },
    onError: (error) => toast.error(error.response.data.message),
  });

  const { mutate: clockOut, isPending: isClockingOut } = useMutation({
    mutationFn: async (outTime) => {
      const res = await axios.patch("/api/attendance/clock-out", {
        outTime,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Clocked out successfully!");
      setStartTime(null);
      setElapsedTime(0);
      setOffset(0);
    },
    onError: (error) => toast.error(error.response.data.message),
  });

  const handleStart = () => {
    const now = new Date().toISOString();
    clockIn(now); // Only call the API, don't start timer yet
  };

  const handleStop = () => {
    const now = new Date().toISOString();
    clockOut(now);
  };

  const formatElapsedTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  if (isBooting) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-sm text-gray-600">Loading attendance...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 border rounded-md w-full max-w-md mx-auto shadow">
      <span className="text-title font-pmedium text-primary">
        Clock In / Out Attendance
      </span>

      <div className="text-lg font-medium">
        {startTime
          ? `Time Elapsed: ${formatElapsedTime(elapsedTime)}`
          : "Not Clocked In"}
      </div>

      <button
        onClick={startTime ? handleStop : handleStart}
        className="h-40 w-40 rounded-full bg-primary text-white flex justify-center items-center hover:scale-105 transition-all"
        disabled={isClockingIn || isClockingOut}
      >
        {startTime ? "Stop" : isClockingIn ? "Starting..." : "Start"}
      </button>
    </div>
  );
};

export default ClockInOutAttendance;
