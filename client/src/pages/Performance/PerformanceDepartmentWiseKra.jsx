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
import { useEffect, useMemo, useState } from "react";
import { PERMISSIONS } from "../../constants/permissions";

const toLocalIsoDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatReadableDate = (dateValue) =>
  new Date(dateValue).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const parseIsoDate = (isoDateValue) => {
  if (!isoDateValue) return null;
  const [year, month, day] = isoDateValue.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0);
};

const PerformanceDepartmentWiseKra = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
   const clickedDate = location.state?.date;
  const [selectedDate, setSelectedDate] = useState(
    clickedDate || toLocalIsoDate(new Date()),
  );
  const [, setTodayDate] = useState(toLocalIsoDate(new Date()));

  useEffect(() => {
    const updateToday = () => {
      const currentDate = toLocalIsoDate(new Date());
      setTodayDate((previousToday) => {
        if (previousToday !== currentDate && selectedDate === previousToday) {
          setSelectedDate(currentDate);
        }
        return currentDate;
      });
    };

    updateToday();
    const intervalId = setInterval(updateToday, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [selectedDate]);


  const userDepartmentIds = useMemo(
    () =>
      auth?.user?.departments
        ?.map((dept) => dept?._id?.toString())
        .filter(Boolean) || [],
    [auth?.user?.departments],
  );
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
    queryKey: ["fetchedDepartmentsKra"],
    queryFn: async () => {
      const response = await axios.get("/api/performance/get-depts-tasks");
      return response.data || [];
    },
  });

  const visibleDepartments = useMemo(() => {
    return fetchedDepartments.filter((item) => {
      if (isTop) return true;
      return userDepartmentIds.includes(item?.department?._id?.toString());
    });
  }, [fetchedDepartments, isTop, userDepartmentIds]);

  const visibleDepartmentIds = visibleDepartments
    .map((item) => item?.department?._id?.toString())
    .filter(Boolean)
    .sort();

  const isSameSelectedDate = (dateValue) =>
    toLocalIsoDate(dateValue) === selectedDate;

  const { data: departmentWiseKraStats = [] } = useQuery({
    queryKey: ["departmentWiseKraStats", selectedDate, visibleDepartmentIds],
    enabled: visibleDepartmentIds.length > 0,
    queryFn: async () => {
      const departmentStats = await Promise.all(
        visibleDepartments.map(async (item) => {
          const departmentId = item?.department?._id;
          const departmentName = item?.department?.name;
          if (!departmentId || !departmentName) return null;

          const settledResponses = await Promise.allSettled([
            axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=KRA`),
            axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=INDIVIDUALKRA`),
            axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=TEAMKRA`),
            axios.get(`/api/performance/get-completed-tasks?dept=${departmentId}&type=KRA`),
            axios.get(
              `/api/performance/get-completed-tasks?dept=${departmentId}&type=INDIVIDUALKRA`,
            ),
            axios.get(`/api/performance/get-completed-tasks?dept=${departmentId}&type=TEAMKRA`),
          ]);

          const getResponseData = (response) =>
            response?.status === "fulfilled" ? response.value?.data || [] : [];

          const departmentTasks = getResponseData(settledResponses[0]);
          const individualTasks = getResponseData(settledResponses[1]);
          const teamTasks = getResponseData(settledResponses[2]);
          const allAssignedTasks = [...departmentTasks, ...individualTasks, ...teamTasks];
          const allCompletedTasks = [
            ...getResponseData(settledResponses[3]),
            ...getResponseData(settledResponses[4]),
            ...getResponseData(settledResponses[5]),
          ];

         return {
  departmentId,
  departmentName,

  // Only Department Daily KRA
  dailyKra: departmentTasks.filter((task) =>
    isSameSelectedDate(task?.assignedDate),
  ).length,

  // Keep these if needed for table
  individualDailyKra: individualTasks.filter((task) =>
    isSameSelectedDate(task?.assignedDate),
  ).length,

  teamDailyKra: teamTasks.filter((task) =>
    isSameSelectedDate(task?.assignedDate),
  ).length,

  // ✅ ONLY Department Pending
  pendingKra: departmentTasks.filter(
    (task) =>
      isSameSelectedDate(task?.assignedDate) &&
      task?.status !== "Completed",
  ).length,

  // ✅ ONLY Department Completed
  completedKra: getResponseData(settledResponses[3]).filter((task) =>
    isSameSelectedDate(task?.completionDate),
  ).length,
};
        }),
      );

      return departmentStats.filter(Boolean);
    },
  });

  const completedKraByDepartment = useMemo(
    () =>
      departmentWiseKraStats.reduce((acc, item) => {
        acc[item.departmentName] = item.completedKra || 0;
        return acc;
      }, {}),
    [departmentWiseKraStats],
  );

  // const getDepartmentKraTotal = (departmentData) =>
  //   (departmentData?.dailyKRA || 0) +
  //   (departmentData?.individualDailyKRA || 0) +
  //   (departmentData?.teamDailyKRA || 0);

   const pendingKraByDepartment = useMemo(
    () =>
      departmentWiseKraStats.reduce((acc, item) => {
        acc[item.departmentName] = item.pendingKra || 0;
        return acc;
      }, {}),
    [departmentWiseKraStats],
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
      group: `KRA - ${selectedDate}`,
      data: departmentWiseKraStats.map((item) => ({
        x: item.departmentName,
        y: completedKraByDepartment[item.departmentName] || 0,
      })),
    },
    {
      name: "Pending KRA",
      group: `KRA - ${selectedDate}`,
      data: departmentWiseKraStats.map((item) => ({
        x: item.departmentName,
        y: pendingKraByDepartment[item.departmentName] || 0,
      })),
    },
  ];

  const openMemberWisePage = (departmentName, departmentId) => {
    dispatch(setSelectedDepartment(departmentId));
    dispatch(setSelectedDepartmentName(departmentName));
    navigate(
      `/app/performance/overall-department-kra/member-wise-kra-kpa/${departmentName}`,
      { state: { date: selectedDate } },
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
       categories: departmentWiseKraStats.map((item) => item.departmentName),
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
      //hide: isEmployeeLevel,
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
     // hide: isEmployeeLevel,
    },
  ];
const visibleDepartmentColumns = departmentColumns.filter((column) => {
    if (!isEmployeeLevel) return true;
    return column.field !== "teamDailyKra";
  });
  return (
    <div className="flex flex-col gap-4">
      <WidgetSection
        title={`KRA overview - ${formatReadableDate(selectedDate)}`}
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
              const previousDate = parseIsoDate(selectedDate);
                if (!previousDate) return;
                previousDate.setDate(previousDate.getDate() - 1);
                setSelectedDate(toLocalIsoDate(previousDate));
              }}
            />
              <div className="text-sm min-w-[160px] text-center">
              {formatReadableDate(selectedDate)}
            </div>
            <SecondaryButton
              title={<MdNavigateNext />}
              disabled={false}
              handleSubmit={() => {
                const nextDate = parseIsoDate(selectedDate);
                if (!nextDate) return;
                nextDate.setDate(nextDate.getDate() + 1);
                setSelectedDate(toLocalIsoDate(nextDate));
              }}
            />
          </div>
        </div>
      </WidgetSection>
      <PageFrame>
        <WidgetSection layout={1} padding>
          <AgTable
           data={departmentWiseKraStats.map((item, index) => ({
              srNo: index + 1,
              mongoId: item.departmentId,
              department: item.departmentName,
              dailyKra: item.dailyKra,
              individualDailyKra: item.individualDailyKra,
              //  individualDailyKra:
              //   (item.individualDailyKra || 0) + (item.teamDailyKra || 0),
              teamDailyKra: item.teamDailyKra,
            }))}
            columns={visibleDepartmentColumns}
            tableTitle={`DEPARTMENT-WISE PENDING KRA - ${formatReadableDate(selectedDate)}`}
            hideFilter
          />
           
           
        </WidgetSection>
      </PageFrame>
    </div>
  );
};

export default PerformanceDepartmentWiseKra;