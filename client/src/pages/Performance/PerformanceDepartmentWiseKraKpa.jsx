import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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

const PerformanceDepartmentWiseKraKpa = () => {
    const axios = useAxiosPrivate();
    const { auth } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const currentDepartmentId = auth.user?.departments?.[0]?._id;
    const currentDepartmentName = auth.user?.departments?.[0]?.name;

    useTopDepartment({
        additionalTopUserIds: ["67b83885daad0f7bab2f1888"],
        onNotTop: () => {
            dispatch(setSelectedDepartment(currentDepartmentId));
            dispatch(setSelectedDepartmentName(currentDepartmentName));
            navigate(`/app/performance/${currentDepartmentName}`);
        },
    });

    const { data: fetchedDepartments = [] } = useQuery({
        queryKey: ["fetchedDepartments"],
        queryFn: async () => {
            const response = await axios.get("/api/performance/get-depts-tasks");
            return response.data || [];
        },
    });

    const departmentColumns = [
        { headerName: "Sr No", field: "srNo", width: 100 },
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
                            `/app/performance/overall-KPA/department-wise-KPA/member-wise-kra-kpa/${params.value}`
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
                        data={fetchedDepartments.map((item, index) => ({
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
                        tableTitle="DEPARTMENT WISE KRA/KPA"
                        hideFilter
                    />
                </WidgetSection>
            </PageFrame>
        </div>
    );
};

export default PerformanceDepartmentWiseKraKpa;