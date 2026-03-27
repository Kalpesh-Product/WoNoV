import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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
    const { department } = useParams();
    const { auth } = useAuth();
    const currentDepartmentId = auth.user?.departments?.[0]?._id;
    const currentDepartmentName = auth.user?.departments?.[0]?.name;
    const selectedDepartment = useSelector((state) => state.performance.selectedDepartment);
    const selectedDepartmentName = useSelector(
        (state) => state.performance.selectedDepartmentName
    );

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

            const [
                kraResponse,
                kpaResponse,
                individualKraResponse,
                individualKpaResponse,
                teamKraResponse,
                teamKpaResponse,
            ] = await Promise.all([
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

            const map = new Map();
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

            kraResponse.data?.forEach((task) => upsert(task, "dailyKra"));
            kpaResponse.data?.forEach((task) => upsert(task, "monthlyKpa"));
            individualKraResponse.data?.forEach((task) => upsert(task, "individualDailyKra"));
            individualKpaResponse.data?.forEach((task) => upsert(task, "individualMonthlyKpa"));
            teamKraResponse.data?.forEach((task) => upsert(task, "teamDailyKra"));
            teamKpaResponse.data?.forEach((task) => upsert(task, "teamMonthlyKpa"));

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
            cellRenderer: (params) => (
                <span
                    role="button"
                    onClick={() => {
                        dispatch(setSelectedDepartment(currentDepartmentId));
                        dispatch(setSelectedDepartmentName(currentDepartmentName));
                        navigate(
                            `/app/performance/${currentDepartmentName}`
                        );
                    }}
                    className="text-primary font-pregular hover:underline cursor-pointer"
                >
                    {params.value}
                </span>
            ),
        },
        { headerName: "Daily KRA", field: "dailyKra" },
        { headerName: "Monthly KPA", field: "monthlyKpa" },
        { headerName: "Individual Daily KRA", field: "individualDailyKra" },
        { headerName: "Individual Monthly KPA", field: "individualMonthlyKpa" },
        { headerName: "Team Daily KRA", field: "teamDailyKra" },
        { headerName: "Team Monthly KPA", field: "teamMonthlyKpa" },
    ];

    return (
        <div className="flex flex-col gap-4">
            <PageFrame>
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