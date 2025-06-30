import WidgetSection from "../../../components/WidgetSection";
import BarGraph from "../../../components/graphs/BarGraph";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import LazyDashboardWidget from "../../../components/Optimization/LazyDashboardWidget";
import ClockInOutAttendance from "../../../components/ClockInOutAttendance";
import AttendanceTimeline from "../../../components/AttendanceTimeline";


const MainDashboard = () => {

  const mainWidgets = [
    {
      layout: 2,
      widgets: [
        <WidgetSection layout={1} border title={"Clock In / Out Attendance"}>
          <ClockInOutAttendance />
        </WidgetSection>,
        <WidgetSection layout={1} border title={"Timeline"}>
          <AttendanceTimeline />
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
