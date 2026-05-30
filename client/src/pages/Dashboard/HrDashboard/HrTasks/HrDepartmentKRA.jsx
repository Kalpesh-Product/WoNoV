import React, { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";

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
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? new Date() : value;
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

const HrDepartmentKRA = () => {
  const location = useLocation();

  const { department: departmentParam } = useParams();

  const { department: departmentFromState, tasks } = location.state || {};

  const department = departmentFromState || departmentParam;
  const axios = useAxiosPrivate();

  const [selectedDate, setSelectedDate] = useState(() =>
    parseSelectedDate(location.state?.selectedDate)
  );

  const selectedDateKey = formatDateKey(selectedDate);

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
      (item) => item?.department?.name === department
    );
    return matched?.department?._id || null;
  }, [fetchedDepartments, department]);

  const { data: fetchedDepartmentTasks = [] } = useQuery({
    queryKey: ["hrDepartmentKraTasks", departmentId],
    enabled: !!departmentId,
    queryFn: async () => {
      const response = await axios.get(
        `/api/performance/get-tasks?dept=${departmentId}&type=KRA`
      );
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const sourceTasks = useMemo(() => {
    if (Array.isArray(tasks) && tasks.length) return tasks;
    return fetchedDepartmentTasks;
  }, [tasks, fetchedDepartmentTasks]);

  const filteredTasks = useMemo(() => {
    return sourceTasks.filter((task) => {
      const taskDate = toDate(task.assignedDate || task.dueDate || task.createdAt);
      return taskDate && formatDateKey(taskDate) <= selectedDateKey;
    });
  }, [sourceTasks, selectedDateKey]);

  const completed = filteredTasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const remaining = filteredTasks.length - completed;

  const graphData = [
    {
      name: "Completed KRA",
      data: [
        {
          x: department || "Department",
          y: filteredTasks.length
            ? +((completed / filteredTasks.length) * 100).toFixed(1)
            : 0,
          raw: completed,
        },
      ],
    },
    {
      name: "Remaining KRA",
      data: [
        {
          x: department || "Department",
          y: filteredTasks.length
            ? +((remaining / filteredTasks.length) * 100).toFixed(1)
            : 0,
          raw: remaining,
        },
      ],
    },
  ];

  const graphOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: [department || "Department"],
    },
    yaxis: {
      max: 100,
    },
    dataLabels: {
      enabled: false,
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
      field: "task",
      headerName: "Task",
      flex: 2,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
    },
    {
      field: "assignedDate",
      headerName: "Assigned Date",
      flex: 1,
    },
  ];

  const handlePreviousDate = () => {
    setSelectedDate(
      (prevDate) =>
        new Date(
          prevDate.getFullYear(),
          prevDate.getMonth(),
          prevDate.getDate() - 1
        )
    );
  };

  const handleNextDate = () => {
    setSelectedDate(
      (prevDate) =>
        new Date(
          prevDate.getFullYear(),
          prevDate.getMonth(),
          prevDate.getDate() + 1
        )
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection
        title={`${department} Department KRA Overview - ${selectedDateLabel}`}
        border
        padding
        greenTitle="completed"
        TitleAmountGreen={completed}
        redTitle="remaining"
        TitleAmountRed={remaining}
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

            <div className="text-sm min-w-[180px] text-center">
              {selectedDateLabel}
            </div>

            <SecondaryButton
              title={<MdNavigateNext />}
              handleSubmit={handleNextDate}
            />
          </div>
        </div>
      </WidgetSection>

      <WidgetSection title="KRA Details" border>
        <AgTable
          columns={columns}
          data={filteredTasks}
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
