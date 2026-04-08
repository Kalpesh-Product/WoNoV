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

const PerformanceDepartmentWiseKra = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const clickedMonth = location.state?.month;
  const [selectedMonth, setSelectedMonth] = useState(
    clickedMonth || fiscalMonths[0],
  );

  const userDepartmentIds = useMemo(
    () =>
      auth?.user?.departments
        ?.map((dept) => dept?._id?.toString())
        .filter(Boolean) || [],
    [auth?.user?.departments],
  );
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const isEmployeeLevel =
    !userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KRA.value) &&
    !userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KPA.value);

  const { isTop } = useTopDepartment({
    additionalTopUserIds: ["67b83885daad0f7bab2f1888"],
  });

  const { data: fetchedDepartments = [] } = useQuery({
    queryKey: ["fetchedDepartmentsKra", selectedMonth],
    queryFn: async () => {
      const response = await axios.get("/api/performance/get-depts-tasks", {
        params: { month: selectedMonth },
      });
      return response.data || [];
    },
  });

  const visibleDepartments = useMemo(() => {
    return fetchedDepartments.filter((item) => {
      if (isTop) return true;
      return userDepartmentIds.includes(item?.department?._id?.toString());
    });
  }, [fetchedDepartments, isTop, userDepartmentIds]);

  const { data: completedKraByDepartment = {} } = useQuery({
    queryKey: [
      "departmentWiseCompletedKra",
      selectedMonth,
      visibleDepartments.map((item) => item?.department?._id).filter(Boolean),
    ],
    enabled: visibleDepartments.length > 0,
    queryFn: async () => {
      const completedByDeptEntries = await Promise.all(
        visibleDepartments.map(async (item) => {
          const departmentId = item?.department?._id;

          const [kraRes, teamKraRes, individualKraRes] = await Promise.all([
            axios.get("/api/performance/get-completed-tasks", {
              params: { dept: departmentId, type: "KRA" },
            }),
            axios.get("/api/performance/get-completed-tasks", {
              params: { dept: departmentId, type: "TEAMKRA" },
            }),
            axios.get("/api/performance/get-completed-tasks", {
              params: { dept: departmentId, type: "INDIVIDUALKRA" },
            }),
          ]);

          const allCompleted = [
            ...(kraRes.data || []),
            ...(teamKraRes.data || []),
            ...(individualKraRes.data || []),
          ];

          const completedCount = allCompleted.filter((task) => {
            const assignedDate = new Date(task?.assignedDate);
            if (Number.isNaN(assignedDate.getTime())) return false;
            const taskFiscalMonth = fiscalMonths[(assignedDate.getMonth() + 9) % 12];
            return taskFiscalMonth.toLowerCase() === selectedMonth.toLowerCase();
          }).length;

          return [item?.department?.name, completedCount];
        }),
      );

      return Object.fromEntries(completedByDeptEntries);
    },
  });

  const currentMonthIndex = fiscalMonths.findIndex(
    (month) => month.toLowerCase() === selectedMonth.toLowerCase(),
  );

  const getDepartmentKraTotal = (departmentData) =>
    (departmentData?.dailyKRA || 0) +
    (departmentData?.individualDailyKRA || 0) +
    (departmentData?.teamDailyKRA || 0);

  const pendingKraByDepartment = useMemo(
    () =>
      visibleDepartments.reduce((acc, item) => {
        const assignedCount = getDepartmentKraTotal(item);
        const completedCount =
          completedKraByDepartment[item.department?.name] || 0;
        acc[item.department?.name] = Math.max(
          assignedCount - completedCount,
          0,
        );
        return acc;
      }, {}),
    [completedKraByDepartment, visibleDepartments],
  );

  const totalCompletedKra = Object.values(completedKraByDepartment).reduce(
    (sum, count) => sum + count,
    0,
  );
  const totalPendingKra = Object.values(pendingKraByDepartment).reduce(
    (sum, count) => sum + count,
    0,
  );

  const graphData = [
    {
      name: "Completed KRA",
      group: `KRA - ${selectedMonth}`,
      data: visibleDepartments.map((item) => ({
        x: item.department?.name,
        y: completedKraByDepartment[item.department?.name] || 0,
      })),
    },
    {
      name: "Pending KRA",
      group: `KRA - ${selectedMonth}`,
      data: visibleDepartments.map((item) => ({
        x: item.department?.name,
        y: pendingKraByDepartment[item.department?.name] || 0,
      })),
    },
  ];

  const openMemberWisePage = (departmentName, departmentId) => {
    dispatch(setSelectedDepartment(departmentId));
    dispatch(setSelectedDepartmentName(departmentName));
    navigate(
      `/app/performance/overall-department-kra/member-wise-kra-kpa/${departmentName}`,
      { state: { month: selectedMonth } },
    );
  };

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
            openMemberWisePage(
              departmentData.department?.name,
              departmentData.department?._id,
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
                        <div style="display:flex; justify-content:space-between;"><span>Total KRA :</span><span>${total}</span></div>
                        <div style="display:flex; justify-content:space-between;"><span>Completed KRA :</span><span>${completed}</span></div>
                        <hr style="margin:6px 0; border-top:1px solid #ddd;" />
                        <div style="display:flex; justify-content:space-between;"><span>Pending KRA :</span><span>${pending}</span></div>
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
            openMemberWisePage(params.value, params.data.mongoId);
          }}
          className="text-primary font-pregular hover:underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },
    {
      headerName: "Department Daily KRA",
      field: "dailyKra",
      hide: isEmployeeLevel,
      width: 300,
    },
    {
      headerName: "Individual Daily KRA",
      field: "individualDailyKra",
      width: 300,
    },
    {
      headerName: "Team Daily KRA",
      field: "teamDailyKra",
      hide: isEmployeeLevel,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection
        title={`KRA overview - ${selectedMonth}`}
        border
        padding
        greenTitle="KRA "
        TitleAmountGreen={totalCompletedKra}
        redTitle="KRA "
        TitleAmountRed={totalPendingKra}
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
            <div className="text-sm min-w-[120px] text-center">{selectedMonth}</div>
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
            tableTitle="DEPARTMENT-WISE PENDING KRA"
            hideFilter
          />
        </WidgetSection>
      </PageFrame>
    </div>
  );
};

export default PerformanceDepartmentWiseKra;