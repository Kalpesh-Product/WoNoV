import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { computeOffset, getElapsedSecondsWithOffset } from "../utils/time";
import humanTime from "../utils/humanTime";

const AttendanceTimeline = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();

  const [startTime, setStartTime] = useState(null);
  const [takeBreak, setTakeBreak] = useState(null);
  const [stopBreak, setStopBreak] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isBooting, setIsBooting] = useState(true);
  const timerRef = useRef(null);
  const hasClockedIn = auth?.user?.clockInDetails?.hasClockedIn;

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
      console.log("start time", inTime);
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

  const { mutate: startBreak, isPending: isStartbreak } = useMutation({
    mutationFn: async (breakTime) => {
      const res = await axios.patch("/api/attendance/start-break", {
        startBreak: breakTime,
      });
      return { data: res.data, breakTime }; // Return both server response and time
    },
    onSuccess: ({ data, breakTime }) => {
      console.log("start break", breakTime);
      toast.success("Break started");
      setStopBreak(null);
      setTakeBreak(breakTime);
      setOffset(0); // start fresh
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
      console.log("end break", breakTime);
      toast.success("Break ended");
      setTakeBreak(null);
      setStopBreak(breakTime);
      setOffset(0); // start fresh
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
    <div className="flex flex-col gap-4 h-80 ">
      <div className="flex justify-center ">
        <div className="col-span-2 flex flex-col gap-3 text-sm text-gray-700 overflow-scroll h-80 overflow-x-hidden w-full px-36">
          {/* <div className="font-semibold text-base text-gray-900">
         
            Timeline
          </div> */}

          <div className="flex justify-between">
            <span className="text-muted">Status: &nbsp;</span>
            <span className="font-medium">
              {/* {auth?.user?.clockInDetails?.clockInTime
                ? "Clocked In"
                : "Not Clocked In"} */}
              {startTime ? "Clocked In" : "Not Clocked In"}
            </span>
          </div>

          {/* <div className="flex justify-between">
            <span className="text-muted">Clock-in Time: &nbsp;</span>
            <span className="font-medium">
          
              {auth?.user?.clockInDetails?.clockInTime
                ? new Date(startTime).toLocaleString()
                : "—"}
            </span>
          </div> */}

          <div className="flex justify-between">
            <span className="text-muted">Clock-in Time: &nbsp;</span>
            <span className="font-medium">09:30 am</span>
          </div>

          {/* <div className="flex justify-between">
            <span className="text-muted">Elapsed Time: &nbsp;</span>
            <span className="font-medium">
              {startTime ? formatElapsedTime(elapsedTime) : "—"}
            </span>
          </div> */}
          {takeBreak && (
            <div className="flex justify-between">
              <span className="text-muted">Break Start: &nbsp;</span>
              <span className="font-medium">{humanTime(takeBreak)}</span>
            </div>
          )}
          {/* {stopBreak && (
            <div className="flex justify-between">
              <span className="text-muted">Break End: &nbsp;</span>
              <span className="font-medium">{humanTime(stopBreak)}</span>
            </div>
          )} */}
          <div className="flex justify-between">
            <span className="text-muted">Break End: &nbsp;</span>
            <span className="font-medium">11:45 am</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted">Break Start: &nbsp;</span>
            <span className="font-medium">04:30 pm</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted">Break End: &nbsp;</span>
            <span className="font-medium">04:45 pm</span>
          </div>

          {/* --START-- */}
          {/* <div className="flex justify-between">
            <span className="text-muted">Break Start: &nbsp;</span>
            <span className="font-medium">04:30 pm</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted">Break End: &nbsp;</span>
            <span className="font-medium">04:45 pm</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted">Break Start: &nbsp;</span>
            <span className="font-medium">04:30 pm</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted">Break End: &nbsp;</span>
            <span className="font-medium">04:45 pm</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted">Break Start: &nbsp;</span>
            <span className="font-medium">04:30 pm</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted">Break End: &nbsp;</span>
            <span className="font-medium">04:45 pm</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted">Break Start: &nbsp;</span>
            <span className="font-medium">04:30 pm</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted">Break End: &nbsp;</span>
            <span className="font-medium">04:45 pm</span>
          </div> */}
          {/* --END-- */}
          <div className="flex justify-between">
            <span className="text-muted">Clock-out Time: &nbsp;</span>
            <span className="font-medium">06:30 pm</span>
          </div>
          <div className="flex justify-between h-4"></div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTimeline;
