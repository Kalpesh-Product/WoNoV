import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AgTable from "../../components/AgTable";
import PageFrame from "../../components/Pages/PageFrame";
import WidgetSection from "../../components/WidgetSection";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import {
    setSelectedDepartment,
    setSelectedDepartmentName,
} from "../../redux/slices/performanceSlice";
import { PERMISSIONS } from "../../constants/permissions";
import { useTopDepartment } from "../../hooks/useTopDepartment";
import NormalBarGraph from "../../components/graphs/NormalBarGraph";

const DEFAULT_COUNTS = {
    dailyKra: 0,
    monthlyKpa: 0,
    individualDailyKra: 0,
    individualMonthlyKpa: 0,
    teamDailyKra: 0,
    teamMonthlyKpa: 0,
};

const PerformanceMemberWiseKraKpa = () => {
    const dispatch = useDispatch();
    const axios = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    const { department } = useParams();
    const { auth } = useAuth();
    const currentDepartmentId = auth.user?.departments?.[0]?._id;
    const currentDepartmentName = auth.user?.departments?.[0]?.name;
    const selectedDepartment = useSelector((state) => state.performance.selectedDepartment);
    const selectedDepartmentName = useSelector(
        (state) => state.performance.selectedDepartmentName
    );
    const loggedInUserId = auth?.user?._id?.toString();
    const userPermissions = auth?.user?.permissions?.permissions || [];
    const selectedMonth =
        location.state?.month ||
        new Date().toLocaleString("en-US", {
            month: "long",
        });
    const canManageTeam =
        userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KRA.value) ||
        userPermissions.includes(PERMISSIONS.PERFORMANCE_TEAM_KPA.value);
    const { isTop } = useTopDepartment({
        additionalTopUserIds: ["67b83885daad0f7bab2f1888"],
    });

    const { data: memberWiseData = [] } = useQuery({
        queryKey: ["performanceMemberWiseKraKpa", selectedDepartment, department],
        queryFn: async () => {
            let departmentId = selectedDepartment;

            if (!departmentId && department) {
                const departmentResponse = await axios.get("/api/performance/get-depts-tasks");
                const matchedDepartment = departmentResponse.data?.find(
                    (item) => item.department?.name === department
                );
                departmentId = matchedDepartment?.department?._id;
            }

            if (!departmentId) return [];
            const settledResponses = await Promise.allSettled([
                axios.get(`/api/users/assignees?deptId=${departmentId}`),
                axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=KRA`),
                axios.get(
                    `/api/performance/get-tasks?dept=${departmentId}&type=KPA&duration=Monthly`
                ),
                axios.get(
                    `/api/performance/get-tasks?dept=${departmentId}&type=INDIVIDUALKRA`
                ),
                axios.get(
                    `/api/performance/get-tasks?dept=${departmentId}&type=INDIVIDUALKPA&duration=Monthly`
                ),
                axios.get(`/api/performance/get-tasks?dept=${departmentId}&type=TEAMKRA`),
                axios.get(
                    `/api/performance/get-tasks?dept=${departmentId}&type=TEAMKPA&duration=Monthly`
                ),
            ]);

            const [
                assigneesResponse,
                kraResponse,
                kpaResponse,
                individualKraResponse,
                individualKpaResponse,
                teamKraResponse,
                teamKpaResponse,
            ] = settledResponses;

            const getResponseData = (response) =>
                response?.status === "fulfilled" ? response.value?.data || [] : [];

            const map = new Map();

            const assignees = getResponseData(assigneesResponse);

            assignees.forEach((member) => {
                const memberId = member?.id?.toString();
                if (!memberId) return;

                map.set(memberId, {
                    memberId,
                    member: member?.name || "Unknown",
                    ...DEFAULT_COUNTS,
                });
            });
            const upsert = (task, field) => {
                const userId = task.assignToId || task.assignedTo || "unassigned";
                const userName = task.assignedTo || "Unassigned";

                if (!map.has(userId)) {
                    map.set(userId, {
                        memberId: userId,
                        member: userName,
                        ...DEFAULT_COUNTS,
                    });
                }

                map.get(userId)[field] += 1;
            };

            getResponseData(kraResponse).forEach((task) => upsert(task, "dailyKra"));
            getResponseData(kpaResponse).forEach((task) => upsert(task, "monthlyKpa"));
            getResponseData(individualKraResponse).forEach((task) =>
                upsert(task, "individualDailyKra")
            );
            getResponseData(individualKpaResponse).forEach((task) =>
                upsert(task, "individualMonthlyKpa")
            );
            getResponseData(teamKraResponse).forEach((task) => upsert(task, "teamDailyKra"));
            getResponseData(teamKpaResponse).forEach((task) => upsert(task, "teamMonthlyKpa"));

            return Array.from(map.values());
        },
    });

    const rowData = useMemo(
        () =>
            memberWiseData.map((item, index) => ({
                srNo: index + 1,
                ...item,
            })),
        [memberWiseData]
    );

    const columns = [
        { headerName: "Sr No", field: "srNo", width: 100 },
        {
            headerName: "Member", field: "member", flex: 1,
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
                    } else if (isTop && isOwnRow) {
                        firstTab = "individual-Daily-KRA";
                    }

                    navigate(`/app/performance/${targetDepartmentName}/${firstTab}`);
                };

                return (
                    <span
                        role={isClickable ? "button" : undefined}
                        onClick={handleMemberNavigation}
                        className={`font-pregular ${isClickable
                            ? "text-primary hover:underline cursor-pointer"
                            : "text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        {params.value}
                    </span>
                );
            },
        },
        { headerName: "Daily KRA", field: "dailyKra" },
        { headerName: "Monthly KPA", field: "monthlyKpa" },
        { headerName: "Individual Daily KRA", field: "individualDailyKra" },
        { headerName: "Individual Monthly KPA", field: "individualMonthlyKpa" },
        { headerName: "Team Daily KRA", field: "teamDailyKra" },
        { headerName: "Team Monthly KPA", field: "teamMonthlyKpa" },
    ];

    const graphData = [
        {
            name: "KRA",
            group: `KRA/KPA - ${selectedMonth}`,
            data: rowData.map((item) => ({
                x: item.member,
                y: item.dailyKra + item.individualDailyKra + item.teamDailyKra,
            })),
        },
        {
            name: "KPA",
            group: `KRA/KPA - ${selectedMonth}`,
            data: rowData.map((item) => ({
                x: item.member,
                y: item.monthlyKpa + item.individualMonthlyKpa + item.teamMonthlyKpa,
            })),
        },
    ];

    const graphOptions = {
        chart: {
            type: "bar",
            stacked: false,
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
            categories: rowData.map((item) => item.member),
        },
        yaxis: {
            title: { text: "Count" },
        },
        colors: ["#5A9BD5", "#54C4A7"],
        fill: { opacity: 1 },
        legend: { position: "top" },
    };

    return (
        <div className="flex flex-col gap-4">
            <PageFrame>
                <WidgetSection
                    title={`${selectedDepartmentName || department || "Department"} KRA/KPA overview - ${selectedMonth}`}
                    border
                    padding
                >
                    <NormalBarGraph data={graphData} options={graphOptions} year={false} height={400} />
                </WidgetSection>
                <WidgetSection layout={1} padding>
                    <AgTable
                        data={rowData}
                        columns={columns}
                        tableTitle={`${selectedDepartmentName || department || "Department"
                            } - MEMBER WISE KRA/KPA`}
                        hideFilter
                    />
                </WidgetSection>
            </PageFrame>
        </div>
    );
};

export default PerformanceMemberWiseKraKpa;