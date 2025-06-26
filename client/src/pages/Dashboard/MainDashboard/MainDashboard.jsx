import WidgetSection from "../../../components/WidgetSection";
import BarGraph from "../../../components/graphs/BarGraph";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import LazyDashboardWidget from "../../../components/Optimization/LazyDashboardWidget";
import ClockInOutAttendance from "../../../components/ClockInOutAttendance";

const MainDashboard = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const mainWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection
          layout={1}
          border
          title={"Clock In / Out Attendance"}
        >
          <ClockInOutAttendance />
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
