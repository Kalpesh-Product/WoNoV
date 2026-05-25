import React, { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import SecondaryButton from "../../../../components/SecondaryButton";

const formatDateKey = (date) => date.toISOString().slice(0, 10);

const toDate = (value) => {
  const [d, m, y] = (value || "").split("-").map(Number);

  if (!d || !m || !y) return null;

  const parsed = new Date(y, m - 1, d);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const HrDepartmentKRA = () => {
  const location = useLocation();

  const { department: departmentParam } = useParams();

  const { department: departmentFromState, tasks } = location.state || {};

  const department = departmentFromState || departmentParam;

  const tasksRawData = useSelector((state) => state.hr.tasksRawData);

  const [selectedDate, setSelectedDate] = useState(() =>
    location.state?.selectedDate
      ? new Date(location.state.selectedDate)
      : new Date()
  );

  const selectedDateKey = formatDateKey(selectedDate);

  const selectedDateLabel = selectedDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const sourceTasks = useMemo(() => {
    return (
      tasksRawData.find((data) => data.department === department)?.tasks ||
      tasks ||
      []
    );
  }, [tasksRawData, department, tasks]);

  const filteredTasks = useMemo(() => {
    return sourceTasks.filter((task) => {
      const taskDate = toDate(task.assignedDate);

      return taskDate && formatDateKey(taskDate) === selectedDateKey;
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