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
  const roleTitles =
    auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
  const isRoleEmployee = roleTitles.some((roleTitle) =>
    roleTitle?.includes("employee"),
  );    
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const isEmployeeLevel =
      isRoleEmployee ||
    (!userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KRA.value) &&
      !userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KPA.value));

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

  const getCalendarMonthFromDate = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("en-US", { month: "long" });
  };

  const isSameSelectedMonth = (dateValue) => {
    const taskMonth = getCalendarMonthFromDate(dateValue);
    return taskMonth?.toLowerCase() === selectedMonth.toLowerCase();
  };

  const currentMonthIndex = fiscalMonths.findIndex(
    (month) => month.toLowerCase() === selectedMonth.toLowerCase(),
  );

  // // const getDepartmentKraTotal = (departmentData) =>
  // //     (departmentData?.dailyKRA || 0) +
  // //     (departmentData?.individualDailyKRA || 0) +
  // //     (departmentData?.teamDailyKRA || 0);

  // const getDepartmentKpaTotal = (departmentData) =>
  //   (departmentData?.monthlyKPA || 0) +
  //   (departmentData?.individualMonthlyKPA || 0) +
  //   (departmentData?.teamMonthlyKPA || 0);

  const visibleDepartments = fetchedDepartments.filter((item) => {
    if (isTop) return true;
    return userDepartmentIds.includes(item?.department?._id?.toString());
  });

  const visibleDepartmentIds = visibleDepartments
    .map((item) => item?.department?._id?.toString())
    .filter(Boolean)
    .sort();

  const { data: departmentWiseDepartmentKpaStats = [] } = useQuery({
    queryKey: [
      "departmentWiseDepartmentKpaStats",
      selectedMonth,
      visibleDepartmentIds,
    ],
    enabled: visibleDepartmentIds.length > 0,
    queryFn: async () => {
      const departmentStats = await Promise.all(
        visibleDepartments.map(async (item) => {
          const departmentId = item?.department?._id;
          const departmentName = item?.department?.name;
          if (!departmentId || !departmentName) return null;

          const [assignedResponse, completedResponse, individualAssignedResponse] =
            await Promise.allSettled([
              axios.get(
                `/api/performance/get-tasks?dept=${departmentId}&type=KPA&duration=Monthly`,
              ),
              axios.get(
                `/api/performance/get-completed-tasks?dept=${departmentId}&type=KPA`,
              ),
              axios.get(
                `/api/performance/get-tasks?dept=${departmentId}&type=INDIVIDUALKPA&duration=Monthly`,
              ),
            ]);

          const assignedTasks =
            assignedResponse?.status === "fulfilled"
              ? assignedResponse.value?.data || []
              : [];
          const completedTasks =
            completedResponse?.status === "fulfilled"
              ? completedResponse.value?.data || []
              : [];
          const individualAssignedTasks =
            individualAssignedResponse?.status === "fulfilled"
              ? individualAssignedResponse.value?.data || []
              : [];

          const monthlyAssignedCount = assignedTasks.filter((task) =>
            isSameSelectedMonth(task?.assignedDate),
          ).length;
          const monthlyCompletedCount = completedTasks.filter((task) =>
            isSameSelectedMonth(task?.completionDate),
          ).length;
          const monthlyPendingCount = assignedTasks.filter(
            (task) =>
              isSameSelectedMonth(task?.assignedDate) &&
              task?.status !== "Completed",
          ).length;
          const individualMonthlyPendingCount = individualAssignedTasks.filter(
            (task) =>
              isSameSelectedMonth(task?.assignedDate) &&
              task?.status !== "Completed",
          ).length;

          return {
            departmentId: departmentId?.toString(),
            departmentName,
            monthlyAssignedCount,
            monthlyCompletedCount,
            monthlyPendingCount,
            individualMonthlyPendingCount,
          };
        }),
      );

      return departmentStats.filter(Boolean);
    },
  });

  const departmentMonthlyStatsById = useMemo(
    () =>
      departmentWiseDepartmentKpaStats.reduce((acc, item) => {
        acc[item.departmentId] = item;
        return acc;
      }, {}),
    [departmentWiseDepartmentKpaStats],
  );

  const completedKpaByDepartment = useMemo(
    () =>
      departmentWiseDepartmentKpaStats.reduce((acc, item) => {
        acc[item.departmentName] = item.monthlyCompletedCount || 0;
        return acc;
      }, {}),
    [departmentWiseDepartmentKpaStats],
  );

  const pendingKpaByDepartment = useMemo(
    () =>
      departmentWiseDepartmentKpaStats.reduce((acc, item) => {
        acc[item.departmentName] = item.monthlyPendingCount || 0;
        return acc;
      }, {}),
    [departmentWiseDepartmentKpaStats],
  );

  const totalKpaByDepartment = useMemo(
    () =>
      departmentWiseDepartmentKpaStats.reduce((acc, item) => {
        acc[item.departmentName] = item.monthlyAssignedCount || 0;
        return acc;
      }, {}),
    [departmentWiseDepartmentKpaStats],
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
      data: departmentWiseDepartmentKpaStats.map((item) => ({
        x: item.departmentName,
        y: completedKpaByDepartment[item.departmentName] || 0,
      })),
    },
    {
      name: "Pending KPA",
      group: `KPA - ${selectedMonth}`,
      data: departmentWiseDepartmentKpaStats.map((item) => ({
        x: item.departmentName,
        y: pendingKpaByDepartment[item.departmentName] || 0,
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
               `/app/performance/overall-department-kpa/member-wise-kra-kpa/${departmentData.department?.name}`,
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
       categories: departmentWiseDepartmentKpaStats.map(
        (item) => item.departmentName,
      ),
    },
   yaxis: {
            title: { text: "Count" },
        },
    colors: ["#54C4A7", "#EB5C45"],
    fill: { opacity: 1 },
    legend: { position: "top" },
    
tooltip: {
            custom: ({ series, dataPointIndex, w }) => {
                const label =
                    w?.config?.series?.[0]?.data?.[dataPointIndex]?.x || "Department";
                const completed = series?.[0]?.[dataPointIndex] ?? 0;
                const pending = series?.[1]?.[dataPointIndex] ?? 0;
                const total = completed + pending;

                return `
                    <div style="padding:8px; font-family:Poppins, sans-serif; font-size:13px; width:220px;">
                        <strong>${label}</strong><br/>
                        <hr style="margin:6px 0; border-top:1px solid #ddd;" />
                        <div style="display:flex; justify-content:space-between;"><span>Total KPA :</span><span>${total}</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Completed KPA :</span><span>${completed}</span></div>
                        <hr style="margin:6px 0; border-top:1px solid #ddd;" />
                        <div style="display:flex; justify-content:space-between;"><span>Pending KPA :</span><span>${pending}</span></div>
                    </div>
                `;
            },
        },


    
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
               `/app/performance/overall-department-kpa/member-wise-kra-kpa/${params.value}`,
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
      headerName: "Department Monthly KPA",
      field: "monthlyKpa",
     // hide: isEmployeeLevel,
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
     // hide: isEmployeeLevel,
    },
  ];
  const visibleDepartmentColumns = departmentColumns.filter((column) => {
    if (!isEmployeeLevel) return true;
    return (
      column.field !== "monthlyKpa" &&
      column.field !== "teamMonthlyKpa"
    );
  });
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
              monthlyKpa:
                departmentMonthlyStatsById[item.department?._id?.toString()]
                  ?.monthlyPendingCount || 0,
              individualMonthlyKpa:
                departmentMonthlyStatsById[item.department?._id?.toString()]
                  ?.individualMonthlyPendingCount || 0,
              
              teamMonthlyKpa: item.teamMonthlyKPA,
              //annualKpa: item.annualKPA,
            }))}
            columns={departmentColumns}
            tableTitle="DEPARTMENT-WISE PENDING KPA"
            hideFilter
          />
        </WidgetSection>
      </PageFrame>
    </div>
  );
};

export default PerformanceDepartmentWiseKraKpa;