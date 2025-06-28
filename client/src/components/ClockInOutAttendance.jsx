import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { computeOffset, getElapsedSecondsWithOffset } from "../utils/time";
import humanTime from "../utils/humanTime";
import { queryClient } from "../main";

const ClockInOutAttendance = () => {
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
      const calculatedOffset = computeOffset(serverNow);
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
      toast.success("Break started");
      setStopBreak(null);
      setTakeBreak(breakTime);
      setBreaks((prev) => [...prev, { start: breakTime }]);
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
      toast.success("Break ended");
      setTakeBreak(null);
      setStopBreak(breakTime);
      setBreaks((prev) => {
        const updated = [...prev];
        const len = updated.length;

        if (len > 0 && !updated[len - 1].end) {
          updated[len - 1].end = { end: breakTime };
        }

        return updated;
      });
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

    <div className="flex flex-col  gap-4 p-4 h-80 ">
      <div className="grid grid-cols-1 gap-4">
        <div className="col-span-2 flex  items-center flex-col h-80 ">
          <div className="text-subtitle text-primary font-pmedium font-medium mb-4">
            {currDate}
          </div>

          <div className="flex gap-12">
            <button
              onClick={startTime ? handleStop : handleStart}
              className={`h-40 w-40 rounded-full ${
                startTime ? "bg-[#EB5C45]" : "bg-wonoGreen  transition-all"
              }  text-white flex justify-center items-center hover:scale-105`}
              disabled={isClockingIn || isClockingOut}
            >
              {auth?.user?.clockInDetails?.hasClockedIn
                ? "Clock Out"
                : isClockingIn
                ? "Starting..."
                : "Clock In"}
            </button>

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
          </div>
          <div className="text-subtitle text-primary font-pmedium font-medium mb-4 pt-4">
            {startTime ? `${formatElapsedTime(elapsedTime)}` : "Not Clocked In"}
          </div>

          <div className="flex gap-4">
            <div className="flex justify-between">
              <span className="text-muted">Clock-in Time: &nbsp;</span>
              <span className="font-medium">09:30 am</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Clock-out Time: &nbsp;</span>
              <span className="font-medium">06:30 pm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// const ClockInOutAttendance = ({ attendanceData, setAttendanceData }) => {
//   const axios = useAxiosPrivate();
//   const { auth } = useAuth();
//   const { startTime, breaks, takeBreak, isBooting, elapsedTime, offset } =
//     attendanceData || {};
//   const timerRef = useRef(null);

//   useEffect(() => {
//     if (attendanceData?.startTime) {
//       timerRef.current = setInterval(() => {
//         setAttendanceData((prev) => ({
//           ...prev,
//           elapsedTime: getElapsedSecondsWithOffset(prev.startTime, prev.offset),
//         }));
//       }, 1000);
//     }

//     return () => clearInterval(timerRef.current);
//   }, [attendanceData?.startTime, attendanceData?.offset]);

//   const [stopBreak, setStopBreak] = useState(null);

//   const currDate = new Date().toLocaleDateString("en-US", {
//     weekday: "short",
//     year: "numeric",
//     month: "short",
//     day: "2-digit",
//   });

//   const { mutate: clockIn, isPending: isClockingIn } = useMutation({
//     mutationFn: async (inTime) => {
//       const res = await axios.post("/api/attendance/clock-in", {
//         inTime,
//         entryType: "web",
//       });
//       return { data: res.data, inTime };
//     },
//     onSuccess: ({ inTime }) => {
//       toast.success("Clocked in successfully!");
//       setAttendanceData((prev) => ({
//         ...prev,
//         startTime: inTime,
//         breaks: [],
//         takeBreak: null,
//         offset: 0,
//         elapsedTime: getElapsedSecondsWithOffset(inTime, 0),
//       }));
//     },
//     onError: (error) => toast.error(error?.response?.data?.message),
//   });

//   const { mutate: clockOut, isPending: isClockingOut } = useMutation({
//     mutationFn: async (outTime) => {
//       const res = await axios.patch("/api/attendance/clock-out", {
//         outTime,
//       });
//       return res.data;
//     },
//     onSuccess: () => {
//       toast.success("Clocked out successfully!");
//       setAttendanceData((prev) => ({
//         ...prev,
//         startTime: null,
//         takeBreak: null,
//         breaks: [],
//         offset: 0,
//         elapsedTime: 0,
//       }));
//     },
//     onError: (error) => toast.error(error?.response?.data?.message),
//   });

//   const { mutate: startBreak, isPending: isStartbreak } = useMutation({
//     mutationFn: async (breakTime) => {
//       const res = await axios.patch("/api/attendance/start-break", {
//         startBreak: breakTime,
//       });
//       return { data: res.data, breakTime };
//     },
//     onSuccess: ({ breakTime }) => {
//       toast.success("Break started");
//       setStopBreak(null);
//       setAttendanceData((prev) => ({
//         ...prev,
//         takeBreak: breakTime,
//         breaks: [...prev.breaks, { start: breakTime }],
//         offset: 0,
//       }));
//     },
//     onError: (error) => toast.error(error?.response?.data?.message),
//   });

//   const { mutate: endBreak, isPending: isEndBreak } = useMutation({
//     mutationFn: async (breakTime) => {
//       const res = await axios.patch("/api/attendance/end-break", {
//         endBreak: breakTime,
//       });
//       return { data: res.data, breakTime };
//     },
//     onSuccess: ({ breakTime }) => {
//       toast.success("Break ended");
//       setStopBreak(breakTime);
//       setAttendanceData((prev) => {
//         const updatedBreaks = [...prev.breaks];
//         const len = updatedBreaks.length;

//         if (len > 0 && !updatedBreaks[len - 1].end) {
//           updatedBreaks[len - 1].end = breakTime;
//         }

//         return {
//           ...prev,
//           takeBreak: null,
//           breaks: updatedBreaks,
//           offset: 0,
//         };
//       });
//     },
//     onError: (error) => toast.error(error?.response?.data?.message),
//   });

//   const handleStart = () => clockIn(new Date().toISOString());
//   const handleStop = () => clockOut(new Date().toISOString());
//   const handleStartBreak = () => startBreak(new Date().toISOString());
//   const handleEnBreak = () => endBreak(new Date().toISOString());

//   const formatElapsedTime = (seconds) => {
//     const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
//     const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
//     const secs = String(seconds % 60).padStart(2, "0");
//     return `${hrs}:${mins}:${secs}`;
//   };

//    useEffect(()=>{

//     console.log("attendance",attendanceData)
//   },[attendanceData])

//   if (isBooting) {
//     return (
//       <div className="flex justify-center items-center h-40">
//         <span className="text-content text-gray-600">
//           Loading attendance...
//         </span>
//       </div>
//     );
//   }


//   return (
//     <div className="flex flex-col gap-4 p-4 h-80">
//       <div className="grid grid-cols-1 gap-4">
//         <div className="col-span-2 flex items-center flex-col h-80">
//           <div className="text-subtitle text-primary font-pmedium font-medium mb-4">
//             {currDate}
//           </div>

//           <div className="flex gap-12">
//             <button
//               onClick={startTime ? handleStop : handleStart}
//               className={`h-40 w-40 rounded-full ${
//                 startTime ? "bg-[#EB5C45]" : "bg-wonoGreen transition-all"
//               } text-white flex justify-center items-center hover:scale-105`}
//               disabled={isClockingIn || isClockingOut}
//             >
//               {startTime
//                 ? "Clock Out"
//                 : isClockingIn
//                 ? "Starting..."
//                 : "Clock In"}
//             </button>

//             <button
//               onClick={takeBreak ? handleEnBreak : handleStartBreak}
//               className={`h-40 w-40 rounded-full ${
//                 takeBreak ? "bg-[#FB923C]" : "bg-[#FACC15] transition-all"
//               } text-white flex justify-center items-center hover:scale-105`}
//               disabled={isStartbreak || isEndBreak}
//             >
//               {takeBreak
//                 ? "End Break"
//                 : isStartbreak
//                 ? "Starting..."
//                 : "Start Break"}
//             </button>
//           </div>

//           <div className="text-subtitle text-primary font-pmedium font-medium mb-4 pt-4">
//             {startTime ? formatElapsedTime(elapsedTime) : "Not Clocked In"}
//           </div>

//           <div className="flex gap-4">
//             <div className="flex justify-between">
//               <span className="text-muted">Clock-in Time: &nbsp;</span>
//               <span className="font-medium">09:30 am</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-muted">Clock-out Time: &nbsp;</span>
//               <span className="font-medium">06:30 pm</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

export default ClockInOutAttendance;
