import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";

const ClockInOutAttendance = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isBooting, setIsBooting] = useState(true);
  const timerRef = useRef(null);

  // ✅ On load, set startTime and base it off server time
  useEffect(() => {
    const clockIn = auth?.user?.clockInDetails?.clockInTime;
    const serverNow = auth?.user?.time;

    if (auth?.user?.clockInDetails?.hasClockedIn && clockIn && serverNow) {
      const start = new Date(clockIn).getTime();
      const serverNowTime = new Date(serverNow).getTime();
      const elapsed = Math.floor((serverNowTime - start) / 1000);
      setStartTime(start); // Store as timestamp
      setElapsedTime(elapsed);
    }

    setIsBooting(false);
  }, [auth]);

  // ⏱️ Mutation to clock-in
  const { mutate: clockIn, isPending: isClockingIn } = useMutation({
    mutationFn: async (inTime) => {
      const response = await axios.post("/api/attendance/clock-in", {
        inTime,
        entryType: "web",
      });
      return response.data;
    },
    onSuccess: () => toast.success("Clocked in successfully!"),
    onError: () => toast.error("Clock in failed."),
  });

  // ⏱️ Mutation to clock-out
  const { mutate: clockOut, isPending: isClockingOut } = useMutation({
    mutationFn: async (outTime) => {
      const response = await axios.patch("/api/attendance/clock-out", {
        outTime,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Clocked out successfully!");
      setStartTime(null);
      setElapsedTime(0);
    },
    onError: () => toast.error("Clock out failed."),
  });

  // ⏱️ Timer logic
  useEffect(() => {
    if (startTime) {
      timerRef.current = setInterval(() => {
        const secondsElapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(secondsElapsed);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [startTime]);

  const handleStart = () => {
    const now = new Date().toISOString();
    setStartTime(new Date(now).getTime());
    clockIn(now);
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
      <div className="flex items-center justify-center h-48">
        <span className="text-sm text-gray-500">
          Loading attendance state...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 border rounded-md w-full max-w-md mx-auto shadow">
      <span className="text-title font-pmedium text-primary">
        Clock In / Out Attendance
      </span>

      <div className="text-lg text-content font-medium">
        {startTime
          ? `Time Elapsed: ${formatElapsedTime(elapsedTime)}`
          : "Not Clocked In"}
      </div>

      <button
        onClick={startTime ? handleStop : handleStart}
        className="hover:scale-105 transition-all h-40 w-40 rounded-full text-center bg-primary text-white flex justify-center items-center"
        disabled={isClockingIn || isClockingOut}
      >
        {startTime ? "Stop" : isClockingIn ? "Starting..." : "Start"}
      </button>
    </div>
  );
};

export default ClockInOutAttendance;
