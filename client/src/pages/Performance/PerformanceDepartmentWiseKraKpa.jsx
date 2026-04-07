import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AgTable from "../../components/AgTable";
import PageFrame from "../../components/Pages/PageFrame";
import WidgetSection from "../../components/WidgetSection";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useTopDepartment } from "../../hooks/useTopDepartment";
import {
  setSelectedDepartment,
  setSelectedDepartmentName,
} from "../../redux/slices/performanceSlice";
import NormalBarGraph from "../../components/graphs/NormalBarGraph";
import SecondaryButton from "../../components/SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { useMemo, useState } from "react";
import { PERMISSIONS } from "../../constants/permissions";

const fiscalMonths = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

const PerformanceDepartmentWiseKraKpa = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const clickedMonth = location.state?.month;
  const [selectedMonth, setSelectedMonth] = useState(
    clickedMonth || fiscalMonths[0],
  );
  const userDepartmentIds =
    auth?.user?.departments
      ?.map((dept) => dept?._id?.toString())
      .filter(Boolean) || [];
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const isEmployeeLevel =
    !userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KRA.value) &&
    !userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KPA.value);

  const { isTop } = useTopDepartment({
    additionalTopUserIds: ["67b83885daad0f7bab2f1888"],
  });

  const { data: fetchedDepartments = [] } = useQuery({
    queryKey: ["fetchedDepartments", selectedMonth],
    queryFn: async () => {
      const response = await axios.get("/api/performance/get-depts-tasks", {
        params: { month: selectedMonth },
      });
      return response.data || [];
    },
  });

  const { data: kpaTasksRaw = [] } = useQuery({
    queryKey: ["departmentWiseKpaTasks"],
    queryFn: async () => {
      const response = await axios.get("/api/performance/get-kpa-tasks");
      return response.data || [];
    },
  });

  const currentMonthIndex = fiscalMonths.findIndex(
    (month) => month.toLowerCase() === selectedMonth.toLowerCase(),
  );

  // const getDepartmentKraTotal = (departmentData) =>
  //     (departmentData?.dailyKRA || 0) +
  //     (departmentData?.individualDailyKRA || 0) +
  //     (departmentData?.teamDailyKRA || 0);

  const getDepartmentKpaTotal = (departmentData) =>
    (departmentData?.monthlyKPA || 0) +
    (departmentData?.individualMonthlyKPA || 0) +
    (departmentData?.teamMonthlyKPA || 0);

  const visibleDepartments = fetchedDepartments.filter((item) => {
    if (isTop) return true;
    return userDepartmentIds.includes(item?.department?._id?.toString());
  });

  const completedKpaByDepartment = useMemo(() => {
    const completedMap = {};
    const visibleDepartmentNames = new Set(
      visibleDepartments.map((item) => item?.department?.name).filter(Boolean),
    );

    kpaTasksRaw.forEach((departmentTasks) => {
      if (!visibleDepartmentNames.has(departmentTasks?.department)) return;

      const completedCount = (departmentTasks?.tasks || []).filter((task) => {
        const assignedDate = new Date(task?.assignedDate);
        if (Number.isNaN(assignedDate.getTime())) return false;

        const taskFiscalMonth =
          fiscalMonths[(assignedDate.getMonth() + 9) % 12];
        return (
          taskFiscalMonth.toLowerCase() === selectedMonth.toLowerCase() &&
          task.status === "Completed"
        );
      }).length;

      completedMap[departmentTasks.department] = completedCount;
    });

    return completedMap;
  }, [kpaTasksRaw, selectedMonth, visibleDepartments]);

  const pendingKpaByDepartment = useMemo(
    () =>
      visibleDepartments.reduce((acc, item) => {
        const assignedCount = getDepartmentKpaTotal(item);
        const completedCount =
          completedKpaByDepartment[item.department?.name] || 0;
        acc[item.department?.name] = Math.max(
          assignedCount - completedCount,
          0,
        );
        return acc;
      }, {}),
    [completedKpaByDepartment, visibleDepartments],
  );

  const totalCompletedKpa = Object.values(completedKpaByDepartment).reduce(
    (sum, count) => sum + count,
    0,
  );
  const totalPendingKpa = Object.values(pendingKpaByDepartment).reduce(
    (sum, count) => sum + count,
    0,
  );

  const graphData = [
    {
      name: "Completed KPA",
      group: `KPA - ${selectedMonth}`,
      data: visibleDepartments.map((item) => ({
        x: item.department?.name,
        y: completedKpaByDepartment[item.department?.name] || 0,
      })),
    },
    {
      name: "Pending KPA",
      group: `KPA - ${selectedMonth}`,
      data: visibleDepartments.map((item) => ({
        x: item.department?.name,
        y: pendingKpaByDepartment[item.department?.name] || 0,
      })),
    },
  ];

  const graphOptions = {
    chart: {
      type: "bar",
      stacked: true,
      animations: { enabled: false },
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const clickedDepartment =
            config.w.config.series[config.seriesIndex].data[
              config.dataPointIndex
            ].x;
          const departmentData = visibleDepartments.find(
            (item) => item.department?.name === clickedDepartment,
          );
          if (departmentData) {
            dispatch(setSelectedDepartment(departmentData.department?._id));
            dispatch(
              setSelectedDepartmentName(departmentData.department?.name),
            );
            navigate(
              `/app/performance/overall-KPA/department-wise-KPA/member-wise-kra-kpa/${departmentData.department?.name}`,
              { state: { month: selectedMonth } },
            );
          }
        },
      },
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "20%", borderRadius: 3 },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ["#fff"] },
    xaxis: {
      title: { text: "Departments" },
      categories: visibleDepartments.map((item) => item.department?.name),
    },
    yaxis: {
      title: { text: "Completion (%)" },
      labels: { formatter: (value) => `${value.toFixed(0)}%` },
      max: 20,
    },
    colors: ["#54C4A7", "#EB5C45"],
    fill: { opacity: 1 },
    legend: { position: "top" },
    
  };

  const departmentColumns = [
    { headerName: "Sr No", field: "srNo", width: 200 },
    {
      headerName: "Department",
      field: "department",
      flex: 1,
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() => {
            dispatch(setSelectedDepartment(params.data.mongoId));
            dispatch(setSelectedDepartmentName(params.data.department));
            navigate(
              `/app/performance/overall-KPA/department-wise-KPA/member-wise-kra-kpa/${params.value}`,
              { state: { month: selectedMonth } },
            );
          }}
          className="text-primary font-pregular hover:underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },
    // { headerName: "Daily KRA", field: "dailyKra" },
    {
      headerName: "Monthly KPA",
      field: "monthlyKpa",
      hide: isEmployeeLevel,
      width: 300,
    },
    // { headerName: "Individual Daily KRA", field: "individualDailyKra" },
    {
      headerName: "Individual Monthly KPA",
      field: "individualMonthlyKpa",
      width: 300,
    },
    // { headerName: "Team Daily KRA", field: "teamDailyKra", hide: isEmployeeLevel },
    {
      headerName: "Team Monthly KPA",
      field: "teamMonthlyKpa",
      hide: isEmployeeLevel,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection
        title={`KPA overview - ${selectedMonth}`}
        border
        padding
        greenTitle="KPA "
        TitleAmountGreen={totalCompletedKpa}
        redTitle="KPA "
        TitleAmountRed={totalPendingKpa}
      >
        <NormalBarGraph
          data={graphData}
          options={graphOptions}
          year={false}
          height={400}
        />

        <div className="flex justify-center items-center pb-4">
          <div className="flex items-center">
            <SecondaryButton
              title={<MdNavigateBefore />}
              disabled={false}
              handleSubmit={() => {
                const prevIndex =
                  currentMonthIndex === 0
                    ? fiscalMonths.length - 1
                    : currentMonthIndex - 1;
                setSelectedMonth(fiscalMonths[prevIndex]);
              }}
            />
            <div className="text-sm min-w-[120px] text-center">
              {selectedMonth}
            </div>
            <SecondaryButton
              title={<MdNavigateNext />}
              disabled={false}
              handleSubmit={() => {
                const nextIndex =
                  currentMonthIndex === fiscalMonths.length - 1
                    ? 0
                    : currentMonthIndex + 1;
                setSelectedMonth(fiscalMonths[nextIndex]);
              }}
            />
          </div>
        </div>
      </WidgetSection>
      <PageFrame>
        <WidgetSection layout={1} padding>
          <AgTable
            data={visibleDepartments.map((item, index) => ({
              srNo: index + 1,
              mongoId: item.department?._id,
              department: item.department?.name,
              dailyKra: item.dailyKRA,
              monthlyKpa: item.monthlyKPA,
              individualDailyKra: item.individualDailyKRA,
              individualMonthlyKpa: item.individualMonthlyKPA,
              teamDailyKra: item.teamDailyKRA,
              teamMonthlyKpa: item.teamMonthlyKPA,
              annualKpa: item.annualKPA,
            }))}
            columns={departmentColumns}
            tableTitle="DEPARTMENT-WISE KPA"
            hideFilter
          />
        </WidgetSection>
      </PageFrame>
    </div>
  );
};

export default PerformanceDepartmentWiseKraKpa;
