import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import SecondaryButton from "../../../../components/SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

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

const toLocalIsoDate = (value) => {
  const date = toDate(value);
  if (!date) return null;
  return formatDateKey(date);
};

const isTaskScheduledOnOrBeforeDate = (task, selectedDateKey) => {
  const taskDateKey = toLocalIsoDate(task?.assignedDate || task?.dueDate || task?.createdAt);
  return !!taskDateKey && taskDateKey <= selectedDateKey;
};

const isSameSelectedDate = (dateValue, selectedDateKey) =>
  toLocalIsoDate(dateValue) === selectedDateKey;

const HrKRA = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  const [selectedDate, setSelectedDate] = useState(new Date());

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

  const departmentList = useMemo(
    () =>
      fetchedDepartments
        .map((item) => ({
          departmentId: item?.department?._id,
          departmentName: item?.department?.name,
        }))
        .filter((item) => item.departmentId && item.departmentName),
    [fetchedDepartments],
  );

  const { data: departmentWiseData = [] } = useQuery({
    queryKey: ["hrDepartmentKraStats", selectedDateKey, departmentList.map((d) => d.departmentId).join(",")],
    enabled: departmentList.length > 0,
    queryFn: async () => {
      const stats = await Promise.all(
        departmentList.map(async ({ departmentId, departmentName }) => {
          const settled = await Promise.allSettled([
            axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=KRA`),
            axios.get(`/api/performance/get-completed-tasks?dept=${departmentId}&type=KRA`),
          ]);

          const assignedTasks =
            settled[0]?.status === "fulfilled" ? settled[0].value?.data || [] : [];
          const completedTasks =
            settled[1]?.status === "fulfilled" ? settled[1].value?.data || [] : [];

          const dailyTasks = assignedTasks.filter((task) =>
            isTaskScheduledOnOrBeforeDate(task, selectedDateKey),
          );

          const completedOnSelectedDate = completedTasks.filter((task) =>
            isSameSelectedDate(task?.completionDate, selectedDateKey),
          ).length;

          return {
            departmentId,
            departmentName,
            tasks: dailyTasks,
            totalTasks: dailyTasks.length,
            achievedTasks: completedOnSelectedDate,
          };
        }),
      );

      return stats.filter(Boolean);
    },
  });

  const allDepartments = departmentWiseData.map((item) => item.departmentName);

  const groupedTasks = useMemo(
    () =>
      departmentWiseData.reduce((acc, item) => {
        acc[item.departmentName] = item.tasks || [];
        return acc;
      }, {}),
    [departmentWiseData],
  );

  const tableData = departmentWiseData.map((item) => {
    const achievedPercent = item.totalTasks
      ? ((item.achievedTasks / item.totalTasks) * 100).toFixed(0)
      : 0;

    const shortFall = item.totalTasks
      ? (((item.totalTasks - item.achievedTasks) / item.totalTasks) * 100).toFixed(0)
      : 0;

    return {
      department: item.departmentName,
      totalTasks: item.totalTasks,
      achievedTasks: item.achievedTasks,
      achievedPercent: `${achievedPercent}%`,
      shortFall: `${shortFall}%`,
    };
  });

  const totalTasks = tableData.reduce((sum, item) => sum + item.totalTasks, 0);
  const completedTasks = tableData.reduce((sum, item) => sum + item.achievedTasks, 0);
  const pendingTasks = Math.max(totalTasks - completedTasks, 0);

  const graphData = ["Completed", "Pending"].map((type) => ({
    name: `${type} KRA`,
    group: `KRA - ${selectedDateLabel}`,
    data: allDepartments.map((department) => {
      const tableItem = tableData.find((item) => item.department === department);
      const completed = tableItem?.achievedTasks || 0;
      const total = tableItem?.totalTasks || 0;
      const pending = Math.max(total - completed, 0);

      const raw = type === "Completed" ? completed : pending;

      const y = total ? +((raw / total) * 100).toFixed(1) : 0;

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
      animations: {
        enabled: false,
      },
      stacked: true,
      toolbar: {
        show: false,
      },
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          const clickedDept =
            config.w.config.series[config.seriesIndex].data[config.dataPointIndex].x;
          const departmentTasks = groupedTasks[clickedDept] || [];
          navigate(`${clickedDept}`, {
            state: {
              department: clickedDept,
              tasks: departmentTasks,
              selectedDate: selectedDateKey,
            },
          });
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "20%",
        borderRadius: 3,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["#fff"],
    },
    xaxis: {
      categories: allDepartments,
      title: {
        text: "Departments",
      },
    },
    yaxis: {
      max: 100,
      title: {
        text: "Completion (%)",
      },
      labels: {
        formatter: (value) => `${value.toFixed(0)}%`,
      },
    },
    legend: {
      position: "top",
    },
    tooltip: {
      custom: ({ dataPointIndex, w }) => {
        const departmentName = w.config.series[0].data[dataPointIndex].x;
        const completed = w.config.series[0].data[dataPointIndex].raw;
        const pending = w.config.series[1].data[dataPointIndex].raw;
        const total = completed + pending;

        return `
          <div style="padding:8px; font-family: Poppins, sans-serif; font-size: 13px; width: 220px;">
            <strong>${departmentName}</strong>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
            <div style="display: flex; justify-content: space-between;"><span>Total KRA</span><span>${total}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Completed KRA</span><span>${completed}</span></div>
            <hr style="margin: 6px 0; border-top: 1px solid #ddd"/>
            <div style="display: flex; justify-content: space-between;"><span>Pending KRA</span><span>${pending}</span></div>
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
        title={`KRA overview - ${selectedDateLabel}`}
        border
        padding
        greenTitle={"completed"}
        TitleAmountGreen={completedTasks}
        redTitle={"pending"}
        TitleAmountRed={pendingTasks}
      >
        <NormalBarGraph data={graphData} options={graphOptions} year={false} height={400} />

        <div className="flex justify-center items-center">
          <div className="flex items-center pb-4">
            <SecondaryButton title={<MdNavigateBefore />} handleSubmit={handlePreviousDate} />

            <div className="text-sm min-w-[180px] text-center">{selectedDateLabel}</div>

            <SecondaryButton title={<MdNavigateNext />} handleSubmit={handleNextDate} />
          </div>
        </div>
      </WidgetSection>

      <WidgetSection
        title="Department-wise KRA overview"
        border
        TitleAmount={`TOTAL TASKS : ${totalTasks}`}
      >
        <AgTable columns={tasksColumns} data={tableData} tableHeight={300} search={true} exportData />
      </WidgetSection>
    </div>
  );
};

export default HrKRA;
