import WidgetSection from "../../../components/WidgetSection";
import BarGraph from "../../../components/graphs/BarGraph";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import LazyDashboardWidget from "../../../components/Optimization/LazyDashboardWidget";
import ClockInOutAttendance from "../../../components/ClockInOutAttendance";
import AttendanceTimeline from "../../../components/AttendanceTimeline";
import { computeOffset, getElapsedSecondsWithOffset } from "../../../utils/time";
import { useEffect, useRef, useState } from "react";
import useAuth from "../../../hooks/useAuth";

const MainDashboard = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
   const { auth } = useAuth();
  const timerRef = useRef(null);
  const currDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  const [attendanceData, setAttendanceData] = useState({
    startTime: null,
    endTime: null,
    breaks: [],
    takeBreak: null,
    stopBreak: null,
    elapsedTime: 0,
    isBooting: true,
    offset: 0
  });

  // Boot with server timestamps
    useEffect(() => {
      const clockIn = auth?.user?.clockInDetails?.clockInTime;
      const serverNow = auth?.user?.time;
  
      if (auth?.user?.clockInDetails?.hasClockedIn && clockIn && serverNow) {
        setAttendanceData((prev) => ({
          ...prev,
          startTime: clockIn,
          breaks: Array.isArray(auth?.user?.clockInDetails?.breaks)
            ? auth.user.clockInDetails.breaks
            : [],
        }));
  
        const calculatedOffset = computeOffset(serverNow);
        const elapsedTime = getElapsedSecondsWithOffset(clockIn, calculatedOffset);

         setAttendanceData((prev) => ({
        ...prev,
        offset: calculatedOffset,
        elapsedTime: elapsedTime
      }));
      }
  
        setAttendanceData((prev) => ({
        ...prev,
        isBooting: false
      }));
    }, [auth, setAttendanceData]);

    
  // Timer ticking using offset
  useEffect(() => {
    if (attendanceData.startTime) {
      timerRef.current = setInterval(() => {
         setAttendanceData((prev) => ({
        ...prev,
        elapsedTime: getElapsedSecondsWithOffset(attendanceData.startTime, attendanceData.offset),
      }));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [attendanceData.startTime, attendanceData.offset]);


  const mainWidgets = [
    {
      layout: 2,
      widgets: [
        <WidgetSection layout={1} border title={"Clock In / Out Attendance"}>
          <ClockInOutAttendance
            attendanceData={attendanceData}
            setAttendanceData={setAttendanceData}
          />
        </WidgetSection>,
        <WidgetSection layout={1} border title={"Timeline"}>
          <AttendanceTimeline attendanceData={attendanceData} />
        </WidgetSection>,
      ],
    },
  ];
  return (
    <div>
      {mainWidgets.map((widget, index) => (
        <LazyDashboardWidget
          key={index}
          layout={widget.layout}
          widgets={widget.widgets}
        />
      ))}
    </div>
  );
};

export default MainDashboard;
