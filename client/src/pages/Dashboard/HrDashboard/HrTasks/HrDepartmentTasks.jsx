import React, { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import WidgetSection from "../../../../components/WidgetSection";
import { useSelector } from "react-redux";
import SecondaryButton from "../../../../components/SecondaryButton";
import PrimaryButton from "../../../../components/PrimaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import dateToHyphen from "../../../../utils/dateToHyphen";
const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getCurrentFiscalStartYear = () => {
  const now = new Date();
  const month = now.getMonth();
  return month >= 3 ? now.getFullYear() : now.getFullYear() - 1;
};

const getFiscalMonths = (startYear) => {
  const months = [];
  for (let i = 0; i < 12; i += 1) {
    const date = new Date(startYear, 3 + i, 1);
    const shortMonth = SHORT_MONTHS[date.getMonth()];
    const shortYear = String(date.getFullYear()).slice(2);
    months.push(`${shortMonth}-${shortYear}`);
  }
  return months;
};

const getFiscalStartYearFromDate = (date) => {
  const month = date.getMonth();
  return month >= 3 ? date.getFullYear() : date.getFullYear() - 1;
};
const formatAssignedUser = (value, userIdToNameMap = new Map()) => {
  if (!value) return "-";

  if (Array.isArray(value)) {
    const formattedUsers = value
      .map((item) => formatAssignedUser(item, userIdToNameMap))
      .filter((name) => name && name !== "-");

    return formattedUsers.length ? formattedUsers.join(", ") : "-";
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    const isObjectId = /^[a-f\d]{24}$/i.test(normalized);
    if (isObjectId) return userIdToNameMap.get(normalized) || normalized;
    return normalized || "-";
  }

  const source = value.assignee || value.user || value.userId || value;
  const firstName = source.firstName || "";
  const middleName = source.middleName || "";
  const lastName = source.lastName || "";
  const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, " ").trim();

  if (fullName) return fullName;

  if (source?._id && userIdToNameMap.has(source._id)) {
    return userIdToNameMap.get(source._id);
  }

  return source.name || source.email || "-";
};


const HrDepartmentTasks = () => {
  const location = useLocation();
  const { department: departmentParam } = useParams();
  const axios = useAxiosPrivate()
  const { department: departmentFromState, tasks } = location.state || {};
  const department = departmentFromState || departmentParam;
 // const { month, department, tasks, year } = location.state || {};
  // const tasksRawData = useSelector((state) => state.hr.tasksRawData);

   const { data: usersDirectory = [] } = useQuery({
    queryKey: ["hrTaskUsersDirectory"],
    queryFn: async () => {
      const response = await axios.get("/api/users/fetch-users");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const userIdToNameMap = useMemo(() => {
    const map = new Map();

    usersDirectory.forEach((user) => {
      if (!user?._id) return;
      const fullName = [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (fullName) {
        map.set(user._id, fullName);
      }
    });

    return map;
  }, [usersDirectory]);

  const { data: tasksRawData = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasksRawData"],
    queryFn: async () => {
      const response = await axios.get("api/tasks/get-tasks-summary");

      return response.data.map((dept) => ({
        ...dept,
        department:
          typeof dept.department === "object"
            ? dept.department.name
            : dept.department,
        tasks: dept.tasks.map((task) => ({
          ...task,
          department:
            typeof task.department === "object"
              ? task.department.name
              : task.department,
          assignedDate: dateToHyphen(task.assignedDate),
          dueDate: dateToHyphen(task.dueDate),
        })),
      }));
    },
  });
  console.log("tasks : ", tasksRawData);
  const fullMonthNames = {
    Jan: "January",
    Feb: "February",
    Mar: "March",
    Apr: "April",
    May: "May",
    Jun: "June",
    Jul: "July",
    Aug: "August",
    Sep: "September",
    Oct: "October",
    Nov: "November",
    Dec: "December",
  };
   const currentFiscalStartYear = getCurrentFiscalStartYear();
  const [overviewFiscalStartYear, setOverviewFiscalStartYear] = useState(
    currentFiscalStartYear
  );

  const overviewFyMonths = useMemo(
    () => getFiscalMonths(overviewFiscalStartYear),
    [overviewFiscalStartYear]
  );

  const overviewFiscalYearLabel = `FY ${overviewFiscalStartYear}-${String(
    overviewFiscalStartYear + 1
  ).slice(2)}`;

  const currentDate = new Date();
  const currentMonthLabel = `${SHORT_MONTHS[currentDate.getMonth()]}-${String(
    currentDate.getFullYear()
  ).slice(2)}`;

  const [detailsFiscalStartYear, setDetailsFiscalStartYear] = useState(
    getFiscalStartYearFromDate(currentDate)
  );

  const detailsFyMonths = useMemo(
    () => getFiscalMonths(detailsFiscalStartYear),
    [detailsFiscalStartYear]
  );

  const initialMonthIndex = detailsFyMonths.findIndex(
    (m) => m === currentMonthLabel
  );

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    initialMonthIndex !== -1 ? initialMonthIndex : 0
  );

 const selectedMonth = detailsFyMonths[selectedMonthIndex];
    const [shortMonth, shortYear] = selectedMonth.split("-");
   const selectedMonthDisplay = `${fullMonthNames[shortMonth].toUpperCase()} - 20${shortYear}`;

  // if (!department || !tasks?.length) {
  //   return <div className="">No tasks found for this department.</div>;
  // }
  const filteredData = tasksRawData.filter(
    (item) => item.department === department
  );
  // const departmentName = filteredData[0]?.department;
  // const tasksData = filteredData[0]?.tasks;

    const departmentName = filteredData[0]?.department || department || "Department";
  const rawTasksData = filteredData[0]?.tasks || tasks || [];
  const tasksData = rawTasksData.filter(
    (task) => task?.taskType === "Department"
  );

 const handlePrevMonth = () => {
    if (selectedMonthIndex > 0) {
      setSelectedMonthIndex((prev) => prev - 1);
      return;
    }

    setDetailsFiscalStartYear((prev) => prev - 1);
    setSelectedMonthIndex(11);
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex < detailsFyMonths.length - 1) {
      setSelectedMonthIndex((prev) => prev + 1);
      return;
    }

    setDetailsFiscalStartYear((prev) => prev + 1);
    setSelectedMonthIndex(0);
  };

   const handlePrevFiscalYear = () => {
    setOverviewFiscalStartYear((prev) => {
      const updatedYear = prev - 1;
      setDetailsFiscalStartYear(updatedYear);
      return updatedYear;
    });
  };

  const handleNextFiscalYear = () => {
    setOverviewFiscalStartYear((prev) => {
      const updatedYear = prev + 1;
      setDetailsFiscalStartYear(updatedYear);
      return updatedYear;
    });
  };

  const monthlyMap = {};
  overviewFyMonths.forEach((label) => {
    monthlyMap[label] = { total: 0, achieved: 0 };
  });

  tasksData.forEach((task) => {
    const [day, month, year] = task.assignedDate.split("-").map(Number);
    const jsDate = new Date(year, month - 1, day);
    const label = `${jsDate.toLocaleString("default", {
      month: "short",
    })}-${String(jsDate.getFullYear()).slice(2)}`;

    if (monthlyMap[label]) {
      monthlyMap[label].total += 1;
      if (task.status === "Completed") {
        monthlyMap[label].achieved += 1;
      }
    }
  });

  const graphData = [
    {
      name: "Completed Tasks",
      group: `${departmentName} - ${selectedMonthDisplay}`,
    data: overviewFyMonths.map((label) => {
        const { total, achieved } = monthlyMap[label] || {
          total: 0,
          achieved: 0,
        };
        const percent = total > 0 ? (achieved / total) * 100 : 0;
        return {
          x: label,
          y: +percent.toFixed(1),
          raw: achieved,
        };
      }),
    },
    {
      name: "Pending Tasks",
      group: `${departmentName} - ${selectedMonthDisplay}`,
      data: overviewFyMonths.map((label) => {
        const { total, achieved } = monthlyMap[label] || {
          total: 0,
          achieved: 0,
        };
        const remaining = total - achieved;
        const percent = total > 0 ? (remaining / total) * 100 : 0;
        return {
          x: label,
          y: +percent.toFixed(1),
          raw: remaining,
        };
      }),
    },
  ];

  const graphOptions = {
    chart: {
      type: "bar",
      stacked: true, // ✅ stacked
      animations: { enabled: false },
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 5,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 1,
      colors: ["#fff"],
    },
    xaxis: {
      title: { text: "Months" },
        categories: overviewFyMonths,
    },
    yaxis: {
      title: { text: "Completion (%)" },
      labels: {
        formatter: (val) => `${val.toFixed(0)}%`,
      },
      max: 100,
    },
    colors: ["#54C4A7", "#EB5C45"],
    fill: { opacity: 1 },
    legend: { position: "top" },
    tooltip: {
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const month = w.config.series[seriesIndex].data[dataPointIndex].x;

        const completed = w.config.series[0].data[dataPointIndex].raw;
        const remaining = w.config.series[1].data[dataPointIndex].raw;
        const total = completed + remaining;

        return `
          <div style="padding:8px; font-family: Poppins, sans-serif; font-size: 13px; width: 220px;">
            <strong>${month}</strong>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
    
            <div style="display: flex; justify-content: space-between;">
              <span>Total Tasks</span>
              <span>${total}</span>
            </div>
    
            <div style="display: flex; justify-content: space-between;">
              <span>Completed Tasks</span>
              <span>${completed}</span>
            </div>
    
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
    
            <div style="display: flex; justify-content: space-between;">
              <span>Pending Tasks</span>
              <span>${remaining}</span>
            </div>
          </div>
        `;
      },
    },
  };

  const tasksColumns = [
    {
      headerName: "Sr No",
      field: "id",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 100,
    },
    {
      field: "taskName",
      headerName: "Tasks Name",
      flex: 1,
    },
    {
      field: "assignedTo",
      headerName: "Assigned To",
      flex: 1,
    },
    { field: "assignedBy", headerName: "Assigned By", flex: 1 },
    { field: "assignedDate", headerName: "Assigned Date", flex: 1 },
    // { field: "totalPercent", headerName: "Total (%)", flex: 1 },
    { field: "dueDate", headerName: "Due Date", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const statusColorMap = {
          Pending: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          "in-progress": { backgroundColor: "#ADD8E6", color: "#00008B" }, // Light blue bg, dark blue font
          Completed: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={params.value}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
  ];

  const filteredTasks = tasksData.filter((task) => {
    const [day, month, year] = task.assignedDate.split("-").map(Number);
       const taskDate = new Date(year, month - 1, day);
    const taskMonthLabel = `${SHORT_MONTHS[taskDate.getMonth()]}-${String(
      taskDate.getFullYear()
    ).slice(2)}`;

    return taskMonthLabel === selectedMonth;
  });

  const completedFilteredTasks = filteredTasks.filter(
    (task) => String(task.status || "").toLowerCase() === "completed"
  );

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection
        title={`${departmentName} department Tasks overview`}
        border
        TitleAmount={`TOTAL Tasks :  ${tasksData.length || 0}`}
      >
        <NormalBarGraph
          data={graphData}
          options={graphOptions}
          year={false}
          height={350}
        />
           <div className="flex justify-center items-center gap-4 pb-4">
          <SecondaryButton
            title={<MdNavigateBefore />}
            handleSubmit={handlePrevFiscalYear}
           // externalStyles="min-w-20 px-6 py-2 !bg-gray-400 !text-black font-semibold rounded-lg"
          />
          <div className="text-sm min-w-[80px] text-center text-primary font-semibold">
            {overviewFiscalYearLabel}
          </div>
          <PrimaryButton
            title={<MdNavigateNext />}
            handleSubmit={handleNextFiscalYear}
            externalStyles="min-w-20 px-6 py-2 !bg-gray-400 !text-black font-semibold rounded-lg"
          />
        </div>
      </WidgetSection>

      <WidgetSection
        title={`Tasks details`}
        border
       TitleAmount={`${selectedMonthDisplay} : ${
          completedFilteredTasks.length > 1
            ? `${completedFilteredTasks.length} Tasks`
            : `${completedFilteredTasks.length} Tasks`
        } `}
      >
        <div className="flex justify-center items-center gap-4">
          <SecondaryButton
            title={<MdNavigateBefore />}
            handleSubmit={handlePrevMonth}
            //externalStyles="min-w-20 px-6 py-2 !bg-gray-400 !text-black font-semibold rounded-lg"
           // disabled={selectedMonthIndex === 0}
          />
         <div className="text-sm min-w-[80px] text-center text-primary font-semibold">
                        {selectedMonthDisplay}
          </div>
          <PrimaryButton
            title={<MdNavigateNext />}
            handleSubmit={handleNextMonth}
            externalStyles="min-w-20 px-6 py-2 !bg-gray-400 !text-black font-semibold rounded-lg"
           // disabled={selectedMonthIndex === fyMonths.length - 1}
          />
        </div>
        <div>
          <AgTable
           key={selectedMonth}
            tableHeight={300}
            //hideFilter
            search={true}
            exportData
            columns={tasksColumns}
            data={completedFilteredTasks.map((item, index) => ({
              id: index + 1,
              taskName: item.taskName,
              assignedTo: formatAssignedUser(item.assignedTo, userIdToNameMap),
              assignedBy: formatAssignedUser(item.assignedBy, userIdToNameMap),
              assignedDate: item.assignedDate,
              dueDate: item.dueDate,
              status: item.status,
            }))}
          />
        </div>

      </WidgetSection>
    </div>
  );
};

export default HrDepartmentTasks;
