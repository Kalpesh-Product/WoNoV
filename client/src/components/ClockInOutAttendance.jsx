import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { computeOffset, getElapsedSecondsWithOffset } from "../utils/time";
import humanTime from "../utils/humanTime";
import { queryClient } from "../main";
import { useDispatch, useSelector } from "react-redux";
import {
  setClockInTime,
  setClockOutTime,
  setBreakTimings,
  setWorkHours,
  setBreakHours,
  setHasClockedIn,
  setHasTakenBreak,
  setIsToday,
  setLastUserId,
  resetAttendanceState,
} from "../redux/slices/userSlice";

const ClockInOutAttendance = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const dispatch = useDispatch();
  const {
    clockInTime,
    clockOutTime,
    breakTimings,
    workHours,
    breakHours,
    hasClockedIn,
    hasTakenBreak,
    isToday,
    lastUserId,
  } = useSelector((state) => {
    return state.user;
  });

  const [startTime, setStartTime] = useState(clockInTime);
  const [clockTime, setClockTime] = useState({
    startTime: clockInTime,
    endTime: clockOutTime,
  });

  const [clockedInStatus, setClockedInStatus] = useState(hasClockedIn);
  const [takeBreak, setTakeBreak] = useState(null);
  const [breaks, setBreaks] = useState(breakTimings);
  const [totalHours, setTotalHours] = useState({
    workHours: workHours,
    breakHours: breakHours,
  });
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
  const userId = auth?.user?._id;

  //Reset redux states if a different user logs in
  useEffect(() => {
    const userId = auth?.user?._id;
    if (userId && lastUserId && userId !== lastUserId) {
      dispatch(resetAttendanceState());
    }
  }, [auth?.user?._id, lastUserId]);

  // Boot with server timestamps
  useEffect(() => {
    const clockIn = auth?.user?.clockInDetails?.clockInTime;
    const hasClockedIn = auth?.user?.clockInDetails?.hasClockedIn;
    const clockOut = auth?.user?.clockInDetails?.clockOutTime; // if clock out for prev day then clock out time may be stored and used to calculate today's work hours
    const serverNow = auth?.user?.time;
    const breaksFromServer = auth?.user?.clockInDetails?.breaks;
    const todayClockIn = clockIn && new Date(clockIn)
      const todayClockOut = clockOut && new Date(clockOut)
      const startBreakTime = Array.isArray(breaksFromServer) && breaksFromServer.length > 0 && new Date(breaksFromServer[0].start)
      const isTodayBreak = isSameDay(startBreakTime)

    dispatch(setLastUserId(userId)); 

    if (hasClockedIn && clockIn && serverNow) {
      dispatch(setIsToday(isSameDay(clockIn)));
      dispatch(setClockInTime(clockIn));
      dispatch(setHasClockedIn(true));

      setStartTime(clockIn);
      setClockedInStatus(true);
      const calculatedOffset = computeOffset(new Date());
      setOffset(calculatedOffset);
      setElapsedTime(getElapsedSecondsWithOffset(clockIn, calculatedOffset));

      setClockTime((prev) => ({
        ...prev,
        startTime: clockIn,
        endTime: clockIn && clockOut ? clockOut : null,
      }));
    }

   
    if (
      hasClockedIn &&
      Array.isArray(breaksFromServer) &&
      breaksFromServer.length > 0 && isTodayBreak
    ) {
       console.log("isTodayBreak",isTodayBreak)
      setBreaks(breaksFromServer);

      const breakDuration = breaksFromServer.reduce((total, brk) => {
        if (brk.start && brk.end) {
          return total + (new Date(brk.end) - new Date(brk.start)) / 1000;
        }
        return total;
      }, 0);
        
        calculateTotalHoursServer(breaksFromServer, clockIn, clockOut);
      
    }

    const isTodayClockout = isSameDay(clockOut);

    if (clockOut && isTodayClockout ) {
      dispatch(setClockOutTime(clockOut));
      dispatch(setHasClockedIn(false));
 
      //Set redux state to display today's timings even after session storage is deleted
      dispatch(setClockInTime(clockIn));

      if (isTodayBreak) {
        calculateTotalHoursServer(breaksFromServer, clockIn, clockOut);
      }
    }

    setIsBooting(false);
  }, [userId]);

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
      dispatch(setIsToday(isSameDay(inTime)));
    
      setOffset(0); // start fresh
      setElapsedTime(getElapsedSecondsWithOffset(inTime, 0));
      setClockedInStatus(true);
      dispatch(setClockInTime(inTime));
      dispatch(setHasClockedIn(true));
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
      if (clockInTime) {
        // avoid showing clock-out time if clocking out for prev day
        setClockTime((prev) => ({ ...prev, endTime: outTime }));
        
        if(breaks.length > 0){
        //     setTotalHours((prev) => ({
        //   ...prev,
        //   workHours: calculateTotalHours(
        //     breaks,
        //     startTime,
        //     outTime,
        //     "workhours"
        //   ),
        // }));

         dispatch(
          setWorkHours(
            calculateTotalHours(breaks, startTime, outTime, "workhours")
          )
        );
        }

        dispatch(setClockOutTime(outTime));
      }
      setElapsedTime(0);
      setOffset(0);
      setClockedInStatus(false);

      dispatch(setHasClockedIn(false));
      queryClient.invalidateQueries({ queryKey: ["user-attendance"] });
    },
    t: (error) => toast.error(error.response.data.message),
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
      setTakeBreak(breakTime);

      setOffset(0); // start fresh
      // setTotalHours((prev) => ({
      //   ...prev,
      //   workHours: calculateTotalHours(
      //     breaks,
      //     startTime,
      //     breakTime,
      //     "workhours"
      //   ),
      // }));
      const updatedBreaks = [...breaks];
      if (
        !updatedBreaks.length ||
        updatedBreaks[updatedBreaks.length - 1]?.end
      ) {
        updatedBreaks.push({ start: breakTime });
      }

      // Update local state
      setBreaks(updatedBreaks);

      // Update persisted Redux state
      dispatch(setBreakTimings(updatedBreaks));

      dispatch(setHasTakenBreak(true));
      dispatch(
        setWorkHours(
          calculateTotalHours(breaks, startTime, breakTime, "workhours")
        )
      );
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

      const updatedBreaks = [...breaks];
      const lastIndex = updatedBreaks.length - 1;
      if (lastIndex >= 0 && !updatedBreaks[lastIndex].end) {
        updatedBreaks[lastIndex] = {
          ...updatedBreaks[lastIndex],
          end: breakTime,
        };
      }
      setOffset(0); // start fresh
      // setTotalHours((prev) => ({
      //   ...prev,
      //   breakHours: calculateTotalHours(updatedBreaks),
      // }));

      // Update local state
      setBreaks(updatedBreaks);

      // Update persisted Redux state
      dispatch(setBreakTimings(updatedBreaks));
      dispatch(setHasTakenBreak(false));
      dispatch(setBreakHours(calculateTotalHours(updatedBreaks)));
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

  const isSameDay = (time) => {
    const curr = new Date();
    const clockInDate = new Date(time);

    const today =
      curr.getFullYear() === clockInDate.getFullYear() &&
      curr.getMonth() === clockInDate.getMonth() &&
      curr.getDate() === clockInDate.getDate();

    return today;
  };

  const calculateTotalHours = (breakTimings, startTime, endTime, type) => {
    if (type === "workhours") {
      const totalSeconds = (new Date(endTime) - new Date(startTime)) / 1000;
      const breakDuration = breakTimings.reduce((total, brk) => {
        if (brk.start && brk.end) {
          return total + (new Date(brk.end) - new Date(brk.start)) / 1000;
        }
        return total;
      }, 0);

      const netWorkSeconds = totalSeconds - breakDuration;

      return formatTime(netWorkSeconds > 0 ? netWorkSeconds : 0);
    } else {
      const breakDuration = breakTimings.reduce((total, brk) => {
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

  const calculateTotalHoursServer = (breaksFromServer, clockIn, clockOut) => {
    let calculatedWorkHours = workHours,
      calculatedBreakHours = breakHours;
    const len = breaksFromServer?.length;
    const lastBreak = breaksFromServer[len - 1]?.start;

    const now = new Date();
    const clockInTime = new Date(clockIn);

    let effectiveEndTime = now;

    // Check if clock-out time is present and valid
    if (!hasClockedIn && clockOut) {
      effectiveEndTime = new Date(clockOut);
    }

    // Handle ongoing break (started but not ended)
    const lastBreakObj = breaksFromServer?.[breaksFromServer.length - 1];
    const isOngoingBreak = lastBreakObj?.start && !lastBreakObj?.end;

    if (!clockOut && isOngoingBreak) {
      effectiveEndTime = new Date(lastBreakObj.start);
    }

    // Compute total completed break seconds
    const completedBreakDuration = breaksFromServer.reduce((total, brk) => {
      if (brk.start && brk.end) {
        return total + (new Date(brk.end) - new Date(brk.start)) / 1000;
      }
      return total;
    }, 0);

    const totalWorkSeconds = (effectiveEndTime - clockInTime) / 1000;
    const netWorkSeconds = totalWorkSeconds - completedBreakDuration;

    dispatch(setHasTakenBreak(isOngoingBreak));
    dispatch(setBreakTimings(breaksFromServer));
    dispatch(setBreakHours(formatTime(completedBreakDuration)));
    dispatch(setWorkHours(formatTime(netWorkSeconds > 0 ? netWorkSeconds : 0)));

    calculatedWorkHours = formatTime(netWorkSeconds > 0 ? netWorkSeconds : 0)
    
    calculatedBreakHours = formatTime(completedBreakDuration)
    
      // setTotalHours((prev) => ({
      //   workHours: calculatedWorkHours,
      //   breakHours: calculatedBreakHours,
      // }));
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

  const timeStats = [
    {
      label: "Clock-in Time",
      value: clockInTime && isToday ? humanTime(clockInTime) : "0h:0m:0s", // avoid clock-in time if clocking out for prev day
    },
    {
      label: "Work Hours",
      value: isToday ? workHours : "0h:0m:0s",
    },
    {
      label: "Break Hours",
      value: isToday ? breakHours : "0h:0m:0s",
    },
    {
      label: "Clock-out Time",
      value:
        clockOutTime && isToday && clockInTime < clockOutTime
          ? humanTime(clockOutTime)
          : "0h:0m:0s",
    },
  ];

  return (
    <div className="flex flex-col  gap-4 p-0 h-80">
      <div className="grid grid-cols-1 gap-4">
        <div className="col-span-2 flex  items-center flex-col h-80 ">
          <div className="text-subtitle text-primary font-pmedium font-medium mb-4">
            {formatDisplayDate(new Date())}
          </div>

          <div className="flex gap-12">
            <button
              onClick={hasClockedIn ? handleStop : handleStart}
              className={`h-40 w-40 rounded-full ${
                hasClockedIn ? "bg-[#EB5C45]" : "bg-wonoGreen  transition-all"
              }  text-white flex justify-center items-center hover:scale-105`}
              disabled={isClockingIn || isClockingOut}
            >
              {hasClockedIn
                ? "Clock Out"
                : isClockingIn
                ? "Starting..."
                : "Clock In"}
            </button>

            {hasClockedIn && (
              <button
                onClick={hasTakenBreak ? handleEnBreak : handleStartBreak}
                className={`h-40 w-40 rounded-full ${
                  hasTakenBreak
                    ? "bg-[#FB923C]"
                    : "bg-[#FACC15]  transition-all"
                }  text-white flex justify-center items-center hover:scale-105`}
                disabled={isStartbreak || isEndBreak}
              >
                {hasTakenBreak
                  ? "End Break"
                  : isStartbreak
                  ? "Starting..."
                  : "Start Break"}
              </button>
            )}
          </div>
          <div className="text-subtitle text-primary font-pmedium font-medium mb-4 pt-4">
            {hasClockedIn && isToday
              ? `${formatElapsedTime(elapsedTime)}`
              : clockOutTime && isToday
              ? "Clocked Out"
              : "Not Clocked In"}
          </div>

          <div className="flex gap-4">
            {timeStats.map((stat, index) => (
              <div
                key={index}
                className={`flex flex-col gap-2 justify-center text-center ${
                  index !== timeStats.length - 1
                    ? "border-r-[1px] border-borderGray pr-4"
                    : ""
                }`}
              >
                <span className="text-muted">{stat.label}</span>

                <span className="font-medium text-content">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClockInOutAttendance;
