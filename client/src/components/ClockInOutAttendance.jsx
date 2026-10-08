import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Controller, useForm } from "react-hook-form";
import MuiModal from "./MuiModal";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { TextField } from "@mui/material";
import SecondaryButton from "./SecondaryButton";
import PrimaryButton from "./PrimaryButton";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { isAlphanumeric, noOnlyWhitespace } from "../utils/validators";
import dayjs from "dayjs";
import ConfirmationModal from "./ConfirmationModal";
import AttendanceCameraModal from "./AttendanceCameraModal";
import {
  MdCoffee,
  MdLogin,
  MdLogout,
  MdTimer,
} from "react-icons/md";
import { FiLogIn, FiLogOut } from "react-icons/fi";

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

  const [openModal, setOpenModal] = useState(false);
  const [openClockOutConfirmation, setOpenClockOutConfirmation] =
    useState(false);
     const [cameraAction, setCameraAction] = useState(null);

  const {
    control,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      targetedDay: null,
      outTime: null,
      reason: "",
    },
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
    const todayClockIn = clockIn && new Date(clockIn);
    const todayClockOut = clockOut && new Date(clockOut);
    const startBreakTime =
      Array.isArray(breaksFromServer) &&
      breaksFromServer.length > 0 &&
      new Date(breaksFromServer[0].start);
    const isTodayBreak = isSameDay(startBreakTime);

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
      breaksFromServer.length > 0 &&
      isTodayBreak
    ) {
      console.log("isTodayBreak", isTodayBreak);
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

    if (clockOut && isTodayClockout) {
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
    // mutationFn: async (inTime) => {
    //   const res = await axios.post("/api/attendance/clock-in", {
    //     inTime,
    //     entryType: "web",
    //   });
     mutationFn: async ({ time: inTime, image }) => {
      const payload = new FormData();
      payload.append("inTime", inTime);
      payload.append("entryType", "web");
      payload.append("image", image, "clock-in.jpg");
      const res = await axios.post("/api/attendance/clock-in", payload);
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
      setCameraAction(null);
    },
    onError: (error) => toast.error(error.response.data.message),
  });

  const { mutate: clockOut, isPending: isClockingOut } = useMutation({
    // mutationFn: async (outTime) => {
    //   const res = await axios.patch("/api/attendance/clock-out", {
    //     outTime,
    //   });
     mutationFn: async ({ time: outTime, image }) => {
      const payload = new FormData();
      payload.append("outTime", outTime);
      payload.append("image", image, "clock-out.jpg");
      const res = await axios.patch("/api/attendance/clock-out", payload);
      return { data: res.data, outTime };
    },
    onSuccess: ({ data, outTime }) => {
      setOpenClockOutConfirmation(false);
      toast.success("Clocked out successfully!");
      setStartTime(null);
      if (clockInTime) {
        // avoid showing clock-out time if clocking out for prev day
        setClockTime((prev) => ({ ...prev, endTime: outTime }));

        if (breaks.length > 0) {
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
              calculateTotalHours(breaks, startTime, outTime, "workhours"),
            ),
          );
        }

        dispatch(setClockOutTime(outTime));
      }
      setElapsedTime(0);
      setOffset(0);
      setClockedInStatus(false);

      dispatch(setHasClockedIn(false));
      queryClient.invalidateQueries({ queryKey: ["user-attendance"] });
      setCameraAction(null);
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Clock-out failed"),
  });

  const { mutate: startBreak, isPending: isStartbreak } = useMutation({
    // mutationFn: async (breakTime) => {
    //   const res = await axios.patch("/api/attendance/start-break", {
    //     startBreak: breakTime,
    //   });
     mutationFn: async ({ time: breakTime, image }) => {
      const payload = new FormData();
      payload.append("startBreak", breakTime);
      payload.append("image", image, "break-in.jpg");
      const res = await axios.patch("/api/attendance/start-break", payload);
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
          calculateTotalHours(breaks, startTime, breakTime, "workhours"),
        ),
      );
      queryClient.invalidateQueries({ queryKey: ["user-attendance"] });
       setCameraAction(null);
    },
    onError: (error) => toast.error(error.response.data.message),
  });

  const { mutate: endBreak, isPending: isEndBreak } = useMutation({
    // mutationFn: async (breakTime) => {
    //   const res = await axios.patch("/api/attendance/end-break", {
    //     endBreak: breakTime,
    //   });
     mutationFn: async ({ time: breakTime, image }) => {
      const payload = new FormData();
      payload.append("endBreak", breakTime);
      payload.append("image", image, "break-out.jpg");
      const res = await axios.patch("/api/attendance/end-break", payload);
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
       setCameraAction(null);
    },
    onError: (error) => toast.error(error.response.data.message),
  });

  const { mutate: correctionPost, isPending: correctionPending } = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        targetedDay: data.targetedDay ? new Date(data.targetedDay) : null,
        empId: auth?.user?.empId || "",
      };
      const response = await axios.post(
        "/api/attendance/correct-attendance",
        payload,
      );
      return response.data;
    },
    onSuccess: (data) => {
      setOpenModal(false);
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      reset();
      dispatch(resetAttendanceState());
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Error submitting correction",
      );
    },
  });

  const onSubmit = (data) => {
    if (!auth?.user?.empId) return toast.error("User not found");

    correctionPost(data);
  };
  // const handleStart = () => {
  //   const now = new Date().toISOString();
  //   clockIn(now); // Only call the API, don't start timer yet
  // };

  // const handleStop = () => {
  //   setOpenClockOutConfirmation(true);
  // };

  // const handleConfirmClockOut = () => {
  //   const now = new Date().toISOString();
  //   clockOut(now);
  // };

  // const handleStartBreak = () => {
  //   const now = new Date().toISOString();
  //   startBreak(now);
  // };
  // const handleEnBreak = () => {
  //   const now = new Date().toISOString();
  //   endBreak(now);
  // };
   const handleStart = () => {
    setCameraAction("clock-in");
  };

  const handleStop = () => {
    setOpenClockOutConfirmation(true);
  };

  const handleConfirmClockOut = () => {
    setOpenClockOutConfirmation(false);
    setCameraAction("clock-out");
  };

  const handleStartBreak = () => {
    setCameraAction("break-in");
  };
  const handleEnBreak = () => {
    setCameraAction("break-out");
  };
  const handleCameraCapture = (image, time) => {
    const payload = { image, time };
    if (cameraAction === "clock-in") clockIn(payload);
    if (cameraAction === "clock-out") clockOut(payload);
    if (cameraAction === "break-in") startBreak(payload);
    if (cameraAction === "break-out") endBreak(payload);
  };

  const formatElapsedTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
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

    calculatedWorkHours = formatTime(netWorkSeconds > 0 ? netWorkSeconds : 0);

    calculatedBreakHours = formatTime(completedBreakDuration);

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

  const getPrevDay = () => {
    const yesterday = dayjs().subtract(1, "day");
    // If yesterday is Sunday (0 in dayjs), pick Saturday
    return yesterday.day() === 0
      ? dayjs().subtract(2, "day") // Saturday
      : yesterday;
  };

  const getCorrectionTargetDay = () => {
    if (clockInTime) {
      return dayjs(clockInTime);
    }
    return getPrevDay();
  };

  const timeStats = [
    {
      label: "Clock-in Time",
      value: clockInTime && isToday ? humanTime(clockInTime) : "—",
      icon: MdLogin,
      iconClassName: "bg-[#e5f8ef] text-[#07965f]",
    },
    {
      label: "Work Hours",
      value: isToday ? workHours : "00:00:00",
      icon: MdTimer,
      iconClassName: "bg-[#eaf0f8] text-[#3F6291]",
    },
    {
      label: "Break Hours",
      value: isToday ? breakHours : "00:00:00",
      icon: MdCoffee,
      iconClassName: "bg-[#fff0ec] text-[#ef6548]",
    },
    {
      label: "Clock-out Time",
      value:
        clockOutTime && isToday && clockInTime < clockOutTime
          ? humanTime(clockOutTime)
          : "—",
      icon: MdLogout,
      iconClassName: "bg-[#fff0f0] text-[#ff0000]",
    },
  ];

  const attendanceStatus =
    hasClockedIn && isToday
      ? hasTakenBreak
        ? "On Break"
        : "Clocked In"
      : clockOutTime && isToday
        ? "Clocked Out"
        : "Not Clocked In";
  const attendanceStatusStyle = {
    "Clocked In": {
      badge: "bg-[#e5f8ef] text-[#07965f]",
      dot: "bg-[#07965f]",
    },
    "On Break": {
      badge: "bg-[#fff0ec] text-[#ef6548]",
      dot: "bg-[#ef6548]",
    },
    "Clocked Out": {
      badge: "bg-[#fff0f0] text-[#ff0000]",
      dot: "bg-[#ff0000]",
    },
    "Not Clocked In": {
      badge: "bg-[#eef2f7] text-[#1E3D73]",
      dot: "bg-[#7d8ba2]",
    },
  }[attendanceStatus];
  const showActiveIndicator =
    attendanceStatus === "Clocked In" || attendanceStatus === "On Break";
  const displayedDuration =
    hasClockedIn && isToday ? formatElapsedTime(elapsedTime) : "00:00:00";
  const actionMessage = hasClockedIn
    ? hasTakenBreak
      ? "Your break is currently active."
      : "Your workday is in progress."
    : clockOutTime && isToday
      ? "Your workday has ended for today. Please check in again tomorrow."
      : "Start your workday by clocking in.";

  const handleClockOutClick = () => {
    if (!hasClockedIn) return;
    if (!isToday) {
      setValue(
        "targetedDay",
        getCorrectionTargetDay().format("YYYY-MM-DD"),
      );
      setOpenModal(true);
      return;
    }
    handleStop();
  };

  // Temporarily keep break controls available outside mutation loading states.
  const isBreakDisabled = false;

  return (
    <div className="flex min-h-[365px] flex-col px-4 pb-4 pt-3 sm:px-5">
      <div className="flex flex-1 flex-col items-center justify-center py-2 text-center">
        <div
          className={`mb-2 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-pbold ${attendanceStatusStyle.badge}`}
        >
          {showActiveIndicator ? (
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 motion-reduce:animate-none ${attendanceStatusStyle.dot}`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${attendanceStatusStyle.dot}`}
              />
            </span>
          ) : attendanceStatus === "Not Clocked In" ? (
            <span
              className={`h-2 w-2 rounded-full ${attendanceStatusStyle.dot}`}
              aria-hidden="true"
            />
          ) : null}
          {attendanceStatus}
        </div>

        <div className="text-[42px] font-pbold leading-none tracking-[0.02em] text-[#1E3D73] sm:text-[48px]">
          {displayedDuration}
        </div>
        <div className="mt-2 text-sm font-pmedium text-[#1E3D73]">
          Work duration
        </div>

        <div className="mt-5 grid w-full max-w-[540px] grid-cols-1 gap-2.5 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleStart}
            disabled={hasClockedIn || Boolean(clockOutTime && isToday) || isClockingIn}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1E3D73] text-sm font-pbold text-white shadow-[0_8px_18px_rgba(30,61,115,0.22)] transition-colors hover:bg-[#162f5b] disabled:cursor-not-allowed disabled:bg-[#e8ecf2] disabled:text-[#a6afbd] disabled:shadow-none"
          >
            <FiLogIn size={19} aria-hidden="true" />
            {isClockingIn ? "Starting..." : "Clock In"}
          </button>
          <button
            type="button"
            onClick={handleClockOutClick}
            disabled={!hasClockedIn || isClockingOut || correctionPending}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ff000080] text-sm font-pbold text-white transition-colors hover:bg-[#ff000099] disabled:cursor-not-allowed disabled:bg-[#e8ecf2] disabled:text-[#a6afbd]"
          >
            <FiLogOut size={18} aria-hidden="true" />
            {isClockingOut ? "Stopping..." : "Clock Out"}
          </button>
          <button
            type="button"
            onClick={hasTakenBreak ? handleEnBreak : handleStartBreak}
            disabled={!hasClockedIn || isBreakDisabled || isStartbreak || isEndBreak}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#fff0ec] text-sm font-pbold text-[#e85d42] transition-colors hover:bg-[#ffe3dc] disabled:cursor-not-allowed disabled:bg-[#e8ecf2] disabled:text-[#a6afbd]"
          >
            <MdCoffee size={19} aria-hidden="true" />
            {hasTakenBreak
              ? isEndBreak
                ? "Ending..."
                : "End Break"
              : isStartbreak
                ? "Starting..."
                : "Start Break"}
          </button>
        </div>
        <div className="mt-3 text-xs font-pregular text-[#1E3D73]">
          {actionMessage}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2.5 border-t border-[#e4eaf3] pt-4 sm:grid-cols-2 lg:grid-cols-4">
        {timeStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex min-w-0 items-center gap-3 rounded-xl bg-[#f8faff] px-3 py-3"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconClassName}`}
              >
                <Icon size={21} aria-hidden="true" />
              </span>
              <div className="min-w-0 text-left">
                <div className="truncate text-[10px] font-pmedium text-[#1E3D73]">
                  {stat.label}
                </div>
                <div className="mt-1 truncate text-sm font-pbold text-[#1E3D73]">
                  {stat.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <MuiModal
        title={"Correction Request"}
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* <Controller
            name="targetedDay"
            control={control}
            defaultValue={getPrevDay().format("YYYY-MM-DD")}
            render={({ field }) => (
              // <LocalizationProvider dateAdapter={AdapterDayjs}>
              //   <DatePicker
              //     {...field}
              //     label={"Select Date"}
              //     format="DD-MM-YYYY"
              //     slotProps={{ textField: { size: "small" } }}
              //     value={field.value ? dayjs(field.value) : null}
              //     onChange={(date) => {
              //       field.onChange(date ? date.toISOString() : null);
              //     }}
              //   />
              // </LocalizationProvider>
              <>
                <TextField
                  {...field}
                  size="small"
                  label="Select Date"
                  value={field.value ? dayjs(field.value) : null}
                  fullWidth
                  multiline
                  error={!!errors?.targetedDay}
                  helperText={errors?.targetedDay?.message}
                />
              </>
            )}
          /> */}

          <Controller
            name="targetedDay"
            control={control}
            defaultValue={getCorrectionTargetDay().format("YYYY-MM-DD")}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label="Selected Date"
                value={
                  field.value ? dayjs(field.value).format("DD-MM-YYYY") : ""
                }
                fullWidth
                InputProps={{ readOnly: true }}
                error={!!errors?.targetedDay}
                helperText={errors?.targetedDay?.message}
              />
            )}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
              name="outTime"
              control={control}
              render={({ field }) => (
                <TimePicker
                  {...field}
                  label={"Select Out-Time"}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(time) => {
                    field.onChange(time ? time.toISOString() : null);
                  }}
                />
              )}
            />
          </LocalizationProvider>
          <Controller
            name="reason"
            control={control}
            rules={{
              required: "Please specify your reason",
              validate: { noOnlyWhitespace, isAlphanumeric },
            }}
            render={({ field }) => (
              <>
                <TextField
                  {...field}
                  size="small"
                  label="Reason"
                  fullWidth
                  multiline
                  rows={3} // ← Change this number to increase/decrease height
                  error={!!errors?.reason}
                  helperText={errors?.reason?.message}
                />
              </>
            )}
          />

          <div className="flex items-center justify-center gap-4">
            <SecondaryButton
              title={"Cancel"}
              handleSubmit={() => setOpenModal(false)}
            />
            <PrimaryButton
              title={"Submit"}
              type={"submit"}
              isLoading={correctionPending}
              // disabled={correctionPending}
            />
          </div>
          {/* {Object.keys(errors).length > 0 && (
                  <pre className="text-red-500">
                    {JSON.stringify(errors, null, 2)}
                  </pre>
                )} */}
        </form>
      </MuiModal>
      <ConfirmationModal
        open={openClockOutConfirmation}
        onClose={() => setOpenClockOutConfirmation(false)}
        onConfirm={handleConfirmClockOut}
        title="Confirm Clock-Out"
        message="Are you sure you want to clock out? You will not be able to clock in again for this shift."
        confirmText="Clock Out"
        cancelText="Cancel"
        isLoading={isClockingOut}
      />
       <AttendanceCameraModal
        open={Boolean(cameraAction)}
        title={`${cameraAction?.replace("-", " ") || "attendance"} verification`}
        onClose={() => setCameraAction(null)}
        onCapture={handleCameraCapture}
        isLoading={isClockingIn || isClockingOut || isStartbreak || isEndBreak}
      />
    </div>
  );
};

export default ClockInOutAttendance;
