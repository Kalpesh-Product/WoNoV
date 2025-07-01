import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { computeOffset, getElapsedSecondsWithOffset } from "../utils/time";
import humanTime from "../utils/humanTime";
import { queryClient } from "../main";
import { format } from "date-fns";

const ClockInOutAttendance = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();

  const [startTime, setStartTime] = useState(null);
  const [clockTime, setClockTime] = useState({
    startTime: null,
    endTime: null,
  });
  const [takeBreak, setTakeBreak] = useState(null);
  const [breaks, setBreaks] = useState([]);
  const [totalHours, setTotalHours] = useState({
    workHours: "0h:0m:0s",
    breakHours: "0h:0m:0s",
  });
  const [stopBreak, setStopBreak] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isBooting, setIsBooting] = useState(true);
  const timerRef = useRef(null);
  const currDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  // Boot with server timestamps
  useEffect(() => {
    const clockIn = auth?.user?.clockInDetails?.clockInTime;
    const serverNow = auth?.user?.time;

    if (auth?.user?.clockInDetails?.hasClockedIn && clockIn && serverNow) {
      setStartTime(clockIn);
      const calculatedOffset = computeOffset(new Date());
      setOffset(calculatedOffset);
      setElapsedTime(getElapsedSecondsWithOffset(clockIn, calculatedOffset));
    }

    const breaksFromServer = auth?.user?.clockInDetails?.breaks;
    if (Array.isArray(breaksFromServer)) {
      setBreaks(breaksFromServer);
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
      setClockTime((prev) => ({ ...prev, startTime: inTime }));
      setOffset(0); // start fresh
      setElapsedTime(getElapsedSecondsWithOffset(inTime, 0));
      queryClient.invalidateQueries({ queryKey: ["user-attendance"] });
    },
    onError: (error) => toast.error(error.response.data.message),
  });

  const { mutate: clockOut, isPending: isClockingOut } = useMutation({
    mutationFn: async (outTime) => {
      const res = await axios.patch("/api/attendance/clock-out", {
        outTime,
      });
      return { data: res.data, outTime };
    },
    onSuccess: ({ data, outTime }) => {
      toast.success("Clocked out successfully!");
      setStartTime(null);
      setClockTime((prev) => ({ ...prev, endTime: outTime }));
      setElapsedTime(0);
      setOffset(0);
      setTotalHours((prev) => ({
        ...prev,
        workHours: calculateTotalHours(startTime, outTime, "workhours"),
      }));
      queryClient.invalidateQueries({ queryKey: ["user-attendance"] });
    },
    onError: (error) => toast.error(error.response.data.message),
  });

  const { mutate: startBreak, isPending: isStartbreak } = useMutation({
    mutationFn: async (breakTime) => {
      const res = await axios.patch("/api/attendance/start-break", {
        startBreak: breakTime,
      });
      return { data: res.data, breakTime }; // Return both server response and time
    },
    onSuccess: ({ data, breakTime }) => {
      toast.success("Break started");
      setStopBreak(null);
      setTakeBreak(breakTime);
      setBreaks((prev) => {
        const updated = [...prev];
        // Only add a new break if last one has ended
        if (!updated.length || updated[updated.length - 1]?.end) {
          updated.push({ start: breakTime });
        }
        return updated;
      });

      setOffset(0); // start fresh
      setTotalHours((prev) => ({
        ...prev,
        workHours: calculateTotalHours(startTime, breakTime, "workhours"),
      }));
      queryClient.invalidateQueries({ queryKey: ["user-attendance"] });
    },
    onError: (error) => toast.error(error.response.data.message),
  });

  const { mutate: endBreak, isPending: isEndBreak } = useMutation({
    mutationFn: async (breakTime) => {
      const res = await axios.patch("/api/attendance/end-break", {
        endBreak: breakTime,
      });
      return { data: res.data, breakTime }; // Return both server response and time
    },
    onSuccess: ({ data, breakTime }) => {
      toast.success("Break ended");
      setTakeBreak(null);
      setStopBreak(breakTime);
      setBreaks((prev) => {
        const updated = [...prev];
        const len = updated.length;

        if (len > 0 && !updated[len - 1].end) {
          updated[len - 1].end = breakTime;
        }

        return updated;
      });
      setOffset(0); // start fresh
      setTotalHours((prev) => ({
        ...prev,
        breakHours: calculateTotalHours(takeBreak, breakTime),
      }));
      queryClient.invalidateQueries({ queryKey: ["user-attendance"] });
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

  const handleStartBreak = () => {
    const now = new Date().toISOString();
    startBreak(now);
  };
  const handleEnBreak = () => {
    const now = new Date().toISOString();
    endBreak(now);
  };

  const formatElapsedTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(Math.floor(seconds % 60)).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const calculateTotalHours = (startTime, endTime, type) => {
    if (type === "workhours") {
      const workDuration = (new Date(endTime) - new Date(startTime)) / 1000;
      return formatTime(workDuration);
    } else {
      const breakDuration = breaks.reduce((total, brk) => {
        const start = brk.start;
        const end = brk.end;
        if (start && end) {
          return total + (new Date(end) - new Date(start)) / 1000;
        }
        return total;
      }, 0);

      return formatTime(breakDuration);
    }
  };

  useEffect(() => {
    if (clockTime.startTime && clockTime.endTime) {
      const workDuration =
        (new Date(clockTime.endTime) - new Date(clockTime.startTime)) / 1000;

      const breakDuration = breaks.reduce((total, brk) => {
        const start = brk.start;
        const end = brk.end;
        if (start && end) {
          return total + (new Date(end) - new Date(start)) / 1000;
        }
        return total;
      }, 0);
      setTotalHours({
        breakHours: formatTime(breakDuration),
        workHours: formatTime(workDuration),
      });
    }
  }, [clockTime, breaks]);

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
    // <div className="flex flex-col  gap-4 p-4 border rounded-md  shadow">

    <div className="flex flex-col  gap-4 p-0 h-80">
      <div className="grid grid-cols-1 gap-4">
        <div className="col-span-2 flex  items-center flex-col h-80 ">
          <div className="text-subtitle text-primary font-pmedium font-medium mb-4">
            {formatDisplayDate(new Date())}
          </div>

          <div className="flex gap-12">
            <button
              onClick={startTime ? handleStop : handleStart}
              className={`h-40 w-40 rounded-full ${
                startTime ? "bg-[#EB5C45]" : "bg-wonoGreen  transition-all"
              }  text-white flex justify-center items-center hover:scale-105`}
              disabled={isClockingIn || isClockingOut}
            >
              {startTime
                ? "Clock Out"
                : isClockingIn
                ? "Starting..."
                : "Clock In"}
            </button>

            {startTime && (
              <button
                onClick={takeBreak ? handleEnBreak : handleStartBreak}
                className={`h-40 w-40 rounded-full ${
                  takeBreak ? "bg-[#FB923C]" : "bg-[#FACC15]  transition-all"
                }  text-white flex justify-center items-center hover:scale-105`}
                disabled={isStartbreak || isEndBreak}
              >
                {takeBreak
                  ? "End Break"
                  : isStartbreak
                  ? "Starting..."
                  : "Start Break"}
              </button>
            )}
          </div>
          <div className="text-subtitle text-primary font-pmedium font-medium mb-4 pt-4">
            {startTime ? `${formatElapsedTime(elapsedTime)}` : "Not Clocked In"}
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-2 justify-center text-center">
              <span className="text-muted">Clock-in Time</span>
              <hr />
              <span className="font-medium text-content">
                {clockTime.startTime
                  ? humanTime(clockTime.startTime)
                  : "0h:0m:0s"}
              </span>
            </div>

            <div className="flex flex-col gap-2 justify-center text-center">
              <span className="text-muted">Work Hours</span>
              <hr />
              <span className="font-medium text-content">
                {totalHours.workHours}
              </span>
            </div>
            <div className="flex flex-col gap-2 justify-center text-center">
              <span className="text-muted">Break Hours</span>
              <hr />
              <span className="font-medium text-content">
                {totalHours.breakHours}
              </span>
            </div>
            <div className="flex flex-col gap-2 justify-center text-center">
              <span className="text-muted">Clock-out Time</span>
              <hr />
              <span className="font-medium text-content">
                {clockTime.endTime ? humanTime(clockTime.endTime) : "0h:0m:0s"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClockInOutAttendance;
