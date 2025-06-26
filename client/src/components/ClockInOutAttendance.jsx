import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import PrimaryButton from "../components/PrimaryButton";
import useAuth from "../hooks/useAuth";

const ClockInOutAttendance = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth(); 
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isBooting, setIsBooting] = useState(true);
  const timerRef = useRef(null);

  // ✅ On load, set startTime from persisted clock-in
  useEffect(() => {
    if (auth?.user?.hasClockedIn && auth?.user?.clockInTime) {
      const storedStartTime = new Date(auth.user.clockInTime).toISOString();
      setStartTime(storedStartTime);
    }
    setIsBooting(false);
  }, [auth]);

  // ⏱️ Mutation to clock-in
  const { mutate: clockIn, isPending: isClockingIn } = useMutation({
    mutationFn: async (startTime) => {
      const response = await axios.post("/api/attendance/clock-in", {
        inTime : startTime,
        entryType: "web",
      });
      return response.data;
    },
    onSuccess: () => toast.success("Clocked in successfully!"),
    onError: () => toast.error("Clock in failed."),
  });

  // ⏱️ Mutation to clock-out
  const { mutate: clockOut, isPending: isClockingOut } = useMutation({
    mutationFn: async (endTime) => {
      const response = await axios.post("/api/attendance/clock-out", {
        endTime,
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
        setElapsedTime(Math.floor((Date.now() - new Date(startTime)) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [startTime]);

  const handleStart = () => {
    const now = new Date().toISOString();
    setStartTime(now);
    clockIn(now);
  };

  const handleStop = () => {
    const endTime = new Date().toISOString();
    clockOut(endTime);
  };

  const formatElapsedTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // Loading state during token check
  if (isBooting) {
    return (
      <div className="flex items-center justify-center h-48">
        <span className="text-sm text-gray-500">Loading attendance state...</span>
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

      <div className="h-10 w-10 p-20 rounded-full text-center bg-primary text-white flex justify-center items-center">
        <button
          onClick={startTime ? handleStop : handleStart}
          className="hover:scale-105 transition-all"
          disabled={isClockingIn || isClockingOut}
        >
          {startTime ? "Stop" : isClockingIn ? "Starting..." : "Start"}
        </button>
      </div>
    </div>
  );
};

export default ClockInOutAttendance;
