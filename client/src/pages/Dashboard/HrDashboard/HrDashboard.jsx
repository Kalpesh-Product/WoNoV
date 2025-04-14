import React, { lazy, Suspense } from "react";
import WidgetSection from "../../../components/WidgetSection";
import Card from "../../../components/Card";
import { LuHardDriveUpload } from "react-icons/lu";
import { Skeleton, Box, CircularProgress } from "@mui/material";
import { CgWebsite } from "react-icons/cg";
import { SiCashapp } from "react-icons/si";
import { SiGoogleadsense } from "react-icons/si";
import { MdMiscellaneousServices } from "react-icons/md";
import DataCard from "../../../components/DataCard";
import PayRollExpenseGraph from "../../../components/HrDashboardGraph/PayRollExpenseGraph";
import MuiTable from "../../../components/Tables/MuiTable";
import PieChartMui from "../../../components/graphs/PieChartMui";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import BarGraph from "../../../components/graphs/BarGraph";
import { useNavigate } from "react-router-dom";

const LayerBarGraph = lazy(() =>
  import("../../../components/graphs/LayerBarGraph")
);

const HrDashboard = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const accessibleModules = new Set();

  auth.user.permissions?.deptWisePermissions?.forEach((department) => {
    department.modules.forEach((module) => {
      const hasViewPermission = module.submodules.some((submodule) =>
        submodule.actions.includes("View")
      );

      if (hasViewPermission) {
        accessibleModules.add(module.moduleName);
      }
    });
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const rawSeries = [
    {
      name: "Sales Assigned",
      data: [40, 45, 35, 50, 55, 45, 60, 55, 65, 70, 20, 15],
      group: "total",
    },
    {
      name: "IT Assigned",
      data: [40, 45, 35, 50, 55, 45, 60, 55, 65, 70, 25, 10],
      group: "total",
    },
    {
      name: "Tech Assigned",
      data: [45, 50, 40, 55, 60, 50, 65, 60, 70, 75, 30, 30],
      group: "total",
    },

    {
      name: "Admin Assigned",
      data: [45, 50, 40, 55, 60, 50, 65, 60, 70, 75, 10, 10],
      group: "total",
    },
    {
      name: "Maintainance Assigned",
      data: [45, 50, 40, 55, 60, 50, 65, 60, 70, 75, 5, 3],
      group: "total",
    },
    {
      name: "Space Completed",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      group: "space",
    },
    {
      name: "Sales Completed",
      data: [40, 45, 25, 40, 45, 35, 50, 45, 55, 60, 10, 10],
      group: "completed",
    },
    {
      name: "IT Completed",
      data: [40, 45, 25, 40, 45, 35, 50, 45, 55, 60, 20, 10],
      group: "completed",
    },

    {
      name: "Tech Completed",
      data: [45, 40, 30, 45, 50, 40, 55, 50, 60, 65,30,30],
      group: "completed",
    },
    {
      name: "Admin Completed",
      data: [40, 30, 40, 52, 46, 40, 60, 59, 50, 70,8,10],
      group: "completed",
    },
    {
      name: "Maintainance Completed",
      data: [45, 50, 40, 55, 60, 50, 65, 60, 70, 75,4,1],
      group: "completed",
    },
  ];

  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      
      stacked: true,
      fontFamily: "Poppins-Regular, Arial, sans-serif",
      events: {
        dataPointSelection: () => {
          navigate("/app/tasks");
        },
      },
    },
    colors: ["#36BA98", "#E83F25"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "65%",
        borderRadius: 2,
        borderRadiusApplication: "none",
      },
    },
    dataLabels: {
      enabled: true, // Enable data labels
    },
    xaxis: {
      categories: [
        "Apr-24",
        "May-24",
        "Jun-24",
        "Jul-24",
        "Aug-24",
        "Sep-24",
        "Oct-24",
        "Nov-24",
        "Dec-24",
        "Jan-25",
        "Feb-25",
        "Mar-25",
      ],
      title: {
        text: "  ",
      },
    },
    yaxis: {
      max: 100,
      title:{text: "Assigned vs Completed"},
      labels: {
        formatter: (val) => `${Math.round(val)}`,
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      show: true,
      position:'top'
    },

    tooltip: {
      y: {
        formatter: (val, { seriesIndex, dataPointIndex }) => {
          const rawData = rawSeries[seriesIndex]?.data[dataPointIndex];
          return `${rawData} Tasks`;
        },
      },
    },
  };

  //firstgraph

  const utilisedData = [125, 150, 99, 85, 70, 50, 80, 95, 100, 65, 50, 120];
  const defaultData = utilisedData.map((value) =>
    Math.max(100 - Math.min(value, 100), 0)
  );
  const utilisedStack = utilisedData.map((value) => Math.min(value, 100));
  const exceededData = utilisedData.map((value) =>
    value > 100 ? value - 100 : 0
  );

  const data = [
    { name: "Utilised Budget", data: utilisedStack },
    { name: "Default Budget", data: defaultData },
    { name: "Exceeded Budget", data: exceededData },
  ];

  const optionss = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: false,
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: () => {
          navigate("finance");
        },
      },
      animations: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "35%",
        borderRadius: 3,
        borderRadiusWhenStacked: "all",
        borderRadiusApplication: "end",
      },
    },
    colors: ["#36BA98", "#275D3E", "#E83F25"], // Colors for the series
    dataLabels: {
      enabled: true,
      fontSize: "10px",
      formatter: (value, { seriesIndex }) => {
        if (seriesIndex === 1) return "";
        return `${value}%`;
      },
    },
    xaxis: {
      categories: [
        "Apr-24",
        "May-24",
        "Jun-24",
        "Jul-24",
        "Aug-24",
        "Sep-24",
        "Oct-24",
        "Nov-24",
        "Dec-24",
        "Jan-25",
        "Feb-25",
        "Mar-25",
      ],
    },
    yaxis: {
      max: 150,
      labels: {
        formatter: (value) => `${value}%`,
      },
    },
    tooltip: {
      shared: true, // Ensure all series values are shown together
      intersect: false, // Avoid showing individual values for each series separately
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const utilised = utilisedData[dataPointIndex] || 0;
        const exceeded = exceededData[dataPointIndex] || 0;
        const defaultVal = defaultData[dataPointIndex] || 0;

        // Custom tooltip HTML
        return `
        <div style="padding: 10px; font-size: 12px; line-height: 1.5; text-align: left;">
          <strong style="display: block; text-align: center; margin-bottom: 8px;">
            ${w.globals.labels[dataPointIndex]}
          </strong>
          <div style="display: flex; gap:3rem;">
            <span style="flex: 1; text-align: left;">Default Budget:</span>
            <span style="flex: 1; text-align: right;">100%</span>
          </div>
          <div style="display: flex; gap:3rem;">
            <span style="flex: 1; text-align: left;">Utilized Budget:</span>
            <span style="flex: 1; text-align: right;">${utilised}%</span>
          </div>
          <div style="display: flex; gap:3rem;">
            <span style="flex: 1; text-align: left;">Exceeded Budget:</span>
            <span style="flex: 1; text-align: right;">${exceeded}%</span>
          </div>
        </div>
      `;
      },
    },

    legend: {
      show: true,
      position: "top",
    },
  };

  const columns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "title", label: "Name", align: "left" },
    { id: "start", label: "Date", align: "left" },
  ];

  const { data: birthdays = [], isLoading } = useQuery({
    queryKey: ["birthdays"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/events/get-birthdays");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const dummyBirthdays = [
    { title: "Machindrath Parkar", start: "2025-04-16" },
    { title: "Faizan Shaikh", start: "2025-04-16" },
    { title: "Anne Fernandes", start: "2025-04-18" },
    { title: "Melisa Fernandes", start: "2025-04-20" },
    { title: "Allan Silveira", start: "2025-04-22" },
    { title: "Sankalp Kalangutkar", start: "2025-04-22" },
    { title: "Narshiva Naik", start: "2025-04-26" },
    { title: "Hema", start: "2025-04-30" },
  ];
  
  

  const columns2 = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "title", label: "Holiday/Event", align: "center" },
    { id: "start", label: "Date", align: "left" },
  ];

  const { data: holidayEvents = [] } = useQuery({
    queryKey: ["holidayEvents"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/events/all-events");
        const filteredEvents = response.data.filter(
          (event) => event.extendedProps.type !== "birthday"
        );
        return filteredEvents;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const columns3 = [
    { id: "srNo", label: "ID", align: "left" },
    { id: "employeeName", label: "Employee name", align: "left" },
    { id: "department", label: "Department", align: "center" },
    { id: "Performance (%)", label: "Performance (%)", align: "center" },
  ];

  const columns4 = [
    { id: "srNo", label: "ID", align: "left" },
    { id: "employeeName", label: "Employee name", align: "left" },
    { id: "department", label: "Department", align: "center" },
    { id: "Performance (%)", label: "Performance (%)", align: "center" },
  ];

  const rows3 = [
    {
      srNo: 1,
      ranks: "1",
      employeeName: "Aiwin",
      department: "Tech",
      "Performance (%)": "97",
    },
    {
      srNo: 2,
      ranks: "2",
      employeeName: "Allen Silvera",
      department: "Tech",
      "Performance (%)": "90",
    },
    {
      srNo: 3,
      ranks: 3,
      employeeName: "Sankalp Kalangutkar",
      department: "Tech",
      "Performance (%)": "80",
    },
  ];

  const rows4 = [
    {
      srNo: 1,
      ranks: 30,
      employeeName: "Anushri Bhagat",
      department: "Tech",
      "Performance (%)": "40",
    },
    {
      srNo: 2,
      ranks: 25,
      employeeName: "Sumera Naik",
      department: "Tech",
      "Performance (%)": "43",
    },
    {
      srNo: 3,
      ranks: 28,
      employeeName: "Sunaina Bharve",
      department: "Tech",
      "Performance (%)": "45",
    },
  ];

  // Calculate total and gender-specific counts
  const totalUsers = usersQuery.isLoading ? [] : usersQuery.data.length;

  const maleCount = usersQuery.isLoading
    ? []
    : usersQuery.data.filter((user) => user.gender === "Male").length;

  const femaleCount = usersQuery.isLoading
    ? []
    : usersQuery.data.filter((user) => user.gender === "Female").length;

  const genderData = [
    {
      id: 0,
      value: ((maleCount / totalUsers) * 100).toFixed(2),
      actualCount: maleCount,
      label: "Male",
      color: "#0056B3",
    },
    {
      id: 1,
      value: ((femaleCount / totalUsers) * 100).toFixed(2),
      actualCount: femaleCount,
      label: "Female",
      color: "#FD507E",
    },
  ];

  const genderPieChart = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: () => {
          navigate("employee/view-employees");
        },
      },
    },
    stroke: {
      show: true,
      width: 6, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
    },
    labels: ["Male", "Female"], // Labels for the pie slices
    colors: ["#0056B3", "#FD507E"], // Pass colors as an array
    dataLabels: {
      enabled: true,
      position: "center",
      style: {
        fontSize: "14px", // Adjust the font size of the labels
        fontWeight: "bold",
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: "#000",
        opacity: 0.45,
      },
      formatter: function (val) {
        return `${val.toFixed(0)}%`; // Show percentage value in the center
      },
    },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex }) {
        const item = genderData[seriesIndex]; // Use genderData to fetch the correct item
        return `
          <div style="padding: 5px; font-size: 12px;">
            ${item.label}: ${item.actualCount} employees
          </div>`;
      },
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
    },
  };

  //First pie-chart config data end

  //Second pie-chart config data start
  const techGoaVisitors = [
    { id: 0, value: 5, label: "Panaji", color: "#4A90E2" }, // Light Blue
    { id: 1, value: 2, label: "Margao", color: "#007AFF" }, // Medium Blue
    { id: 2, value: 3, label: "Mapusa", color: "#0056B3" }, // Dark Blue
    { id: 3, value: 3, label: "Ponda", color: "#1E90FF" }, // Dodger Blue
    { id: 4, value: 6, label: "Verna", color: "#87CEFA" }, // Sky Blue
  ];

  const techGoaVisitorsOptions = {
    chart: {
      type: "pie",
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: () => {
          navigate("employee/view-employees");
        },
      },
    },
    stroke: {
      show: true,
      width: 6, // Increase for more "gap"
      colors: ["#ffffff"], // Or match background color
    },
    labels: techGoaVisitors.map((item) => item.label), // Labels for the pie slices
    colors: techGoaVisitors.map((item) => item.color), // Assign colors to slices
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "14px",
        fontWeight: "bold",
      },
      formatter: function (val) {
        return `${val.toFixed(0)}%`; // Show percentage value
      },
    },
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex }) {
        const item = techGoaVisitors[seriesIndex]; // Access the correct item
        return `
        <div style="padding: 5px; font-size: 12px;">
          ${item.label}: ${item.value} employees
        </div>`;
      },
    },
    legend: {
      position: "right",
      horizontalAlign: "center",
    },
  };

  const hrWidgets = [
    {
      layout: 1,
      widgets: [
        <Suspense
          fallback={
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Simulating chart skeleton */}
              <Skeleton variant="text" width={200} height={30} />
              <Skeleton variant="rectangular" width="100%" height={300} />
            </Box>
          }
        >
          <WidgetSection layout={1} border title={"Budget v/s Achievements"} titleLabel={"FY 2024-25"}>
            <LayerBarGraph data={data} options={optionss} />
            <hr />
            <WidgetSection layout={3} padding>
              <DataCard
                data={"40K"}
                title={"Projected"}
                route={"/app/dashboard/hr-dashboard/finance/budget"}
                description={`Current Month : ${new Date().toLocaleString(
                  "default",
                  { month: "long" }
                )}`}
              />
              <DataCard
                data={"35K"}
                title={"Actual"}
                route={"/app/dashboard/hr-dashboard/finance/budget"}
                description={`Current Month : ${new Date().toLocaleString(
                  "default",
                  { month: "long" }
                )}`}
              />
              <DataCard
                data={6000}
                title={"Requested"}
                route={"/app/dashboard/hr-dashboard/finance/budget"}
                description={`Current Month : ${new Date().toLocaleString(
                  "default",
                  { month: "long" }
                )}`}
              />
            </WidgetSection>
          </WidgetSection>
        </Suspense>,
      ],
    },
    {
      layout: 6,
      widgets: [
        { icon: <CgWebsite />, title: "Employee", route: "employee" },
        { icon: <LuHardDriveUpload />, title: "Company", route: "company" },
        { icon: <SiCashapp />, title: "Finance", route: "finance" },
        { icon: <CgWebsite />, title: "Mix Bag", route: "#" },
        { icon: <SiGoogleadsense />, title: "Data", route: "data" },
        {
          icon: <MdMiscellaneousServices />,
          title: "Settings",
          route: "settings",
        },
      ]
        .filter((widget) => accessibleModules.has(widget.title)) // ✅ Filter widgets
        .map((widget, index) => (
          <Card
            key={index}
            icon={widget.icon}
            title={widget.title}
            route={widget.route}
          />
        )), // ✅ Convert objects into JSX elements
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          title="Active"
          data="28"
          description="Current Headcount"
          route={"employee/view-employees"}
        />,
        <DataCard
          title="Average"
          data="52K"
          description="salary"
          route={"employee/view-employees"}
        />,
        <DataCard
          title="Average"
          data="25"
          description="Monthly Employees"
          route={"employee/view-employees"}
        />,
        <DataCard
          title="Average"
          data="4%"
          description="Monthly Iteration"
          route={"employee/view-employees"}
        />,
        <DataCard
          title="Average"
          data="92%"
          description="Attendance"
          route={"employee/view-employees"}
        />,
        <DataCard
          title="Average"
          data="8.1hr"
          description="Working Hours"
          route={"employee/view-employees"}
        />,
      ],
    },
    {
      layout: 1,
      widgets: [
        <Suspense
          fallback={
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Simulating chart skeleton */}
              <Skeleton variant="text" width={200} height={30} />
              <Skeleton variant="rectangular" width="100%" height={300} />
            </Box>
          }
        >
          <WidgetSection
            layout={1}
            border
            padding
            titleLabel={"FY 2024-25"}
            title={"Department Wise Tasks Vs Achievements "}
          >
            <BarGraph
              data={rawSeries}
              options={options}
              departments={["Sales", "IT", "Tech", "Admin", "Maintainance"]}
            />
          </WidgetSection>
        </Suspense>,
      ],
    },
    {
      layout: 2,
      heading: "Site Visitor Analytics",
      widgets: [
        <WidgetSection title={"Employee Gender Distribution"} border>
          <PieChartMui
            percent={true} // Enable percentage display
            title={"Gender Distribution"}
            data={genderData} // Pass processed data
            options={genderPieChart}
          />
        </WidgetSection>,
        <WidgetSection layout={1} border title={"City Wise Employees"}>
          <PieChartMui
            percent={true} // Enable percentage display
            data={techGoaVisitors} // Pass processed data
            options={techGoaVisitorsOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        !isLoading ? (
          <MuiTable
            key={birthdays.length}
            Title="Current Months Birthday List"
            columns={columns}
            rows={[
              ...[...dummyBirthdays, ...birthdays].map((bd, index) => ({
                id: index + 1,
                title: bd.title,
                start: new Date(bd.start).toLocaleDateString(),
              })),
            ]}
            rowsToDisplay={5}
            scroll
          />
        ) : (
          <CircularProgress key="loading-spinner" />
        ),

        <MuiTable
          Title="Current Months Holidays and Events"
          columns={columns2}
          rows={holidayEvents.map((holiday, index) => ({
            id: index + 1,
            title: holiday.title,
            start: new Date(holiday.start).toLocaleDateString(),
          }))}
          rowsToDisplay={5}
          scroll
        />,

        <MuiTable Title="Top 3 Performers" columns={columns3} rows={rows3} />,
        <MuiTable
          Title="Under 3 Performed List"
          columns={columns4}
          rows={rows4}
        />,
      ],
    },
  ];

  return (
    <>
      <PayRollExpenseGraph />
      <div>
        {hrWidgets.map((widget, index) => (
          <div>
            <WidgetSection layout={widget.layout} key={index}>
              {widget.widgets}
            </WidgetSection>
          </div>
        ))}
      </div>
    </>
  );
};

export default HrDashboard;
