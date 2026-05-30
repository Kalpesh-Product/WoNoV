import React, { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { Chip } from "@mui/material";

import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import SecondaryButton from "../../../../components/SecondaryButton";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" && value.includes("-")) {
    const [a, b, c] = value.split("-");

    if (a?.length === 4) {
      const parsedIso = new Date(value);
      return Number.isNaN(parsedIso.getTime()) ? null : parsedIso;
    }

    const [d, m, y] = [Number(a), Number(b), Number(c)];
    if (d && m && y) {
      const parsed = new Date(y, m - 1, d);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const parseSelectedDate = (value) => {
  if (!value) return new Date();
   if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? new Date() : value;
  if (typeof value === "string" && value.includes("-")) {
    const [a, b, c] = value.split("-");
    if (a?.length === 4) {
      const y = Number(a);
      const m = Number(b);
      const d = Number(c);
      if (y && m && d) return new Date(y, m - 1, d, 12, 0, 0);
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const toLocalIsoDate = (value) => {
  const date = toDate(value);
  if (!date) return null;
  return formatDateKey(date);
};

const isTaskScheduledOnOrBeforeDate = (task, selectedDateKey) => {
  const taskDateKey = toLocalIsoDate(
    task?.assignedDate || task?.dueDate || task?.createdAt,
  );
  return !!taskDateKey && taskDateKey <= selectedDateKey;
};

const isSameSelectedDate = (dateValue, selectedDateKey) =>
  toLocalIsoDate(dateValue) === selectedDateKey;

const isAfterSelectedDate = (dateValue, selectedDateKey) => {
  const dateKey = toLocalIsoDate(dateValue);
  return !!dateKey && dateKey > selectedDateKey;
};

const isBeforeSelectedDate = (dateValue, selectedDateKey) => {
  const dateKey = toLocalIsoDate(dateValue);
  return !!dateKey && dateKey < selectedDateKey;
};

const isOnOrAfterDateKey = (dateValue, referenceDateKey) => {
  const dateKey = toLocalIsoDate(dateValue);
  return !!dateKey && dateKey >= referenceDateKey;
};

const getTaskName = (task) =>
  task?.kraName || task?.taskName || task?.task || task?.title || "task";

const getTaskIdentity = (task) =>
  [getTaskName(task), task?.assignedDate || "", task?.dueDate || ""]
    .map((value) => String(value).trim().toLowerCase())
    .join("|");

const uniqueTasksByIdentity = (tasks) =>
  Array.from(
    tasks
      .reduce((uniqueTasks, task) => {
        const taskIdentity = getTaskIdentity(task);
        if (!uniqueTasks.has(taskIdentity)) uniqueTasks.set(taskIdentity, task);
        return uniqueTasks;
      }, new Map())
      .values(),
  );

const formatDateOnly = (value) => {
  const parsed = toDate(value);
  if (!parsed) return value || "-";
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}-${month}-${year}`;
};

const HrDepartmentKRA = () => {
  const location = useLocation();

  const { department: departmentParam } = useParams();

  const { department: departmentFromState, tasks } = location.state || {};

  const department = departmentFromState || departmentParam;
  const axios = useAxiosPrivate();

  const [selectedDate, setSelectedDate] = useState(() =>
     parseSelectedDate(location.state?.selectedDate),
  );

  const selectedDateKey = formatDateKey(selectedDate);
  const todayDateKey = formatDateKey(new Date());
  const isFutureSelectedDate = selectedDateKey > todayDateKey;

  const selectedDateLabel = selectedDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const { data: fetchedDepartments = [] } = useQuery({
    queryKey: ["hrKraDepartments"],
    queryFn: async () => {
      const response = await axios.get("/api/performance/get-depts-tasks");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const departmentId = useMemo(() => {
    const matched = fetchedDepartments.find(
            (item) => item?.department?.name === department,
    );
    return matched?.department?._id || null;
  }, [fetchedDepartments, department]);

  const { data: fetchedDepartmentTasks = [] } = useQuery({
    queryKey: ["hrDepartmentKraTasks", departmentId],
    enabled: !!departmentId,
    queryFn: async () => {
      const response = await axios.get(
        `/api/performance/get-tasks?dept=${departmentId}&type=KRA`,
      );
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: fetchedCompletedTasks = [] } = useQuery({
    queryKey: ["hrDepartmentKraCompletedTasks", departmentId],
    enabled: !!departmentId,
    queryFn: async () => {
      const response = await axios.get(
        `/api/performance/get-completed-tasks?dept=${departmentId}&type=KRA`,
      );
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const assignedSourceTasks = useMemo(
    () =>
      Array.isArray(fetchedDepartmentTasks) && fetchedDepartmentTasks.length
        ? fetchedDepartmentTasks
        : Array.isArray(tasks)
        ? tasks
          : [],
    [tasks, fetchedDepartmentTasks],
     );

  const dailyTaskSummary = useMemo(() => {
    const completedOnSelectedDate = fetchedCompletedTasks.filter((task) =>
      isSameSelectedDate(task?.completionDate, selectedDateKey),
    );

    const completedAfterSelectedDate = fetchedCompletedTasks.filter(
      (task) =>
        isTaskScheduledOnOrBeforeDate(task, selectedDateKey) &&
        isAfterSelectedDate(task?.completionDate, selectedDateKey),
    );

    const completedBeforeSelectedDate = fetchedCompletedTasks.filter(
      (task) =>
        isTaskScheduledOnOrBeforeDate(task, selectedDateKey) &&
        isBeforeSelectedDate(task?.completionDate, selectedDateKey) &&
        isOnOrAfterDateKey(task?.completionDate, todayDateKey),
    );

    const completedOnSelectedDateKeys = new Set(
      completedOnSelectedDate.map(getTaskIdentity),
    );

    const pendingTasks = uniqueTasksByIdentity([
      ...assignedSourceTasks
        .filter((task) => isTaskScheduledOnOrBeforeDate(task, selectedDateKey))
        .filter(
          (task) => !completedOnSelectedDateKeys.has(getTaskIdentity(task)),
        ),
      ...(isFutureSelectedDate ? completedBeforeSelectedDate : []),
      ...completedAfterSelectedDate,
    ]);

    return {
      completedTasks: completedOnSelectedDate,
      pendingTasks,
      total: pendingTasks.length + completedOnSelectedDate.length,
      completed: completedOnSelectedDate.length,
    };
  }, [assignedSourceTasks, fetchedCompletedTasks, selectedDateKey]);

  const completedTasks = dailyTaskSummary.completed;
  const totalTasks = dailyTaskSummary.total;
  const pending = dailyTaskSummary.pendingTasks.length;
  const completedTableData = dailyTaskSummary.completedTasks;
  const completionPercent = totalTasks
    ? +((completedTasks / totalTasks) * 100).toFixed(1)
    : 0;

  const graphData = [
    {
      name: "Completed KRA",
      data: [
        {
          x: department || "Department",
          y: totalTasks ? completionPercent : 0,
          raw: completedTasks,
        },
      ],
    },
    {
      name: "Pending KRA",
      data: [
        {
          x: department || "Department",
          y: totalTasks ? +((pending / totalTasks) * 100).toFixed(1) : 0,
          raw: pending,
        },
      ],
    },
  ];

  const graphOptions = {
    chart: {
      type: "bar",
      stacked: true,
      fontFamily: "Poppins-Regular",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "14%",
        borderRadius: 3,
      },
    },
    xaxis: {
      categories: [department || "Department"],
      labels: {
        style: {
          fontFamily: "Poppins-Regular",
        },
      },
    },
    yaxis: {
      max: 100,
      title: {
        text: "Completion (%)",
        style: {
          fontFamily: "Poppins-Regular",
        },
      },
      labels: {
        formatter: (value) => `${value.toFixed(0)}%`,
        style: {
          fontFamily: "Poppins-Regular",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "top",
      fontFamily: "Poppins-Regular",
    },
    tooltip: {
      custom: ({ dataPointIndex, w }) => {
        const departmentName = w.config.series[0].data[dataPointIndex].x;
        const completedCount = w.config.series[0].data[dataPointIndex].raw;
        const pendingCount = w.config.series[1].data[dataPointIndex].raw;
        const totalCount = completedCount + pendingCount;

        return `
          <div style="padding:8px; font-family: Poppins, sans-serif; font-size: 13px; width: 220px;">
            <strong>${departmentName}</strong>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
            <div style="display: flex; justify-content: space-between;">
              <span>Total KRA</span>
              <span>${totalCount}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Completed KRA</span>
              <span>${completedCount}</span>
            </div>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
            <div style="display: flex; justify-content: space-between;">
              <span>Pending KRA</span>
              <span>${pendingCount}</span>
            </div>
          </div>
        `;
      },
    },
    colors: ["#54C4A7", "#EB5C45"],
  };

  const columns = [
    {
      headerName: "Sr No",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 100,
    },
    {
      headerName: "KRA Name",
      flex: 2,
      valueGetter: (params) =>
        params.data?.kraName ||
        params.data?.taskName ||
        params.data?.task ||
        params.data?.title ||
        "-",
    },
    {
      headerName: "Completed By",
      flex: 1.2,
      valueGetter: (params) =>
        params.data?.completedByName ||
        params.data?.completedBy?.name ||
        params.data?.completedBy?.fullName ||
        params.data?.completedByUser?.name ||
        params.data?.completedBy ||
        "-",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const status = String(params.value || "").trim();
        const statusLower = status.toLowerCase();

        const statusColorMap = {
          pending: { backgroundColor: "#FFECC5", color: "#CC8400" },
          "in-progress": { backgroundColor: "#ADD8E6", color: "#00008B" },
          completed: { backgroundColor: "#90EE90", color: "#006400" },
        };

        const { backgroundColor, color } = statusColorMap[statusLower] || {
          backgroundColor: "#E5E7EB",
          color: "#374151",
        };

        return (
          <Chip label={status || "-"} style={{ backgroundColor, color }} />
        );
      },
    },
    {
      field: "assignedDate",
      headerName: "Assigned Date",
      flex: 1,
      valueGetter: (params) => formatDateOnly(params.data?.assignedDate),
    },
  ];

  const handlePreviousDate = () => {
    setSelectedDate(
      (prevDate) =>
        new Date(
          prevDate.getFullYear(),
          prevDate.getMonth(),
         prevDate.getDate() - 1,
        ),
    );
  };

  const handleNextDate = () => {
    setSelectedDate(
      (prevDate) =>
        new Date(
          prevDate.getFullYear(),
          prevDate.getMonth(),
           prevDate.getDate() + 1,
        ),
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection
        title={`${department} Department KRA Overview - ${selectedDateLabel}`}
        border
        padding
        greenTitle="completed"
          TitleAmountGreen={completedTasks}
        redTitle="pending"
        TitleAmountRed={pending}
      >
        <NormalBarGraph
          data={graphData}
          options={graphOptions}
          year={false}
          height={320}
        />

        <div className="flex justify-center items-center">
          <div className="flex items-center pb-4">
            <SecondaryButton
              title={<MdNavigateBefore />}
              handleSubmit={handlePreviousDate}
            />

            <div className="text-sm min-w-[130px] text-center">
              {selectedDateLabel}
            </div>

            <SecondaryButton
              title={<MdNavigateNext />}
              handleSubmit={handleNextDate}
            />
          </div>
        </div>
      </WidgetSection>

      <WidgetSection
        title="Department Completed KRA Details"
        border
        TitleAmount={`${selectedDateLabel} : ${totalTasks} KRA`}
      >
        <AgTable
          columns={columns}
          data={completedTableData}
          tableHeight={300}
          // hideFilter
          search={true}
          exportData
        />
      </WidgetSection>
    </div>
  );
};

export default HrDepartmentKRA;
