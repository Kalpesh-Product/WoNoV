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
    setSelectedMember,
} from "../../redux/slices/performanceSlice";
import { PERMISSIONS } from "../../constants/permissions";
import { useTopDepartment } from "../../hooks/useTopDepartment";
import NormalBarGraph from "../../components/graphs/NormalBarGraph";
import SecondaryButton from "../../components/SecondaryButton";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

// const fiscalMonths = [
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
//   "January",
//   "February",
//   "March",
// ];

const DEFAULT_COUNTS = {
  dailyKra: 0,
  individualDailyKra: 0,
  teamDailyKra: 0,
  completedKra: 0,
  pendingKra: 0,
};

const getDateKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;

};
const getTaskAssignedDateKey = (task) =>
  getDateKey(task?.assignedDate || task?.dueDate || task?.createdAt);

const isTaskScheduledOnOrBeforeDate = (task, selectedDateKey) => {
  const taskDateKey = getTaskAssignedDateKey(task);
  return !!taskDateKey && taskDateKey <= selectedDateKey;
};

// const PerformanceMemberWiseKra = () => {
 const PerformanceMemberWiseKra = ({
  memberDetailsBasePath = "/app/performance/department-KRA/member-wise-KRA",
}) => { 
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

  //const [selectedDate, setSelectedDate] = useState(new Date());
   const initialSelectedDate = useMemo(() => {
    const routedDate = location.state?.date;
    if (!routedDate) return new Date();

    const parsedDate = new Date(routedDate);
    return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  }, [location.state?.date]);
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const selectedDateKey = useMemo(() => getDateKey(selectedDate), [selectedDate]);
  const selectedDateLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    [selectedDate],
  );

  const canManageTeam =
    userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KRA.value) ||
    userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KPA.value);
  const isEmployeeLevel = !canManageTeam;

  const { data: selectedDepartments = [] } = useQuery({
    queryKey: ["performance-selectedDepartments"],
    queryFn: async () => {
      const response = await axios.get("api/company/get-company-data?field=selectedDepartments");
      return response.data?.selectedDepartments || [];
    },
  });

  const selectedDepartmentManagerName = useMemo(() => {
    const normalize = (value) =>
      (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();

    const activeDepartmentName = selectedDepartmentName || department || currentDepartmentName;
    const activeDepartmentId = selectedDepartment?.toString?.() || currentDepartmentId?.toString?.();

    const matchedDepartment = selectedDepartments.find((item) => {
      const itemDepartmentId = item?.department?._id?.toString?.();
      const itemDepartmentName = item?.department?.name;

      return (
        (activeDepartmentId && itemDepartmentId && activeDepartmentId === itemDepartmentId) ||
        (activeDepartmentName &&
          itemDepartmentName &&
          normalize(activeDepartmentName) === normalize(itemDepartmentName))
      );
    });

    return matchedDepartment?.admin || "";
  }, [
    currentDepartmentId,
    currentDepartmentName,
    department,
    selectedDepartment,
    selectedDepartmentName,
    selectedDepartments,
  ]);
  const selectedDepartmentManagerKey = selectedDepartmentManagerName
    .toString()
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  const isTopManagementDepartment = useMemo(() => {
    const normalize = (value) =>
      (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();

    const activeDepartmentName = selectedDepartmentName || department || currentDepartmentName;
    return normalize(activeDepartmentName) === "top management";
  }, [currentDepartmentName, department, selectedDepartmentName]);

  const { isTop } = useTopDepartment({
    additionalTopUserIds: ["67b83885daad0f7bab2f1888"],
  });

  

  const { data: memberWiseData = [] } = useQuery({
    queryKey: [
      "performanceMemberWiseKra",
      selectedDepartment,
      department,
      selectedDateKey,
      selectedDepartmentManagerKey,
    ],
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
        // axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=KRA`),
        // axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=INDIVIDUALKRA`),
        // axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=TEAMKRA`),
         axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=KRA&date=${selectedDateKey}`),
        axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=INDIVIDUALKRA&date=${selectedDateKey}`),
        axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=TEAMKRA&date=${selectedDateKey}`),
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

      const getRoleTitleLabel = (member) => {
        const roleTitles = Array.isArray(member?.roleTitles)
          ? member.roleTitles.filter(Boolean)
          : [];

        if (roleTitles.length > 0) {
          return [...new Set(roleTitles)].join(", ");
        }

        return "Employee";
      };

      const getMemberRole = (memberName, member) => {
        if (isTopManagementDepartment) {
          return getRoleTitleLabel(member);
        }

        return normalizeName(memberName) === normalizeName(selectedDepartmentManagerName)
          ? "Manager"
          : "Employee";
      };

      const map = new Map();
      const memberIdByName = new Map();
      const allowedMemberIds = new Set();

      const assignees = getResponseData(assigneesResponse);
      assignees.forEach((member) => {
        const memberId = member?.id?.toString();
        if (!memberId) return;

        const memberName = member?.name || "Unknown";
        allowedMemberIds.add(memberId);
        map.set(memberId, {
          memberId,
          member: memberName,
          memberRole: getMemberRole(memberName, member),
          ...DEFAULT_COUNTS,
        });
        memberIdByName.set(normalizeName(memberName), memberId);
      });

      const normalizedManagerName = normalizeName(selectedDepartmentManagerName);
      const normalizedLoggedInName = normalizeName(loggedInUserName);
      const selectedDepartmentManagerId = normalizedManagerName
        ? memberIdByName.get(normalizedManagerName) || null
        : null;
      const managerRowId = selectedDepartmentManagerId
        ? selectedDepartmentManagerId
        : normalizedManagerName === normalizedLoggedInName && loggedInUserId
          ? loggedInUserId
          : normalizedManagerName
            ? `manager-${normalizedManagerName}`
            : null;

      if (selectedDepartmentManagerId && map.has(selectedDepartmentManagerId)) {
        map.set(selectedDepartmentManagerId, {
          ...map.get(selectedDepartmentManagerId),
          memberRole: "Manager",
        });
      } else if (managerRowId && !map.has(managerRowId)) {
        map.set(managerRowId, {
          memberId: managerRowId,
          member: selectedDepartmentManagerName,
          memberRole: "Manager",
          ...DEFAULT_COUNTS,
        });
      }

      const resolveMemberId = (task) => {
        const directId = task?.assignToId?.toString?.() || task?.assignedToId?.toString?.();
        if (directId) {
          if (allowedMemberIds.has(directId)) return directId;
          if (managerRowId && directId === managerRowId.toString()) return managerRowId;
        }

        const taskName = (task?.assignedTo || task?.assignTo || "")
          .toString()
          .replace(/\s+/g, " ")
          .trim();
        const normalizedTaskName = normalizeName(taskName);
        const matchedId = memberIdByName.get(normalizedTaskName);
        if (matchedId && allowedMemberIds.has(matchedId)) return matchedId;

        if (
          managerRowId &&
          normalizedManagerName &&
          normalizedTaskName === normalizedManagerName
        ) {
          return managerRowId;
        }

        return null;
      };

      const upsert = (task, field) => {
        const userId = resolveMemberId(task);
        if (!userId) return;

        const userName = (task.assignedTo || task.assignTo || "Unassigned")
          .toString()
          .replace(/\s+/g, " ")
          .trim();

        if (!map.has(userId)) {
          map.set(userId, {
            memberId: userId,
            member: userName,
            memberRole: getMemberRole(userName, {}),
            ...DEFAULT_COUNTS,
          });
        }

        map.get(userId)[field] += 1;
      };

      // const upsertManagerTeamKraCount = (field) => {
          const upsertManagerCount = (field) => {
        const managerId = selectedDepartmentManagerId || managerRowId;
        if (!managerId) return;
        const managerName = selectedDepartmentManagerName || "Manager";

        if (!map.has(managerId)) {
          map.set(managerId, {
            memberId: managerId,
            member: managerName,
            memberRole: getMemberRole(managerName, {}),
            ...DEFAULT_COUNTS,
          });
        }

        map.get(managerId)[field] += 1;
      };

      const incrementPendingKra = (task) => {
        // const assignedDateKey = getDateKey(task?.assignedDate);
        const assignedDateKey = getTaskAssignedDateKey(task);
        if (!assignedDateKey || assignedDateKey !== selectedDateKey) return;

        if (task?.status === "Completed") return;

        const userId = resolveMemberId(task);
        if (!userId) return;
        const userName = (task.assignedTo || task.assignTo || "Unassigned")
          .toString()
          .replace(/\s+/g, " ")
          .trim();

        if (!map.has(userId)) {
          map.set(userId, {
            memberId: userId,
            member: userName,
            memberRole: getMemberRole(userName, {}),
            ...DEFAULT_COUNTS,
          });
        }

        map.get(userId).pendingKra += 1;
      };

      const incrementCompletedKra = (task) => {
        const completionDateKey = getDateKey(task?.completionDate);
        if (!completionDateKey || completionDateKey !== selectedDateKey) return;

        const completedById = task?.completedById?.toString?.();
        const completedByName = (task?.completedBy || "")
          .toString()
          .replace(/\s+/g, " ")
          .trim();
        if (!completedByName) return;

        const matchedMemberId =
          (completedById && (allowedMemberIds.has(completedById) || completedById === managerRowId?.toString())
            ? completedById
            : null) ||
          memberIdByName.get(normalizeName(completedByName)) ||
          (normalizedManagerName === normalizeName(completedByName) ? managerRowId : null) ||
          completedByName;

        if (!map.has(matchedMemberId)) {
          map.set(matchedMemberId, {
            memberId: matchedMemberId,
            member: completedByName,
            memberRole: getMemberRole(completedByName, {}),
            ...DEFAULT_COUNTS,
          });
        }

        map.get(matchedMemberId).completedKra += 1;
      };

      //  getResponseData(kraResponse)
      //   .filter((task) => getDateKey(task?.assignedDate) === selectedDateKey)
      //   .forEach((task) => upsert(task, "dailyKra"));

      // getResponseData(individualKraResponse)
      //   .filter((task) => getDateKey(task?.assignedDate) === selectedDateKey)
      //   .forEach((task) => upsert(task, "individualDailyKra"));

      // getResponseData(teamKraResponse)
      //   .filter((task) => getDateKey(task?.assignedDate) === selectedDateKey)
      //   .forEach((task) => {
      //     if (canManageTeam) {
      //       upsertManagerTeamKraCount("teamDailyKra");
         getResponseData(kraResponse)
        .filter((task) => isTaskScheduledOnOrBeforeDate(task, selectedDateKey))
        .forEach(() => upsertManagerCount("dailyKra"));

      getResponseData(individualKraResponse)
        .filter((task) => isTaskScheduledOnOrBeforeDate(task, selectedDateKey))
        .forEach((task) => upsert(task, "individualDailyKra"));

      getResponseData(teamKraResponse)
        .filter((task) => isTaskScheduledOnOrBeforeDate(task, selectedDateKey))
        .forEach((task) => {
          if (canManageTeam) {
            upsertManagerCount("teamDailyKra");
            const assigneeId = task?.assignToId?.toString?.();
            const assigneeName = normalizeName(task?.assignedTo);
            const managerName = normalizeName(loggedInUserName);
            const isManagerAssignee =
              (assigneeId && assigneeId === loggedInUserId) ||
              (!!assigneeName && !!managerName && assigneeName === managerName);
            if (!isManagerAssignee) {
              upsert(task, "individualDailyKra");
            }
            return;
          }
          upsert(task, "teamDailyKra");
        });

      getResponseData(kraResponse).forEach(incrementPendingKra);
      getResponseData(individualKraResponse).forEach(incrementPendingKra);
      getResponseData(teamKraResponse).forEach(incrementPendingKra);

      // Department Daily KRA completion should roll up to manager in member-wise graph.
      getResponseData(completedKraResponse).forEach((task) => {
        const completionDateKey = getDateKey(task?.completionDate);
        if (!completionDateKey || completionDateKey !== selectedDateKey) return;
        upsertManagerCount("completedKra");
      });
      getResponseData(completedIndividualKraResponse).forEach(incrementCompletedKra);
      getResponseData(completedTeamKraResponse).forEach(incrementCompletedKra);

      const withDerivedPending = Array.from(map.values()).map((item) => {
        const derivedPendingKra =
          (Number(item?.dailyKra) || 0) +
          (Number(item?.individualDailyKra) || 0);

        return {
          ...item,
          // Align graph pending with visible KRA table buckets (excluding team daily KRA).
          pendingKra: derivedPendingKra,
        };
      });

      return withDerivedPending;
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
        memberRole: "Employee",
        ...DEFAULT_COUNTS,
      },
    ];
  }, [
     canManageTeam,
    isEmployeeLevel,
    isTop,
   // isTopManagementDepartment,
    loggedInUserId,
    loggedInUserName,
    rowData,
  ]);

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
        const roleLabel = params?.data?.memberRole || "Employee";

        const handleMemberNavigation = () => {
          if (!isClickable) return;

          const targetDepartmentId = selectedDepartment || currentDepartmentId;
          const targetDepartmentName =
            selectedDepartmentName || department || currentDepartmentName;

          dispatch(setSelectedDepartment(targetDepartmentId));
          dispatch(setSelectedDepartmentName(targetDepartmentName));
         // dispatch(setSelectedMember({ memberId, memberName: params.value }));
          dispatch(
            setSelectedMember({
              memberId,
              memberName: params.value,
              memberRole: params?.data?.memberRole || "Employee",
            }),
          );

          let firstTab = "individual-Daily-KRA";
          if (canManageTeam && !isOwnRow) {
            firstTab = "daily-KRA";
          }

           //  navigate(`/app/performance/department-KRA/member-wise-KRA/${firstTab}`, {
                        navigate(`${memberDetailsBasePath}/${firstTab}`, {
             // state: { selectedMember: { memberId, memberName: params.value } },
              state: {
                selectedMember: {
                  memberId,
                  memberName: params.value,
                  memberRole: params?.data?.memberRole || "Employee",
                },
              },
            });
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
            {params.value}{" "}
            <span className="text-xs text-gray-400">{`- ${roleLabel}`}</span>
          </span>
        );
      },
    },
    { headerName: "Department Daily KRA", field: "dailyKra" },
    { headerName: "Individual Daily KRA", field: "individualDailyKra" },
    { headerName: "Team Daily KRA", field: "teamDailyKra", hide: isEmployeeLevel },
  ];

  const graphData = [
    {
      name: "Completed KRA",
      group: `KRA - ${selectedDateLabel}`,
      data: visibleRowData.map((item) => ({
        x: item.member,
        y: item.completedKra || 0,
      })),
    },
    {
      name: "Pending KRA",
       group: `KRA - ${selectedDateLabel}`,
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
  const totalKraCount = totalCompleted + totalPending;

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
         title={`${selectedDepartmentName || department || "Department"} KRA overview - ${selectedDateLabel}`}
        border
        padding
        TitleAmountTotal={totalKraCount}
        totalTitle="Total"
        greenTitle="KRA"
        TitleAmountGreen={totalCompleted}
        redTitle="KRA"
        TitleAmountRed={totalPending}
      >
        <NormalBarGraph data={graphData} options={graphOptions} year={false} height={400} />

        <div className="flex justify-center items-center pb-4">
          {/* <div className="flex items-center"> */}
           <div className="flex items-center  mt-2">
            <SecondaryButton
              title={<MdNavigateBefore />}
              disabled={false}
              handleSubmit={() => {
               setSelectedDate(
                  (prevDate) =>
                    new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() - 1),
                );
              }}
            />
              {/* <div className="text-sm min-w-[140px] text-center">{selectedDateLabel}</div> */}
               <div className="text-primary text-content font-semibold min-w-[120px] text-center">{selectedDateLabel}</div>
            <SecondaryButton
              title={<MdNavigateNext />}
              disabled={false}
              externalStyles="min-w-20 px-6 py-2 bg-[#9ca3af] text-black font-semibold rounded-lg"
              handleSubmit={() => {
                 setSelectedDate(
                  (prevDate) =>
                    new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 1),
                );
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
            tableTitle={`${selectedDepartmentName || department || "Department"} - MEMBER WISE PENDING KRA - ${selectedDateLabel}`}
            hideFilter
          />
        </WidgetSection>
      </PageFrame>
    </div>
  );
};

export default PerformanceMemberWiseKra;
