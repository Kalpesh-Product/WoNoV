import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import SecondaryButton from "../../../../components/SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

const formatDateKey = (date) => date.toISOString().slice(0, 10);

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

const HrKRA = () => {
  const navigate = useNavigate();

  const tasksRawData = useSelector((state) => state.hr.tasksRawData);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedDateKey = formatDateKey(selectedDate);

  const selectedDateLabel = selectedDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const selectedDateLabelUpper = selectedDateLabel.toUpperCase();
  const allDepartments = useMemo(() => {
    return Array.from(
      new Set(tasksRawData.map((data) => data.department).filter(Boolean))
    );
  }, [tasksRawData]);

  const filteredTasks = useMemo(() => {
    return tasksRawData.flatMap((departmentData) =>
      (departmentData.tasks || [])
        .filter((task) => {
          const taskDate = toDate(task.assignedDate);

          return taskDate && formatDateKey(taskDate) === selectedDateKey;
        })
        .map((task) => ({
          ...task,
          department: departmentData.department,
        }))
    );
  }, [tasksRawData, selectedDateKey]);

  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce((acc, task) => {
      if (!acc[task.department]) {
        acc[task.department] = [];
      }

      acc[task.department].push(task);

      return acc;
    }, {});
  }, [filteredTasks]);

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "Completed"
  ).length;
  const remainingTasks = totalTasks - completedTasks;

  const tableData = allDepartments.map((department) => {
    const deptTasks = groupedTasks[department] || [];

    const totalTasks = deptTasks.length;

    const achievedTasks = deptTasks.filter(
      (task) => task.status === "Completed"
    ).length;

    const achievedPercent = totalTasks
      ? ((achievedTasks / totalTasks) * 100).toFixed(0)
      : 0;

    const shortFall = totalTasks
      ? (((totalTasks - achievedTasks) / totalTasks) * 100).toFixed(0)
      : 0;

    return {
      department,
      totalTasks,
      achievedTasks,
      achievedPercent: `${achievedPercent}%`,
      shortFall: `${shortFall}%`,
    };
  });

  const graphData = ["Completed", "Remaining"].map((type) => ({
    name: `${type} KRA`,
    group: `KRA - ${selectedDateLabel}`,
    data: allDepartments.map((department) => {
      const deptTasks = groupedTasks[department] || [];

      const completed = deptTasks.filter(
        (task) => task.status === "Completed"
      ).length;

      const remaining = deptTasks.length - completed;

      const raw = type === "Completed" ? completed : remaining;

      const y = deptTasks.length
        ? +((raw / deptTasks.length) * 100).toFixed(1)
        : 0;

      return {
        x: department,
        y,
        raw,
      };
    }),
  }));

  const graphOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: {
        show: false,
      },
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          const clickedDept =
            config.w.config.series[config.seriesIndex].data[
              config.dataPointIndex
            ].x;

          navigate(`${clickedDept}`, {
            state: {
              department: clickedDept,
              tasks: groupedTasks[clickedDept],
              selectedDate: selectedDateKey,
            },
          });
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: allDepartments,
      title: {
        text: "Departments",
      },
    },
    yaxis: {
      max: 100,
      labels: {
        formatter: (value) => `${value.toFixed(0)}%`,
      },
    },
     legend: { position: "top" },
    tooltip: {
      custom: ({ dataPointIndex, w }) => {
        const departmentName = w.config.series[0].data[dataPointIndex].x;
        const completed = w.config.series[0].data[dataPointIndex].raw;
        const remaining = w.config.series[1].data[dataPointIndex].raw;
        const total = completed + remaining;

        return `
          <div style="padding:8px; font-family: Poppins, sans-serif; font-size: 13px; width: 220px;">
            <strong>${departmentName}</strong>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
            <div style="display: flex; justify-content: space-between;"><span>Total KRA</span><span>${total}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Completed KRA</span><span>${completed}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Remaining KRA</span><span>${remaining}</span></div>
          </div>
        `;
      },
    },
    colors: ["#54C4A7", "#EB5C45"],
  };

  const tasksColumns = [
    {
      headerName: "Sr No",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 100,
    },
    {
      field: "department",
      headerName: "Department",
      flex: 1,
      cellRenderer: (params) => (
        <span
          className="text-primary cursor-pointer"
          onClick={() =>
            navigate(`${params.value}`, {
              state: {
                department: params.value,
                tasks: groupedTasks[params.value],
                selectedDate: selectedDateKey,
              },
            })
          }
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "totalTasks",
      headerName: "Total",
      flex: 1,
    },
    {
      field: "achievedTasks",
      headerName: "Achieved",
      flex: 1,
    },
    {
      field: "achievedPercent",
      headerName: "Achieved (%)",
      flex: 1,
    },
    {
      field: "shortFall",
      headerName: "Shortfall (%)",
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
        title={`KRA overview - ${selectedDateLabel}`}
        border
        padding
        greenTitle={"completed"}
        TitleAmountGreen={completedTasks}
        redTitle={"remaining"}
        TitleAmountRed={remainingTasks}
        
      >
        <NormalBarGraph
          data={graphData}
          options={graphOptions}
          year={false}
          height={400}
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

       {/* <WidgetSection title="Department-wise KRA overview" border> */}
         {/* <WidgetSection
        title="Department-wise KRA overview"
        titleLabel={`TOTAL TASKS : ${totalTasks}`}
        border
      > */}
      <WidgetSection
  title="Department-wise KRA overview"
  border
  TitleAmount={`TOTAL TASKS : ${tableData.reduce(
    (sum, item) => item.totalTasks + sum,
    0
  )}`}
>
        <AgTable
          columns={tasksColumns}
          data={tableData}
          tableHeight={300}
          hideFilter
        />
      </WidgetSection>
    </div>
  );
};

export default HrKRA;