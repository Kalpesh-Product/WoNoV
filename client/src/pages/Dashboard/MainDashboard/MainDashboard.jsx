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
      layout: 1,
      widgets: [
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <WidgetSection
              layout={1}
              border
              title={"Clock In / Out Attendance"}
            >
              <ClockInOutAttendance />
            </WidgetSection>
          </div>
          <div className="col-span-1">
            <WidgetSection layout={1} border title={"Timeline"}>
              <AttendanceTimeline />
            </WidgetSection>
          </div>
        </div>,
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
