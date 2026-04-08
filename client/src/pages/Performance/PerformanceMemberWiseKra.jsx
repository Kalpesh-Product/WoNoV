import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AgTable from "../../components/AgTable";
import PageFrame from "../../components/Pages/PageFrame";
import WidgetSection from "../../components/WidgetSection";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import {
  setSelectedDepartment,
  setSelectedDepartmentName,
} from "../../redux/slices/performanceSlice";
import { PERMISSIONS } from "../../constants/permissions";
import { useTopDepartment } from "../../hooks/useTopDepartment";
import NormalBarGraph from "../../components/graphs/NormalBarGraph";
import SecondaryButton from "../../components/SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

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

const DEFAULT_COUNTS = {
  dailyKra: 0,
  individualDailyKra: 0,
  teamDailyKra: 0,
  completedKra: 0,
  pendingKra: 0,
};

const isTaskInSelectedMonth = (task, selectedMonth) => {
  if (!selectedMonth) return true;

  const taskDate = new Date(task?.assignedDate);
  if (Number.isNaN(taskDate.getTime())) return false;

  const taskMonth = taskDate.toLocaleString("en-US", { month: "long" });
  return taskMonth.toLowerCase() === selectedMonth.toLowerCase();
};

const getFiscalMonthFromDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][date.getMonth()];
};

const PerformanceMemberWiseKra = () => {
  const dispatch = useDispatch();
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const { department } = useParams();
  const { auth } = useAuth();

  const loggedInUserName = [
    auth?.user?.firstName,
    auth?.user?.middleName,
    auth?.user?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const currentDepartmentId = auth.user?.departments?.[0]?._id;
  const currentDepartmentName = auth.user?.departments?.[0]?.name;

  const selectedDepartment = useSelector((state) => state.performance.selectedDepartment);
  const selectedDepartmentName = useSelector(
    (state) => state.performance.selectedDepartmentName,
  );

  const loggedInUserId = auth?.user?._id?.toString();
  const userPermissions = auth?.user?.permissions?.permissions || [];

  const [selectedMonth, setSelectedMonth] = useState(
    location.state?.month || new Date().toLocaleString("en-US", { month: "long" }),
  );

  const canManageTeam =
    userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KRA.value) ||
    userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KPA.value);
  const isEmployeeLevel = !canManageTeam;

  const { isTop } = useTopDepartment({
    additionalTopUserIds: ["67b83885daad0f7bab2f1888"],
  });

  const currentMonthIndex = fiscalMonths.findIndex(
    (month) => month.toLowerCase() === selectedMonth.toLowerCase(),
  );

  const { data: memberWiseData = [] } = useQuery({
    queryKey: ["performanceMemberWiseKra", selectedDepartment, department, selectedMonth],
    queryFn: async () => {
      let departmentId = selectedDepartment;

      if (!departmentId && department) {
        const departmentResponse = await axios.get("/api/performance/get-depts-tasks");
        const matchedDepartment = departmentResponse.data?.find(
          (item) => item.department?.name === department,
        );
        departmentId = matchedDepartment?.department?._id;
      }

      if (!departmentId) return [];

      const settledResponses = await Promise.allSettled([
        axios.get(`/api/users/assignees?deptId=${departmentId}`),
        axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=KRA`),
        axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=INDIVIDUALKRA`),
        axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=TEAMKRA`),
        axios.get(`/api/performance/get-completed-tasks?dept=${departmentId}&type=KRA`),
        axios.get(`/api/performance/get-completed-tasks?dept=${departmentId}&type=INDIVIDUALKRA`),
        axios.get(`/api/performance/get-completed-tasks?dept=${departmentId}&type=TEAMKRA`),
      ]);

      const [
        assigneesResponse,
        kraResponse,
        individualKraResponse,
        teamKraResponse,
        completedKraResponse,
        completedIndividualKraResponse,
        completedTeamKraResponse,
      ] = settledResponses;

      const getResponseData = (response) =>
        response?.status === "fulfilled" ? response.value?.data || [] : [];

      const normalizeName = (value) =>
        (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();

      const map = new Map();
      const memberIdByName = new Map();

      const assignees = getResponseData(assigneesResponse);
      assignees.forEach((member) => {
        const memberId = member?.id?.toString();
        if (!memberId) return;

        const memberName = member?.name || "Unknown";
        map.set(memberId, {
          memberId,
          member: memberName,
          ...DEFAULT_COUNTS,
        });
        memberIdByName.set(normalizeName(memberName), memberId);
      });

      const upsert = (task, field) => {
        const userId = task.assignToId || task.assignedTo || "unassigned";
        const userName = (task.assignedTo || "Unassigned").replace(/\s+/g, " ").trim();

        if (!map.has(userId)) {
          map.set(userId, {
            memberId: userId,
            member: userName,
            ...DEFAULT_COUNTS,
          });
        }

        map.get(userId)[field] += 1;
      };

      const incrementPendingKra = (task) => {
        const taskDate = new Date(task?.assignedDate);
        if (Number.isNaN(taskDate.getTime())) return;

        const fiscalMonth = getFiscalMonthFromDate(task?.assignedDate);
        if (!fiscalMonth || fiscalMonth.toLowerCase() !== selectedMonth.toLowerCase()) {
          return;
        }

        if (task?.status === "Completed") return;

        const userId = task.assignToId || task.assignedTo || "unassigned";
        const userName = (task.assignedTo || "Unassigned").replace(/\s+/g, " ").trim();

        if (!map.has(userId)) {
          map.set(userId, {
            memberId: userId,
            member: userName,
            ...DEFAULT_COUNTS,
          });
        }

        map.get(userId).pendingKra += 1;
      };

      const incrementCompletedKra = (task) => {
        const fiscalMonth = getFiscalMonthFromDate(task?.completionDate);
        if (!fiscalMonth || fiscalMonth.toLowerCase() !== selectedMonth.toLowerCase()) {
          return;
        }

        const completedByName = task?.completedBy?.replace(/\s+/g, " ").trim();
        if (!completedByName) return;

        const matchedMemberId =
          memberIdByName.get(normalizeName(completedByName)) || completedByName;

        if (!map.has(matchedMemberId)) {
          map.set(matchedMemberId, {
            memberId: matchedMemberId,
            member: completedByName,
            ...DEFAULT_COUNTS,
          });
        }

        map.get(matchedMemberId).completedKra += 1;
      };

      getResponseData(kraResponse)
        .filter((task) => isTaskInSelectedMonth(task, selectedMonth))
        .forEach((task) => upsert(task, "dailyKra"));

      getResponseData(individualKraResponse)
        .filter((task) => isTaskInSelectedMonth(task, selectedMonth))
        .forEach((task) => upsert(task, "individualDailyKra"));

      getResponseData(teamKraResponse)
        .filter((task) => isTaskInSelectedMonth(task, selectedMonth))
        .forEach((task) => upsert(task, "teamDailyKra"));

      getResponseData(kraResponse).forEach(incrementPendingKra);
      getResponseData(individualKraResponse).forEach(incrementPendingKra);
      getResponseData(teamKraResponse).forEach(incrementPendingKra);

      getResponseData(completedKraResponse).forEach(incrementCompletedKra);
      getResponseData(completedIndividualKraResponse).forEach(incrementCompletedKra);
      getResponseData(completedTeamKraResponse).forEach(incrementCompletedKra);

      const mergedByMemberName = Array.from(map.values()).reduce((acc, item) => {
        const nameKey = normalizeName(item.member);
        if (!acc[nameKey]) {
          acc[nameKey] = { ...item };
          return acc;
        }

        acc[nameKey] = {
          ...acc[nameKey],
          dailyKra: (acc[nameKey].dailyKra || 0) + (item.dailyKra || 0),
          individualDailyKra:
            (acc[nameKey].individualDailyKra || 0) + (item.individualDailyKra || 0),
          teamDailyKra: (acc[nameKey].teamDailyKra || 0) + (item.teamDailyKra || 0),
          completedKra: (acc[nameKey].completedKra || 0) + (item.completedKra || 0),
          pendingKra: (acc[nameKey].pendingKra || 0) + (item.pendingKra || 0),
        };
        return acc;
      }, {});

      return Object.values(mergedByMemberName);
    },
  });

  const rowData = useMemo(() => {
    const filteredData = isEmployeeLevel
      ? memberWiseData.filter((item) => item?.memberId?.toString() === loggedInUserId)
      : memberWiseData;

    return filteredData.map((item, index) => ({
      srNo: index + 1,
      ...item,
    }));
  }, [isEmployeeLevel, loggedInUserId, memberWiseData]);

  const visibleRowData = useMemo(() => {
    if (!isEmployeeLevel || canManageTeam || isTop) return rowData;

    const normalize = (value) =>
      (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();

    const ownRows = rowData.filter(
      (item) =>
        item?.memberId?.toString() === loggedInUserId ||
        normalize(item?.member) === normalize(loggedInUserName),
    );

    if (ownRows.length > 0) return ownRows;

    return [
      {
        srNo: 1,
        memberId: loggedInUserId,
        member: loggedInUserName || "You",
        ...DEFAULT_COUNTS,
      },
    ];
  }, [canManageTeam, isEmployeeLevel, isTop, loggedInUserId, loggedInUserName, rowData]);

  const columns = [
    { headerName: "Sr No", field: "srNo", width: 100 },
    {
      headerName: "Member",
      field: "member",
      flex: 1,
      cellRenderer: (params) => {
        const memberId = params?.data?.memberId?.toString();
        const isOwnRow = memberId && loggedInUserId === memberId;
        const isClickable = canManageTeam || isOwnRow;

        const handleMemberNavigation = () => {
          if (!isClickable) return;

          const targetDepartmentId = selectedDepartment || currentDepartmentId;
          const targetDepartmentName =
            selectedDepartmentName || department || currentDepartmentName;

          dispatch(setSelectedDepartment(targetDepartmentId));
          dispatch(setSelectedDepartmentName(targetDepartmentName));

          let firstTab = "individual-Daily-KRA";
          if (canManageTeam && !isOwnRow) {
            firstTab = "team-Daily-KRA";
          }

          navigate(`/app/performance/${targetDepartmentName}/${firstTab}`);
        };

        return (
          <span
            role={isClickable ? "button" : undefined}
            onClick={handleMemberNavigation}
            className={`font-pregular ${
              isClickable
                ? "text-primary hover:underline cursor-pointer"
                : "text-gray-500 cursor-not-allowed"
            }`}
          >
            {params.value}
          </span>
        );
      },
    },
    { headerName: "Department Daily KRA", field: "dailyKra", hide: isEmployeeLevel },
    { headerName: "Individual Daily KRA", field: "individualDailyKra" },
    { headerName: "Team Daily KRA", field: "teamDailyKra", hide: isEmployeeLevel },
  ];

  const graphData = [
    {
      name: "Completed KRA",
      group: `KRA - ${selectedMonth}`,
      data: visibleRowData.map((item) => ({
        x: item.member,
        y: item.completedKra || 0,
      })),
    },
    {
      name: "Pending KRA",
      group: `KRA - ${selectedMonth}`,
      data: visibleRowData.map((item) => ({
        x: item.member,
        y: item.pendingKra || 0,
      })),
    },
  ];

  const totalCompleted = visibleRowData.reduce(
    (sum, item) => sum + (item.completedKra || 0),
    0,
  );

  const totalPending = visibleRowData.reduce(
    (sum, item) => sum + (item.pendingKra || 0),
    0,
  );

  const graphOptions = {
    chart: {
      type: "bar",
      stacked: true,
      animations: { enabled: false },
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "24%", borderRadius: 3 },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 1, colors: ["#fff"] },
    xaxis: {
      title: { text: "Members" },
      categories: visibleRowData.map((item) => item.member),
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

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection
        title={`${selectedDepartmentName || department || "Department"} KRA overview - ${selectedMonth}`}
        border
        padding
        greenTitle="KRA"
        TitleAmountGreen={totalCompleted}
        redTitle="KRA"
        TitleAmountRed={totalPending}
      >
        <NormalBarGraph data={graphData} options={graphOptions} year={false} height={400} />

        <div className="flex justify-center items-center pb-4">
          <div className="flex items-center">
            <SecondaryButton
              title={<MdNavigateBefore />}
              disabled={false}
              handleSubmit={() => {
                const prevIndex =
                  currentMonthIndex === 0 ? fiscalMonths.length - 1 : currentMonthIndex - 1;
                setSelectedMonth(fiscalMonths[prevIndex]);
              }}
            />
            <div className="text-sm min-w-[120px] text-center">{selectedMonth}</div>
            <SecondaryButton
              title={<MdNavigateNext />}
              disabled={false}
              handleSubmit={() => {
                const nextIndex =
                  currentMonthIndex === fiscalMonths.length - 1 ? 0 : currentMonthIndex + 1;
                setSelectedMonth(fiscalMonths[nextIndex]);
              }}
            />
          </div>
        </div>
      </WidgetSection>

      <PageFrame>
        <WidgetSection layout={1} padding>
          <AgTable
            data={visibleRowData}
            columns={columns}
            tableTitle={`${selectedDepartmentName || department || "Department"} - MEMBER WISE PENDING KRA`}
            hideFilter
          />
        </WidgetSection>
      </PageFrame>
    </div>
  );
};

export default PerformanceMemberWiseKra;