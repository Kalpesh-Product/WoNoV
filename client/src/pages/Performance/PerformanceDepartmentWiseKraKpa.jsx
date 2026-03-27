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
    const userDepartmentIds =
        auth?.user?.departments?.map((dept) => dept?._id?.toString()).filter(Boolean) || [];

    const { isTop } = useTopDepartment({
        additionalTopUserIds: ["67b83885daad0f7bab2f1888"],
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

    const visibleDepartments = fetchedDepartments.filter((item) => {
        if (isTop) return true;
        return userDepartmentIds.includes(item?.department?._id?.toString());
    });

    return (
        <div className="flex flex-col gap-4">
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
                        tableTitle="DEPARTMENT WISE KRA/KPA"
                        hideFilter
                    />
                </WidgetSection>
            </PageFrame>
        </div>
    );
};

export default PerformanceDepartmentWiseKraKpa;