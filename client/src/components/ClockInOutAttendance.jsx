import { useEffect, useRef, useState } from "react";
import AttendanceCorrectionTimeRow from "./AttendanceCorrectionTimeRow";
import { useMutation } from "@tanstack/react-query";
import useAttendanceClock from "../hooks/useAttendanceClock";
import { getAttendanceClockState } from "../utils/attendanceClockState";
import { toast } from "sonner";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { getAttendanceDurations } from "../utils/attendanceDurations";
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

  // Ignore persisted breaks from other attendance sessions.
  useEffect(() => {
    const details = auth?.user?.clockInDetails || {};
    const sessionStart = details.clockInTime;
    const sessionBreaks = (details.breaks || []).filter((brk) =>
      sessionStart && new Date(brk.start).getTime() >= new Date(sessionStart).getTime(),
    );
    dispatch(resetAttendanceState());
    dispatch(setLastUserId(userId));
    dispatch(setClockInTime(sessionStart || null));
    dispatch(setClockOutTime(details.clockOutTime || null));
    dispatch(setHasClockedIn(Boolean(details.hasClockedIn)));
    dispatch(setIsToday(Boolean(sessionStart && isSameDay(sessionStart))));
    dispatch(setBreakTimings(sessionBreaks));
    setStartTime(sessionStart || null);
    setBreaks(sessionBreaks);
    setIsBooting(false);
  }, [userId]);

  const { data: attendanceRecord, clockState } = useAttendanceClock();
  // Calculate the date from the actual session, not a persisted Redux flag.
  const { isCurrentSession: isToday } = getAttendanceClockState({
    inTime: clockInTime,
    outTime: clockOutTime,
    shiftSnapshot: attendanceRecord?.inTime === clockInTime
      ? attendanceRecord?.shiftSnapshot : undefined,
  });

  // Use the same Attendance record as the timeline for break totals.
  useEffect(() => {
    if (attendanceRecord === undefined) return;
    if (!attendanceRecord) {
      setStartTime(null);
      setBreaks([]);
      dispatch(resetAttendanceState());
      return;
    }
    const sessionBreaks = (attendanceRecord.breaks || []).map((brk) => ({
      start: brk.startBreak, end: brk.endBreak || null,
    }));
    setStartTime(attendanceRecord.inTime);
    setBreaks(sessionBreaks);
    dispatch(setClockInTime(attendanceRecord.inTime));
    dispatch(setClockOutTime(attendanceRecord.outTime || null));
    dispatch(setBreakTimings(sessionBreaks));
    dispatch(setIsToday(clockState.isToday));
    dispatch(setHasClockedIn(clockState.hasClockedIn));
  }, [attendanceRecord, clockState.hasClockedIn, clockState.isToday, dispatch]);

  useEffect(() => {
    const updateDurations = () => {
      const totals = getAttendanceDurations(startTime, clockOutTime, breaks);
      const work = hasClockedIn || clockOutTime ? totals.workSeconds : 0;
      const paused = hasClockedIn || clockOutTime ? totals.breakSeconds : 0;
      setElapsedTime(work);
      dispatch(setWorkHours(formatTime(work)));
      dispatch(setBreakHours(formatTime(paused)));
      dispatch(setHasTakenBreak(Boolean(hasClockedIn && totals.isOnBreak)));
    };
    updateDurations();
    if (startTime && hasClockedIn) timerRef.current = setInterval(updateDurations, 1000);
    return () => clearInterval(timerRef.current);
  }, [startTime, clockOutTime, breaks, hasClockedIn, dispatch]);

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
      setClockTime({ startTime: inTime, endTime: null });
      setBreaks([]);
      dispatch(setClockOutTime(null));
      dispatch(setBreakTimings([]));
      dispatch(setHasTakenBreak(false));
      dispatch(setWorkHours("00:00:00"));
      dispatch(setBreakHours("00:00:00"));
      dispatch(setIsToday(isSameDay(inTime)));

      setOffset(0); // start fresh
      setElapsedTime(0);
      setClockedInStatus(true);
      dispatch(setClockInTime(inTime));
      dispatch(setHasClockedIn(true));
      queryClient.invalidateQueries({ queryKey: ["user-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-clock", userId] });
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
      setOffset(0);
      setClockedInStatus(false);

      dispatch(setHasClockedIn(false));
      queryClient.invalidateQueries({ queryKey: ["user-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-clock", userId] });
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
      queryClient.invalidateQueries({ queryKey: ["attendance-clock", userId] });
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
      queryClient.invalidateQueries({ queryKey: ["attendance-clock", userId] });
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
      queryClient.invalidateQueries({ queryKey: ["attendance-clock", userId] });
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

  const calculateTotalHours = (sessionBreaks, inTime, outTime, type) => {
    const totals = getAttendanceDurations(
      inTime || clockInTime, outTime || clockOutTime, sessionBreaks,
    );
    return formatTime(type === "workhours" ? totals.workSeconds : totals.breakSeconds);
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
      value: clockInTime && isToday ? humanTime(clockInTime) : "\u2014",
      icon: MdLogin,
      iconClassName: "bg-[#e5f8ef] text-[#69ad2f]",
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
      iconClassName: "bg-[#fff8e1] text-[#ffc400]",
    },
    {
      label: "Clock-out Time",
      value:
        clockOutTime && isToday && clockInTime < clockOutTime
          ? humanTime(clockOutTime)
          : "\u2014",
      icon: MdLogout,
      iconClassName: "bg-[#fff0f0] text-[#ef3e5c]",
    },
  ];

  const attendanceStatus =
    hasClockedIn && isToday
      ? hasTakenBreak
        ? "On Break"
        : "Clocked In"
      : clockOutTime && isToday
        ? "Clocked Out"
        : hasClockedIn ? "Clock-Out Required" : "Not Clocked In";
  const attendanceStatusStyle = {
    "Clock-Out Required": {
      badge: "bg-[#fff8e1] text-[#946200]",
      dot: "bg-[#946200]",
    },
    "Clocked In": {
      badge: "bg-[#e5f8ef] text-[#69ad2f]",
      dot: "bg-[#69ad2f]",
    },
    "On Break": {
      badge: "bg-[#fff8e1] text-[#ffc400]",
      dot: "bg-[#ffc400]",
    },
    "Clocked Out": {
      badge: "bg-[#fff0f0] text-[#ef3e5c]",
      dot: "bg-[#ef3e5c]",
    },
    "Not Clocked In": {
      badge: "bg-[#eef2f7] text-[#1E3D73]",
      dot: "bg-[#7d8ba2]",
    },
  }[attendanceStatus];
  const showActiveIndicator =
    attendanceStatus === "Clocked In" || attendanceStatus === "On Break";
  const displayedDuration =
    isToday ? formatElapsedTime(elapsedTime) : "00:00:00";
  const actionMessage = hasClockedIn && !isToday
    ? "Your previous session is still open. Use Clock Out to request a correction."
    : hasClockedIn
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

  const isBreakDisabled = !isToday;

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

        <div
          className={`mt-5 grid w-full grid-cols-1 gap-2.5 ${
            hasClockedIn ? "max-w-[355px] sm:grid-cols-2" : "max-w-[174px]"
          }`}
        >
          {hasClockedIn ? (
            <>
              <button
                type="button"
                onClick={hasTakenBreak ? handleEnBreak : handleStartBreak}
                disabled={isBreakDisabled || isStartbreak || isEndBreak}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ffc400] text-sm font-pbold text-white transition-colors hover:bg-[#ffc400] disabled:cursor-not-allowed disabled:bg-[#e8ecf2] disabled:text-[#a6afbd]"
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
              <button
                type="button"
                onClick={handleClockOutClick}
                disabled={isClockingOut || correctionPending}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#ef3e5c] text-sm font-pbold text-white transition-colors hover:bg-[#ef3e5c] disabled:cursor-not-allowed disabled:bg-[#e8ecf2] disabled:text-[#a6afbd]"
              >
                <FiLogOut size={18} aria-hidden="true" />
                {isClockingOut ? "Stopping..." : "Clock Out"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              disabled={Boolean(clockOutTime && isToday) || isClockingIn}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#69ad2f] text-sm font-pbold text-white shadow-[0_8px_18px_rgba(105,173,47,0.24)] transition-colors hover:bg-[#69ad2f] disabled:cursor-not-allowed disabled:bg-[#e8ecf2] disabled:text-[#a6afbd] disabled:shadow-none"
            >
              <FiLogIn size={19} aria-hidden="true" />
              {isClockingIn ? "Starting..." : "Clock In"}
            </button>
          )}
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

          <AttendanceCorrectionTimeRow control={control} attendance={attendanceRecord ? [attendanceRecord] : []} type="outTime">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="outTime"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    timeSteps={{ minutes: 1 }}
                    minutesStep={1}
                    label={"Corrected Out Time"}
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(time) => {
                      field.onChange(time ? time.toISOString() : null);
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </AttendanceCorrectionTimeRow>
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
                  rows={3} // â† Change this number to increase/decrease height
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
